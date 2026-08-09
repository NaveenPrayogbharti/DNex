const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient();

// Supabase client for storage
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lowydgfaskuytfqinmhd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY; // Fallback to anon key for simplicity if service key not set
const supabase = createClient(supabaseUrl, supabaseKey);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Configure nodemailer for sending receipts
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT ?? '587'),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

/**
 * POST /api/payments/create-order
 * Create a new order with Razorpay
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Amount must be at least 100 paise' });
    }

    const options = {
      amount: Math.round(amount),
      currency,
      receipt: receipt || `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      error: 'Failed to create order', 
      details: error.error ? error.error.description : error.message 
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
 * Generate PDF receipt
 */
const generateReceiptPDF = async (paymentDetails) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Receipt Header
      doc.fontSize(20).text('Payment Receipt', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Receipt ID: ${paymentDetails.id}`);
      doc.moveDown();

      // Payment Details
      doc.fontSize(14).text('Payment Details:', { underline: true });
      doc.fontSize(12).moveDown();
      doc.text(`Amount: ${(paymentDetails.amount).toFixed(2)} ${paymentDetails.currency}`);
      doc.text(`Status: Paid`);
      doc.text(`Razorpay Payment ID: ${paymentDetails.razorpay_payment_id}`);
      doc.text(`Razorpay Order ID: ${paymentDetails.razorpay_order_id}`);
      
      // Footer
      doc.moveDown(4);
      doc.fontSize(10).text('Thank you for your business.', { align: 'center' });
      
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
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Signature verification failed' });
    }
    
    // 1. Mark payment as paid in crm_payments using Prisma Raw SQL (bypasses RLS & missing models)
    await prisma.$executeRaw`UPDATE "crm_payments" SET "status" = 'paid', "paid_at" = NOW(), "razorpay_id" = ${razorpay_payment_id}, "payment_link" = NULL WHERE "id" = ${payment_record_id}::uuid`;

    // 2. Fetch the real case_id if it was missing from the request
    const paymentRecords = await prisma.$queryRaw`SELECT "case_id" FROM "crm_payments" WHERE "id" = ${payment_record_id}::uuid`;
    const actualCaseId = paymentRecords.length > 0 ? paymentRecords[0].case_id : case_id;

    // 3. Generate PDF Receipt
    const pdfBuffer = await generateReceiptPDF({
      id: payment_record_id,
      amount: amount / 100, // amount is in paise
      currency,
      razorpay_payment_id,
      razorpay_order_id
    });

    // 4. Record Activity and Email Receipt
    if (actualCaseId) {
      const metadata = { amount: amount / 100, currency, status: 'paid', razorpay_payment_id };
      await prisma.$executeRaw`INSERT INTO "crm_activities" ("case_id", "type", "description", "metadata") VALUES (${actualCaseId}::uuid, 'payment', 'Payment marked as paid', ${metadata}::jsonb)`;

      const cases = await prisma.$queryRaw`SELECT "email", "full_name" FROM "crm_cases" WHERE "id" = ${actualCaseId}::uuid`;
      const caseData = cases.length > 0 ? cases[0] : null;

      if (caseData && caseData.email) {
        const emailBody = `
          <p>Dear ${caseData.full_name},</p>
          <p>Thank you for your payment of <b>${currency} ${(amount / 100).toFixed(2)}</b>.</p>
          <p>We have successfully received it and your payment receipt is attached to this email.</p>
          <br/>
          <p>Best regards,<br/>DNex Consulting</p>
        `;
        
        try {
          await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: caseData.email,
            subject: 'Payment Receipt - DNex Consulting',
            html: emailBody,
            attachments: [
              {
                filename: `Receipt_${razorpay_payment_id}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          });
          console.log(`Receipt emailed to ${caseData.email}`);
        } catch (mailErr) {
          console.error('Error sending receipt email:', mailErr);
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
