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

// ── Initialise ────────────────────────────────────────────────────────────────

const app    = express();
const prisma = new PrismaClient();

app.use(express.json());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

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

/**
 * POST /api/leads
 * Public endpoint — receives lead form data, saves to `leads` table via Prisma.
 * No authentication required (this is the public enquiry form).
 */
app.post('/api/leads', async (req, res) => {
  const { full_name, email, phone, country, service_needed, message } = req.body;

  // Basic validation
  if (!full_name || !email || !phone || !country || !service_needed) {
    return res.status(400).json({
      error: 'Missing required fields: full_name, email, phone, country, service_needed',
    });
  }

  try {
    const lead = await prisma.leads.create({
      data: {
        full_name,
        email,
        phone,
        country,
        service_needed,
        message:  message ?? '',
        status:   'New',
      },
    });

    console.log(`📋 New lead: ${full_name} <${email}> — ${service_needed}`);
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

// ═════════════════════════════════════════════════════════════════════════════
// EMAIL API
// ═════════════════════════════════════════════════════════════════════════════

app.post('/api/notify/email', async (req, res) => {
  const { to, subject, body, replyTo } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
  }

  try {
    const info = await transporter.sendMail({
      from:    `"DNex Business Setup" <${process.env.MAIL_USER}>`,
      to:      Array.isArray(to) ? to.join(', ') : to,
      subject,
      html:    body,
      replyTo: replyTo ?? process.env.MAIL_REPLY_TO ?? process.env.MAIL_USER,
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
// GRACEFUL SHUTDOWN
// ═════════════════════════════════════════════════════════════════════════════

process.on('SIGINT',  async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });

// ═════════════════════════════════════════════════════════════════════════════
// START
// ═════════════════════════════════════════════════════════════════════════════

const PORT = process.env.MAILER_PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 DNex Backend API running on http://localhost:${PORT}`);
  console.log(`   POST /api/leads        — Lead form submissions (Prisma)`);
  console.log(`   GET  /api/leads        — List all leads (Prisma)`);
  console.log(`   POST /api/notify/email — Send CRM emails`);
  console.log(`   GET  /api/health       — Health check\n`);
});
