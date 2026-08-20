const express = require('express');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const Razorpay = require('razorpay');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient();

let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('Razorpay keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing from .env!');
    }
    razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpay;
};



/**
 * POST /api/payments/create-order
 * Create a Razorpay order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    
    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }

    const options = {
      amount: Math.round(amount), // Frontend already multiplies by 100 (in paise)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const order = await getRazorpay().orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      error: 'Failed to create payment order',
      details: error.message 
    });
  }
});

/**
 * GET /api/payments/:id
 * Fetch payment details by ID (bypasses Supabase RLS for public checkout)
 */
router.get('/:id', async (req, res) => {
  try {
    const payment = await prisma.crm_payments.findUnique({
      where: { id: req.params.id }
    });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment details', details: error.message, stack: error.stack });
  }
});

/**
 * Generate Professional PDF receipt
 */
const generateReceiptPDF = async (paymentDetails, caseData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Try to load logo if exists
      const logoPath = path.join(__dirname, '../../../frontend/src/assets/images/crm_ogo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 40, { width: 110 });
      }

      // Header Text
      doc.fontSize(9).fillColor('#334155').font('Helvetica')
         .text('DNex Consulting', 200, 45, { align: 'right' })
         .text('Business Centre, Sharjah Publishing City Free Zone', 200, 58, { align: 'right' })
         .text('Sharjah, United Arab Emirates', 200, 71, { align: 'right' })
         .text('TRN: 100123456789012', 200, 84, { align: 'right' })
         .text('Phone: +971 551251185 | Email: info@dnex.ae', 200, 97, { align: 'right' });

      doc.moveTo(40, 130).lineTo(555, 130).strokeColor('#e2e8f0').lineWidth(1).stroke();

      // Title
      doc.fontSize(14).fillColor('#0A1628').font('Helvetica-Bold')
         .text('PAYMENT RECEIPT', 40, 160);

      // Metadata
      doc.fontSize(10).font('Helvetica').fillColor('#000000')
         .text(`Receipt No:`, 400, 160)
         .text(`Date:`, 400, 175)
         .font('Helvetica-Bold')
         .text(`RCPT-${paymentDetails.id.split('-')[0].toUpperCase()}`, 470, 160)
         .text(new Date().toLocaleDateString(), 470, 175);

      // Client info
      doc.fontSize(10).fillColor('#334155').font('Helvetica-Bold').text('RECEIVED FROM:', 40, 210);
      doc.font('Helvetica').fillColor('#000000');
      if (caseData) {
        doc.text(caseData.full_name, 40, 225);
        doc.text(caseData.email, 40, 240);
      } else {
        doc.text('Valued Client', 40, 225);
      }

      // Details Table
      doc.moveTo(40, 280).lineTo(555, 280).strokeColor('#e2e8f0').stroke();
      doc.font('Helvetica-Bold').fillColor('#0A1628').text('Description of Services', 50, 290);
      doc.text('Amount', 400, 290, { align: 'right', width: 145 });
      doc.moveTo(40, 310).lineTo(555, 310).strokeColor('#e2e8f0').stroke();

      doc.font('Helvetica').fillColor('#000000').text(`Payment for Professional Services`, 50, 330, { width: 330 });
      doc.fontSize(9).fillColor('#64748b').text(`Razorpay ID: ${paymentDetails.razorpay_payment_id}`, 50, 345, { width: 330 });
      doc.fontSize(10).fillColor('#000000').text(`${paymentDetails.currency} ${(paymentDetails.amount).toFixed(2)}`, 400, 330, { align: 'right', width: 145 });

      doc.moveTo(40, 380).lineTo(555, 380).strokeColor('#0A1628').stroke();

      doc.font('Helvetica-Bold').fillColor('#0A1628').text('Total Paid:', 300, 400);
      doc.fontSize(12).text(`${paymentDetails.currency} ${(paymentDetails.amount).toFixed(2)}`, 400, 399, { align: 'right', width: 145 });

      doc.rect(400, 430, 100, 30).fillAndStroke('#ecfdf5', '#10b981');
      doc.fillColor('#059669').fontSize(14).font('Helvetica-Bold').text('PAID', 400, 438, { width: 100, align: 'center' });

      // Footer
      doc.fontSize(8).font('Helvetica-Oblique').fillColor('#94a3b8')
         .text('Thank you for your business. This is a computer-generated receipt.', 40, 780, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * POST /api/payments/verify-payment
 * Verify signature, update DB, generate receipt, send email
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      payment_record_id, // our DB crm_payments id
      case_id,
      amount,
      currency
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !payment_record_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpaySecret) {
      return res.status(500).json({ error: 'Razorpay secret key is not configured on this server.' });
    }
    const hmac = crypto.createHmac('sha256', razorpaySecret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Signature verification failed' });
    }
    
    // 1. Mark payment as paid in crm_payments using Prisma Raw SQL
    await prisma.$executeRaw`UPDATE "crm_payments" SET "status" = 'paid', "paid_at" = NOW(), "razorpay_id" = ${razorpay_payment_id}, "payment_link" = NULL WHERE "id" = ${payment_record_id}::uuid`;

    // 2. Fetch the real case_id if it was missing from the request
    const paymentRecords = await prisma.$queryRaw`SELECT "case_id" FROM "crm_payments" WHERE "id" = ${payment_record_id}::uuid`;
    const actualCaseId = paymentRecords.length > 0 ? paymentRecords[0].case_id : case_id;

    // We fetch case data here for both PDF generation and email
    let caseData = null;
    if (actualCaseId) {
      const cases = await prisma.$queryRaw`SELECT "email", "full_name" FROM "crm_cases" WHERE "id" = ${actualCaseId}::uuid`;
      caseData = cases.length > 0 ? cases[0] : null;
    }

    // 3. Generate Professional PDF Receipt
    const pdfBuffer = await generateReceiptPDF({
      id: payment_record_id,
      amount: parseFloat(amount), // Amount is correct directly from frontend
      currency,
      razorpay_payment_id,
      razorpay_order_id
    }, caseData);

    // 4. Record Activity and Email Receipt
    if (actualCaseId) {
      const metadata = { amount: parseFloat(amount), currency, status: 'paid', razorpay_payment_id };
      await prisma.$executeRaw`INSERT INTO "crm_activities" ("case_id", "type", "description", "metadata") VALUES (${actualCaseId}::uuid, 'payment', 'Payment marked as paid', ${metadata}::jsonb)`;

      if (caseData && caseData.email) {
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #0A1628;">Payment Successful</h2>
            <p>Dear ${caseData.full_name},</p>
            <p>Thank you for your payment of <strong style="color: #0A1628; font-size: 16px;">${currency} ${parseFloat(amount).toFixed(2)}</strong>.</p>
            <p>We have successfully received your payment. Please find your official payment receipt attached to this email as a PDF.</p>
            <br/>
            <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br/><strong>DNex Consulting</strong></p>
          </div>
        `;
        
        try {
          // Use the main mailer API to guarantee consistency with Quotation emails
          const emailRes = await fetch(`http://localhost:${process.env.PORT || 3006}/api/notify/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: caseData.email,
              subject: 'Payment Receipt - DNex Consulting',
              body: emailBody,
              attachments: [{
                filename: `Receipt_${razorpay_payment_id}.pdf`,
                content: pdfBuffer.toString('base64'),
                encoding: 'base64',
                contentType: 'application/pdf'
              }]
            })
          });
          
          if (!emailRes.ok) {
            console.error('Failed to send email via API:', await emailRes.text());
          } else {
            console.log(`Receipt emailed successfully to ${caseData.email} via API`);
          }
        } catch (mailErr) {
          console.error('Error sending receipt email via API:', mailErr);
        }
      }
    }

    res.json({ 
      success: true, 
      payment_id: razorpay_payment_id 
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

module.exports = router;
