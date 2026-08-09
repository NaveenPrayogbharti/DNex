/**
 * backend/server/mailer.js
 * ──────────────────────────────────────────────────────────────────────────────
 * DNex Backend API — Express server handling:
 *   • POST /api/leads          — Public lead form submissions (via Prisma → Supabase)
 *   • GET  /api/leads          — Admin: list all leads
 *   • POST /api/notify/email   — CRM email sender (via Nodemailer)
 *   • GET  /api/health         — Health check
 *
 * Setup (run from backend/):
 *   npm install
 *   npm run dev
 * ──────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const paymentRoutes = require('./routes/paymentRoutes');

// ── Initialise ────────────────────────────────────────────────────────────────

const app    = express();
const prisma = new PrismaClient();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Increase body size limit to 50 MB to support base64-encoded file attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || origin.startsWith('http://localhost') || origin === 'https://dnex.ae' || origin === 'https://www.dnex.ae') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
);

// ── Nodemailer ────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   parseInt(process.env.MAIL_PORT ?? '587'),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
  name: process.env.MAIL_HOST,
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Mail server connection failed:', error.message);
  } else {
    console.log('✅ Mail server connected. Ready to send.');
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// LEADS API
// ═════════════════════════════════════════════════════════════════════════════

const INTERNAL_NOTIFY_EMAIL = process.env.MAIL_NOTIFY_TO ?? process.env.MAIL_USER;

app.post('/api/leads', async (req, res) => {
  const { full_name, email, phone, country, service_needed, message } = req.body;

  if (!full_name || !email || !phone || !country || !service_needed) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const lead = await prisma.leads.create({
      data: {
        full_name, email, phone, country, service_needed,
        message: message ?? '',
        status: 'New',
      },
    });

    console.log(`📋 New lead: ${full_name} <${email}> — ${service_needed}`);

    // ── Fire emails (non-blocking — DB save already succeeded) ───────────────
    
    // Helper to fetch template and inject variables
    const getTemplate = async (name, vars) => {
      try {
        const result = await prisma.$queryRawUnsafe(`SELECT subject, body FROM system_templates WHERE name = $1 LIMIT 1`, name);
        if (result.length > 0) {
          let { subject, body } = result[0];
          for (const [key, val] of Object.entries(vars)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            subject = subject.replace(regex, val || '');
            body = body.replace(regex, val || '');
          }
          return { subject, html: body };
        }
      } catch(e) { console.error('Error fetching template', e); }
      return null;
    };

    const clientTpl = await getTemplate('Client Confirmation', { full_name, service_needed, phone, country });
    const internalTpl = await getTemplate('Internal Lead Alert', { 
      full_name, email, phone, country, service_needed, 
      message: message || '—', 
      date_time: new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}) 
    });

    const emailPayloads = [];
    if (clientTpl) {
      emailPayloads.push({
        label: 'client confirmation',
        to: email,
        subject: clientTpl.subject,
        html: clientTpl.html,
        replyTo: INTERNAL_NOTIFY_EMAIL,
      });
    }
    if (internalTpl) {
      emailPayloads.push({
        label: 'internal lead alert',
        to: INTERNAL_NOTIFY_EMAIL,
        subject: internalTpl.subject,
        html: internalTpl.html,
        replyTo: email,
      });
    }

    for (const { label, to, subject, html, replyTo } of emailPayloads) {
      transporter.sendMail({
        from:    process.env.MAIL_USER,
        to,
        subject,
        html,
        replyTo,
      }).then(info => {
        console.log(`📧 ${label} email sent: ${info.messageId} → ${to}`);
      }).catch(err => {
        console.error(`❌ ${label} email failed (lead still saved):`, err.message);
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    return res.status(201).json({ success: true, lead });
  } catch (err) {
    console.error('❌ Lead insert failed:', err.message);
    return res.status(500).json({ error: 'Failed to save enquiry. Please try again.' });
  }
});

/**
 * GET /api/leads
 * Admin endpoint — returns all leads ordered by newest first.
 * Add authentication middleware here before going to production.
 */
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await prisma.leads.findMany({
      orderBy: { created_at: 'desc' },
    });
    return res.json({ leads });
  } catch (err) {
    console.error('❌ Leads fetch failed:', err.message);
    return res.status(500).json({ error: 'Failed to fetch leads.' });
  }
});

/**
 * POST /api/admin/create-user
 * Secure endpoint to create a user in Supabase Auth and admin_users table
 */
app.post('/api/admin/create-user', async (req, res) => {
  const { name, email, role, password } = req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Create user in Supabase Auth using the admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm the email
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // 2. Insert the user into the admin_users table via Prisma raw SQL
    // (Bypassing RLS entirely since we are using backend db connection)
    await prisma.$executeRawUnsafe(`
      INSERT INTO admin_users (id, name, email, role)
      VALUES ($1::uuid, $2, $3, $4)
    `, userId, name, email, role);

    return res.status(201).json({ success: true, user: { id: userId, email, name, role } });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * POST /api/subscribe
 * Public endpoint — receives newsletter subscription emails and notifies the team.
 */
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    console.log(`📩 New subscriber: ${email}`);

    // Notify the internal team
    transporter.sendMail({
      from: process.env.MAIL_USER,
      to: INTERNAL_NOTIFY_EMAIL,
      subject: `🔔 New Newsletter Subscriber`,
      text: `A new user has subscribed to the newsletter: ${email}`,
      replyTo: email,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing subscription:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// EMAIL API
// ═════════════════════════════════════════════════════════════════════════════

app.post('/api/notify/email', async (req, res) => {
  const { to, subject, body, replyTo, attachments } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
  }

  try {
    const info = await transporter.sendMail({
      from:    process.env.MAIL_USER,
      to:      Array.isArray(to) ? to.join(', ') : to,
      subject,
      html:    body,
      replyTo: replyTo ?? process.env.MAIL_REPLY_TO ?? process.env.MAIL_USER,
      attachments: attachments ?? [],
    });

    console.log(`📧 Email sent: ${info.messageId} → ${to}`);
    return res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═════════════════════════════════════════════════════════════════════════════

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dnex-backend', db: 'prisma', ts: new Date().toISOString() });
});

// ═════════════════════════════════════════════════════════════════════════════
// PAYMENT API
// ═════════════════════════════════════════════════════════════════════════════

app.use('/api/payments', paymentRoutes);

// ═════════════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═════════════════════════════════════════════════════════════════════════════

process.on('SIGINT',  async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });

// ═════════════════════════════════════════════════════════════════════════════
// START
// ═════════════════════════════════════════════════════════════════════════════

const path = require('path');
// Serve static assets from the frontend build
app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));
// Fallback for client‑side routing (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/dist', 'index.html'));
});

const PORT = process.env.MAILER_PORT ?? 3006;
app.listen(PORT, () => {
  console.log(`\n🚀 DNex Backend API running on http://localhost:${PORT}`);
  console.log(`   POST /api/leads        — Lead form submissions (Prisma)`);
  console.log(`   GET  /api/leads        — List all leads (Prisma)`);
  console.log(`   POST /api/notify/email — Send CRM emails`);
  console.log(`   GET  /api/health       — Health check\n`);
});

