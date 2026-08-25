/**
 * backend/server/mailer.js
 * ──────────────────────────────────────────────────────────────────────────────
 * DNEX Backend API — Express server handling:
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
const path       = require('path');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const paymentRoutes = require('./routes/paymentRoutes');

// ── Initialise ────────────────────────────────────────────────────────────────

const app    = express();
const prisma = new PrismaClient();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabaseAdmin = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { 'x-my-custom-header': 'dnex' }
      },
      realtime: {
        transport: WebSocket
      }
    }) 
  : null;

if (!supabaseAdmin) {
  console.warn("⚠️ Supabase URL or Key is missing from .env! Admin user creation will be disabled.");
}

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

    const fs = require('fs');
    const logoPath = path.resolve(__dirname, '../../frontend/src/assets/images/website_logo.png');
    for (const { label, to, subject, html, replyTo } of emailPayloads) {
      const mailOptions = {
        from:    process.env.MAIL_USER,
        to,
        subject,
        html,
        replyTo,
        attachments: []
      };

      if (fs.existsSync(logoPath)) {
        mailOptions.attachments.push({
          filename: 'website_logo.png',
          path: logoPath,
          cid: 'dnex-logo',
          contentDisposition: 'inline'
        });
      }
      
      if (label === 'client confirmation') {
        const pdfPath = path.resolve(__dirname, '../../frontend/src/assets/Company Profile A4.pdf');
        if (fs.existsSync(pdfPath)) {
          mailOptions.attachments.push({
            filename: 'DNEX Company Profile A4.pdf',
            path: pdfPath
          });
        }
      }

      transporter.sendMail(mailOptions).then(info => {
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

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client is not configured on this server.' });
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
// PUBLIC PORTAL API (Bypasses RLS)
// ═════════════════════════════════════════════════════════════════════════════

app.get('/api/public/cases/:id', async (req, res) => {
  try {
    const crmCase = await prisma.crm_cases.findUnique({
      where: { id: req.params.id }
    });
    if (!crmCase) return res.status(404).json({ error: 'Case not found' });
    res.json(crmCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/public/documents/:caseId', async (req, res) => {
  try {
    const docs = await prisma.crm_documents.findMany({
      where: { case_id: req.params.caseId },
      orderBy: { created_at: 'desc' }
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/public/documents/upload', async (req, res) => {
  const { caseId, docName, fileName, fileBase64, uploadedByName } = req.body;
  if (!caseId || !docName || !fileBase64 || !fileName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client missing' });
  }

  try {
    // 1. Get next version
    const existing = await prisma.crm_documents.findFirst({
      where: { case_id: caseId, name: docName },
      orderBy: { version: 'desc' }
    });
    const nextVersion = existing ? existing.version + 1 : 1;

    // 2. Decode base64
    const buffer = Buffer.from(fileBase64.split(',')[1] || fileBase64, 'base64');
    const storagePath = `${caseId}/${docName}_v${nextVersion}_${Date.now()}_${fileName}`;

    // 3. Upload to supabase
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('crm-documents')
      .upload(storagePath, buffer, {
        contentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 4. Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('crm-documents')
      .getPublicUrl(storagePath);
    
    // 5. Insert into DB using Prisma
    const newDoc = await prisma.crm_documents.create({
      data: {
        case_id: caseId,
        name: docName,
        file_name: fileName,
        url: urlData.publicUrl,
        version: nextVersion,
        status: 'pending',
        uploaded_by_name: uploadedByName || 'Client'
      }
    });

    res.json(newDoc);
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: err.message });
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
    const fs = require('fs');
    const { PDFDocument } = require('pdf-lib');
    const logoPath = path.resolve(__dirname, '../../frontend/src/assets/images/website_logo.png');
    let emailAttachments = attachments && Array.isArray(attachments) 
      ? attachments.map(a => ({
          filename: a.filename,
          content: a.encoding === 'base64' ? Buffer.from(a.content, 'base64') : a.content,
          contentType: a.contentType
        }))
      : [];

    if (fs.existsSync(logoPath)) {
      emailAttachments.push({
        filename: 'website_logo.png',
        path: logoPath,
        cid: 'dnex-logo',
        contentDisposition: 'inline'
      });
    }
    
    const isQuotation = subject && subject.toLowerCase().includes('quotation');
    const isWelcome = subject && subject.toLowerCase().includes('welcome');
    const pdfPath = path.resolve(__dirname, '../../frontend/src/assets/Company Profile A4.pdf');

    if (isQuotation && fs.existsSync(pdfPath)) {
      // Find the generated quotation attachment from the frontend
      const quotationAttachmentIndex = emailAttachments.findIndex(a => a.filename.toLowerCase().includes('quotation'));
      
      if (quotationAttachmentIndex !== -1) {
        const quotationBuffer = emailAttachments[quotationAttachmentIndex].content;
        const profileBuffer = fs.readFileSync(pdfPath);
        
        try {
          const mergedPdf = await PDFDocument.create();
          
          const profileDoc = await PDFDocument.load(profileBuffer);
          const profilePages = await mergedPdf.copyPages(profileDoc, profileDoc.getPageIndices());
          profilePages.forEach((page) => mergedPdf.addPage(page));
          
          const quoteDoc = await PDFDocument.load(quotationBuffer);
          const quotePages = await mergedPdf.copyPages(quoteDoc, quoteDoc.getPageIndices());
          quotePages.forEach((page) => mergedPdf.addPage(page));
          
          const mergedPdfBytes = await mergedPdf.save();
          
          // Replace the quotation attachment with the merged one
          emailAttachments[quotationAttachmentIndex] = {
            filename: 'DNEX_Quotation.pdf',
            content: Buffer.from(mergedPdfBytes),
            contentType: 'application/pdf'
          };
        } catch (mergeError) {
          console.error('Error merging PDFs:', mergeError);
          // Fallback: attach them separately if merge fails
          emailAttachments.push({
            filename: 'DNEX Company Profile A4.pdf',
            path: pdfPath
          });
        }
      } else {
        emailAttachments.push({
          filename: 'DNEX Company Profile A4.pdf',
          path: pdfPath
        });
      }
    } else if (isWelcome && fs.existsSync(pdfPath)) {
      emailAttachments.push({
        filename: 'DNEX Company Profile A4.pdf',
        path: pdfPath
      });
    }
    
    const info = await transporter.sendMail({
      from:    process.env.MAIL_USER,
      to:      Array.isArray(to) ? to.join(', ') : to,
      subject,
      html:    body,
      replyTo: replyTo ?? process.env.MAIL_REPLY_TO ?? process.env.MAIL_USER,
      attachments: emailAttachments,
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
// QUOTATION CLIENT ACTIONS
// ═════════════════════════════════════════════════════════════════════════════

const renderHtml = (title, message, color) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — DNEX Consulting</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; max-width: 450px; width: 90%; border-top: 4px solid ${color}; }
    h1 { color: #1e293b; margin-top: 0; font-size: 24px; }
    p { color: #64748b; line-height: 1.6; font-size: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>
`;

app.get('/api/quotation/accept', async (req, res) => {
  const { case_id } = req.query;
  if (!case_id) return res.status(400).send('Missing case_id');
  try {
    const c = await prisma.crm_cases.findUnique({ where: { id: case_id } });
    if (!c) return res.status(404).send('Case not found');
    
    // Only update if it's currently Quotation Sent, to avoid overwriting a case that's already processed
    if (c.status === 'Quotation Sent') {
      await prisma.crm_cases.update({
        where: { id: case_id },
        data: { status: 'Payment Pending', updated_at: new Date() }
      });
    }
    res.send(renderHtml('Quotation Accepted', 'Thank you! You have successfully accepted the quotation. Our team will contact you shortly regarding the next steps for payment.', '#10b981'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/quotation/reject', async (req, res) => {
  const { case_id } = req.query;
  if (!case_id) return res.status(400).send('Missing case_id');
  try {
    const c = await prisma.crm_cases.findUnique({ where: { id: case_id } });
    if (!c) return res.status(404).send('Case not found');
    
    if (c.status === 'Quotation Sent') {
      await prisma.crm_cases.update({
        where: { id: case_id },
        data: { status: 'Not Interested', not_interested_reason: 'Client rejected the quotation via email link.', updated_at: new Date() }
      });
    }
    res.send(renderHtml('Quotation Rejected', 'We have received your response. If you have any further questions or require a revised quotation, please reach out to us.', '#ef4444'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
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

// Serve static assets from the frontend build
app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));
// Fallback for client‑side routing (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/dist', 'index.html'));
});

const PORT = process.env.MAILER_PORT ?? 3006;
app.listen(PORT, () => {
  console.log(`\n🚀 DNEX Backend API running on http://localhost:${PORT}`);
  console.log(`   POST /api/leads        — Lead form submissions (Prisma)`);
  console.log(`   GET  /api/leads        — List all leads (Prisma)`);
  console.log(`   POST /api/notify/email — Send CRM emails`);
  console.log(`   GET  /api/health       — Health check\n`);
});

