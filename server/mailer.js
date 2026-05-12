/**
 * server/mailer.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Backend API handler — runs on your server (Node.js / Express or standalone).
 * Receives email requests from the CRM and sends them via your server mailbox.
 *
 * PREREQUISITES:
 *   npm install nodemailer express cors dotenv
 *
 * USAGE:
 *   node server/mailer.js
 *   (Keep running with pm2: pm2 start server/mailer.js --name dnex-mailer)
 * ──────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());

// ── CORS: only allow requests from your own domain ────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
  methods: ['POST'],
}));

// ── Nodemailer transporter using your server mail account ─────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,        // e.g. mail.yourdomain.com
  port: parseInt(process.env.MAIL_PORT ?? '587'),
  secure: process.env.MAIL_SECURE === 'true',  // true for port 465, false for others
  auth: {
    user: process.env.MAIL_USER,      // e.g. crm@yourdomain.com
    pass: process.env.MAIL_PASS,      // Your email account password
  },
  tls: {
    rejectUnauthorized: false,        // Set to true in production with valid cert
  },
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Mail server connection failed:', error.message);
    console.error('   Check MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS in .env');
  } else {
    console.log('✅ Mail server connected. Ready to send.');
  }
});

// ── POST /api/notify/email ─────────────────────────────────────────────────────
app.post('/api/notify/email', async (req, res) => {
  const { to, subject, body, replyTo } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
  }

  try {
    const info = await transporter.sendMail({
      from: `"DNex Business Setup" <${process.env.MAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html: body,
      replyTo: replyTo ?? process.env.MAIL_REPLY_TO ?? process.env.MAIL_USER,
    });

    console.log(`📧 Email sent: ${info.messageId} → ${to}`);
    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'dnex-mailer' }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.MAILER_PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`🚀 DNex Mailer API running on port ${PORT}`);
});
