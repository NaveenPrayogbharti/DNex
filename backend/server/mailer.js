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
app.use(
  cors({
    origin: [
      process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
      'https://dnex.ae',
      'https://www.dnex.ae',
    ],
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
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Mail server connection failed:', error.message);
  } else {
    console.log('✅ Mail server connected. Ready to send.');
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Branded confirmation email sent to the client after they submit the lead form.
 */
function clientConfirmationHtml({ full_name, service_needed, phone, country }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>We've received your enquiry — DNex</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr>
          <td style="background:#0D2137;padding:32px 40px;text-align:center">
            <h1 style="margin:0;color:#C9963C;font-size:26px;letter-spacing:1px">DNex</h1>
            <p style="margin:4px 0 0;color:#94a3b8;font-size:13px">Business Setup Consultants</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px">
            <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0D2137">Hi ${full_name},</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7">
              Thank you for reaching out to DNex! We have received your consultation request and
              one of our senior business setup experts will contact you within
              <strong>4 business hours</strong>.
            </p>

            <!-- Summary box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8fafc;border-left:4px solid #C9963C;border-radius:6px;padding:0">
              <tr><td style="padding:20px 24px">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0D2137;text-transform:uppercase;letter-spacing:.5px">Your Enquiry Summary</p>
                <table cellpadding="0" cellspacing="0">
                  <tr><td style="padding:3px 0;font-size:13px;color:#64748b;width:140px">Service Requested</td>
                      <td style="padding:3px 0;font-size:13px;color:#0D2137;font-weight:600">${service_needed}</td></tr>
                  <tr><td style="padding:3px 0;font-size:13px;color:#64748b">Country</td>
                      <td style="padding:3px 0;font-size:13px;color:#0D2137;font-weight:600">${country}</td></tr>
                  <tr><td style="padding:3px 0;font-size:13px;color:#64748b">Phone / WhatsApp</td>
                      <td style="padding:3px 0;font-size:13px;color:#0D2137;font-weight:600">${phone}</td></tr>
                </table>
              </td></tr>
            </table>

            <p style="margin:28px 0 8px;font-size:15px;color:#475569;line-height:1.7">
              While you wait, feel free to reach out to us directly:
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="padding:3px 0;font-size:13px;color:#64748b;width:80px">📞 UAE</td>
                  <td style="font-size:13px;color:#0D2137">+971 55 554 2841</td></tr>
              <tr><td style="padding:3px 0;font-size:13px;color:#64748b">📞 India</td>
                  <td style="font-size:13px;color:#0D2137">+91 88517 42425</td></tr>
              <tr><td style="padding:3px 0;font-size:13px;color:#64748b">💬 WhatsApp</td>
                  <td style="font-size:13px"><a href="https://wa.me/971555542841" style="color:#C9963C">+971 55 554 2841</a></td></tr>
              <tr><td style="padding:3px 0;font-size:13px;color:#64748b">✉️ Email</td>
                  <td style="font-size:13px"><a href="mailto:info@dnex.ae" style="color:#C9963C">info@dnex.ae</a></td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0D2137;padding:20px 40px;text-align:center">
            <p style="margin:0;font-size:12px;color:#64748b">
              © ${new Date().getFullYear()} DNex Business Consultants · Dubai, UAE ·
              <a href="https://dnex.ae" style="color:#C9963C;text-decoration:none">dnex.ae</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * Internal lead-alert email sent to the DNex team whenever a new lead arrives.
 */
function internalLeadAlertHtml({ full_name, email, phone, country, service_needed, message }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Lead — DNex</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
        <tr><td style="background:#0D2137;padding:24px 32px">
          <h2 style="margin:0;color:#C9963C;font-size:18px">🔔 New Lead Received</h2>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:12px">${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
            ${[
              ['Name',    full_name],
              ['Email',   `<a href="mailto:${email}" style="color:#C9963C">${email}</a>`],
              ['Phone',   `<a href="tel:${phone}" style="color:#C9963C">${phone}</a>`],
              ['Country', country],
              ['Service', service_needed],
              ['Message', message || '—'],
            ].map(([k, v]) => `
            <tr>
              <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0;width:130px">${k}</td>
              <td style="padding:8px 12px;font-size:13px;color:#0D2137;border:1px solid #e2e8f0">${v}</td>
            </tr>`).join('')}
          </table>
          <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">Reply to this email to contact the lead directly.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// LEADS API
// ═════════════════════════════════════════════════════════════════════════════

/** Internal DNex team inbox — receives a notification on every new lead. */
const INTERNAL_NOTIFY_EMAIL = process.env.MAIL_NOTIFY_TO ?? process.env.MAIL_USER;

/**
 * POST /api/leads
 * Public endpoint — receives lead form data, saves to `leads` table via Prisma,
 * then fires two emails:
 *   1. Confirmation email → client (acknowledges receipt)
 *   2. Alert email        → DNex team inbox (full lead details)
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

    // ── Fire emails (non-blocking — DB save already succeeded) ───────────────
    const emailPayloads = [
      {
        label: 'client confirmation',
        to:      email,
        subject: `We've received your enquiry — DNex`,
        html:    clientConfirmationHtml({ full_name, service_needed, phone, country }),
        replyTo: INTERNAL_NOTIFY_EMAIL,
      },
      {
        label: 'internal lead alert',
        to:      INTERNAL_NOTIFY_EMAIL,
        subject: `🔔 New Lead: ${full_name} — ${service_needed}`,
        html:    internalLeadAlertHtml({ full_name, email, phone, country, service_needed, message }),
        replyTo: email,
      },
    ];

    for (const { label, to, subject, html, replyTo } of emailPayloads) {
      transporter.sendMail({
        from:    `"DNex Business Setup" <${process.env.MAIL_USER}>`,
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
      from:    `"DNex Business Setup" <${process.env.MAIL_USER}>`,
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

const PORT = process.env.MAILER_PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 DNex Backend API running on http://localhost:${PORT}`);
  console.log(`   POST /api/leads        — Lead form submissions (Prisma)`);
  console.log(`   GET  /api/leads        — List all leads (Prisma)`);
  console.log(`   POST /api/notify/email — Send CRM emails`);
  console.log(`   GET  /api/health       — Health check\n`);
});
