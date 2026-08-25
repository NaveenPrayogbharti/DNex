/**
 * emailNotificationService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Sends CRM email notifications through your server mail account.
 *
 * HOW IT WORKS:
 *  1. This service calls an API endpoint (POST /api/notify/email) on your backend.
 *  2. The backend uses Nodemailer with your server SMTP credentials to send emails.
 *  3. See the setup guide: EMAIL_NOTIFICATION_SETUP.md for full configuration steps.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Configuration ────────────────────────────────────────────────────────────
// These values are read from .env — set them according to your mail server.
const MAIL_API_URL = import.meta.env.VITE_MAIL_API_URL ?? '/api/notify/email';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmailPayload {
  to: string | string[];        // Recipient(s)
  subject: string;
  body: string;                 // HTML body
  replyTo?: string;
  attachments?: { filename: string; content: string; encoding?: string; contentType?: string }[];
}

import { LOGO_BASE64 } from '../utils/logoBase64';

export type NotificationTrigger =
  | 'case_opened'
  | 'quotation_sent'
  | 'payment_link_sent'
  | 'payment_received'
  | 'document_approved'
  | 'service_completed'
  | 'status_change';

export interface CRMNotificationPayload {
  trigger: NotificationTrigger;
  caseId: string;
  caseName: string;            // Client full name
  clientEmail: string;
  agentEmail?: string;         // Agent email for internal copies
  details?: Record<string, string | number>;
}

// ── Internal Mailer ───────────────────────────────────────────────────────────

export async function sendCustomEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(MAIL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[EmailNotification] API error:', err);
      return { success: false, error: err };
    }

    return { success: true };
  } catch (e) {
    console.error('[EmailNotification] Network error:', e);
    return { success: false, error: String(e) };
  }
}

// ── Templates ────────────────────────────────────────────────────────────────

function baseTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #ffffff; padding: 28px 32px; border-bottom: 1px solid #e2e8f0; }
    .header h1 { color: #C9963C; margin: 0; font-size: 22px; letter-spacing: -0.5px; }
    .header p { color: #64748b; font-size: 13px; margin: 4px 0 0; }
    .body { padding: 28px 32px; }
    .body h2 { color: #0A1628; font-size: 17px; margin: 0 0 12px; }
    .body p { color: #475569; line-height: 1.7; margin: 8px 0; font-size: 14px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .info-box .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .info-box .row:last-child { border-bottom: none; }
    .info-box .label { color: #64748b; font-weight: 600; }
    .info-box .value { color: #1e293b; }
    .cta-btn { display: inline-block; margin: 20px 0 0; padding: 12px 28px; background: linear-gradient(135deg, #C9963C, #E8B85E); color: #0A1628; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="cid:dnex-logo" alt="DNEX Logo" style="height: 48px; object-fit: contain; margin-bottom: 8px;" />
      <p>Official Communication</p>
    </div>
    <div class="body">
      <h2>${title}</h2>
      ${body}
    </div>
    <div class="footer">
      DNEX Business Setup Consulting &bull; Dubai, UAE<br/>
      This is an automated notification. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ── Notification Functions ────────────────────────────────────────────────────

/**
 * Notify client that their case has been opened and an agent will contact them.
 */
export async function notifyCaseOpened(payload: CRMNotificationPayload) {
  const subject = `Your Inquiry Has Been Received — ${payload.caseName}`;
  const body = `
    <p>Dear <strong>${payload.caseName}</strong>,</p>
    <p>Thank you for reaching out to <strong>DNEX Business Setup</strong>. We have received your inquiry and one of our consultants will be in touch with you shortly.</p>
    <div class="info-box">
      <div class="row"><span class="label">Case Reference</span><span class="value">${payload.caseId}</span></div>
      <div class="row"><span class="label">Service</span><span class="value">${payload.details?.service ?? 'Consultation'}</span></div>
      <div class="row"><span class="label">Status</span><span class="value">Under Review</span></div>
    </div>
    <p>If you have any urgent queries, please contact us at <strong>info@dnexbusiness.com</strong>.</p>
  `;

  return sendCustomEmail({
    to: payload.clientEmail,
    subject,
    body: baseTemplate('Inquiry Received', body),
  });
}

/**
 * Send quotation notification to client.
 */
export async function notifyQuotationSent(payload: CRMNotificationPayload) {
  const subject = `Your Quotation is Ready — ${payload.caseName}`;
  const body = `
    <p>Dear <strong>${payload.caseName}</strong>,</p>
    <p>Your quotation for <strong>${payload.details?.service ?? 'our services'}</strong> has been prepared. Please find the details below:</p>
    <div class="info-box">
      <div class="row"><span class="label">Quotation No.</span><span class="value">${payload.details?.quotationNumber ?? '—'}</span></div>
      <div class="row"><span class="label">Service</span><span class="value">${payload.details?.service ?? '—'}</span></div>
      <div class="row"><span class="label">Amount</span><span class="value">AED ${payload.details?.amount ?? '—'}</span></div>
      <div class="row"><span class="label">Valid Until</span><span class="value">${payload.details?.validUntil ?? '30 days'}</span></div>
    </div>
    <p>Please review the quotation and confirm your acceptance. Our team will reach out to you with next steps.</p>
  `;

  return sendCustomEmail({
    to: payload.clientEmail,
    subject,
    body: baseTemplate('Quotation Ready', body),
  });
}

/**
 * Send payment link notification to client.
 */
export async function notifyPaymentLink(payload: CRMNotificationPayload) {
  const subject = `Payment Required — ${payload.caseName}`;
  const body = `
    <p>Dear <strong>${payload.caseName}</strong>,</p>
    <p>Your service is confirmed! Please complete your payment to proceed.</p>
    <div class="info-box">
      <div class="row"><span class="label">Service</span><span class="value">${payload.details?.service ?? '—'}</span></div>
      <div class="row"><span class="label">Amount Due</span><span class="value">AED ${payload.details?.amount ?? '—'}</span></div>
    </div>
    ${payload.details?.paymentLink
      ? `<a class="cta-btn" href="${payload.details.paymentLink}">Pay Now</a>`
      : '<p>Please contact us to complete your payment.</p>'
    }
    <p style="margin-top:16px;font-size:12px;color:#94a3b8;">Payment link expires in 48 hours.</p>
  `;

  // Also CC the agent
  const to: string[] = [payload.clientEmail];
  if (payload.agentEmail) to.push(payload.agentEmail);

  return sendCustomEmail({
    to,
    subject,
    body: baseTemplate('Payment Required', body),
  });
}

/**
 * Notify agent when a new lead comes in from the website.
 */
export async function notifyNewLeadReceived(payload: CRMNotificationPayload) {
  if (!payload.agentEmail) return { success: false, error: 'No agent email' };

  const subject = `🔔 New Lead: ${payload.caseName}`;
  const body = `
    <p>A new lead has just been submitted via the website.</p>
    <div class="info-box">
      <div class="row"><span class="label">Name</span><span class="value">${payload.caseName}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${payload.clientEmail}</span></div>
      <div class="row"><span class="label">Service</span><span class="value">${payload.details?.service ?? '—'}</span></div>
      <div class="row"><span class="label">Country</span><span class="value">${payload.details?.country ?? '—'}</span></div>
      <div class="row"><span class="label">Case ID</span><span class="value">${payload.caseId}</span></div>
    </div>
    <p>Log in to the CRM to manage this case.</p>
  `;

  return sendCustomEmail({
    to: payload.agentEmail,
    subject,
    body: baseTemplate('New Lead Received', body),
  });
}

/**
 * General status change notification.
 */
export async function notifyStatusChange(payload: CRMNotificationPayload) {
  const subject = `Case Update — ${payload.caseName}`;
  const body = `
    <p>Dear <strong>${payload.caseName}</strong>,</p>
    <p>There is an update on your case with DNEX Business Setup.</p>
    <div class="info-box">
      <div class="row"><span class="label">Case Reference</span><span class="value">${payload.caseId}</span></div>
      <div class="row"><span class="label">New Status</span><span class="value">${payload.details?.status ?? '—'}</span></div>
    </div>
    <p>Our team will keep you informed of further progress. Feel free to reach out if you have any questions.</p>
  `;

  return sendCustomEmail({
    to: payload.clientEmail,
    subject,
    body: baseTemplate('Case Update', body),
  });
}
