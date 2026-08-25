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
 * GET /api/payments/:id/invoice
 * Serve the Invoice PDF
 */
router.get('/:id/invoice', async (req, res) => {
  try {
    const payment = await prisma.crm_payments.findUnique({
      where: { id: req.params.id }
    });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    let caseData = null;
    let quotationItems = null;
    let quotationData = null;
    if (payment.case_id) {
      const cases = await prisma.$queryRaw`SELECT "email", "full_name" FROM "crm_cases" WHERE "id" = ${payment.case_id}::uuid`;
      if (cases.length > 0) caseData = cases[0];
      
      const qs = await prisma.$queryRaw`SELECT "items", "subtotal", "tax_rate", "tax", "discount", "total" FROM "crm_quotations" WHERE "case_id" = ${payment.case_id}::uuid ORDER BY "created_at" DESC LIMIT 1`;
      if (qs.length > 0) {
        quotationData = qs[0];
        quotationItems = qs[0].items;
      }
    }

    const invoiceBuffer = await generateInvoicePDF({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      razorpay_payment_id: payment.razorpay_id,
      razorpay_order_id: payment.razorpay_id
    }, caseData, quotationItems, quotationData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice_${payment.id.split('-')[0].toUpperCase()}.pdf"`);
    res.send(invoiceBuffer);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
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
      const logoPath = path.join(__dirname, '../../../frontend/src/assets/images/website_logo.png');
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
         .text(`Receipt No:`, 350, 160)
         .text(`Date:`, 350, 175)
         .text(`Transaction No:`, 350, 190)
         .font('Helvetica-Bold')
         .text(`RCPT-${paymentDetails.id.split('-')[0].toUpperCase()}`, 440, 160)
         .text(new Date().toLocaleDateString(), 440, 175)
         .text(paymentDetails.razorpay_payment_id || 'N/A', 440, 190);

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

      doc.font('Helvetica').fillColor('#000000').text(paymentDetails.description || 'Payment for Professional Services', 50, 330, { width: 330 });
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
 * Generate Professional Tax Invoice PDF
 */
const generateInvoicePDF = async (paymentDetails, caseData, quotationItems, quotationData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const logoPath = path.join(__dirname, '../../../frontend/src/assets/images/website_logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 40, { width: 110 });
      }

      // Header Text
      doc.fontSize(9).fillColor('#334155').font('Helvetica')
         .text('DNex Consulting FZC', 200, 45, { align: 'right' })
         .text('Business Centre, Sharjah Publishing City Free Zone', 200, 58, { align: 'right' })
         .text('Sharjah, United Arab Emirates', 200, 71, { align: 'right' })
         .text('TRN: 100123456789012', 200, 84, { align: 'right' })
         .text('Phone: +971 551251185 | Email: info@dnex.ae', 200, 97, { align: 'right' });

      doc.moveTo(40, 130).lineTo(555, 130).strokeColor('#e2e8f0').lineWidth(1).stroke();

      // Title
      doc.fontSize(14).fillColor('#0A1628').font('Helvetica-Bold')
         .text('TAX INVOICE', 40, 160);

      // Metadata
      doc.fontSize(10).font('Helvetica').fillColor('#000000')
         .text(`Invoice No:`, 350, 160)
         .text(`Date:`, 350, 175)
         .text(`Transaction No:`, 350, 190)
         .font('Helvetica-Bold')
         .text(`INV-${paymentDetails.id.split('-')[0].toUpperCase()}`, 440, 160)
         .text(new Date().toLocaleDateString(), 440, 175)
         .text(paymentDetails.razorpay_payment_id || 'N/A', 440, 190);

      // Client info
      doc.fontSize(10).fillColor('#334155').font('Helvetica-Bold').text('BILLED TO:', 40, 210);
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
      doc.text('Qty', 320, 290, { align: 'center', width: 40 });
      doc.text('Unit Rate', 370, 290, { align: 'right', width: 80 });
      doc.text('Amount', 460, 290, { align: 'right', width: 85 });
      doc.moveTo(40, 310).lineTo(555, 310).strokeColor('#e2e8f0').stroke();

      let totalAmount, subtotal, taxAmt;
      if (quotationData && quotationData.total) {
        totalAmount = parseFloat(quotationData.total);
        subtotal = parseFloat(quotationData.subtotal);
        taxAmt = parseFloat(quotationData.tax);
      } else {
        totalAmount = paymentDetails.amount;
        subtotal = totalAmount / 1.05;
        taxAmt = totalAmount - subtotal;
      }

      let itemY = 330;
      doc.font('Helvetica').fillColor('#000000');
      
      if (quotationItems && Array.isArray(quotationItems) && quotationItems.length > 0) {
        quotationItems.forEach(item => {
          doc.text(item.description, 50, itemY, { width: 260 });
          doc.text(item.qty.toString(), 320, itemY, { align: 'center', width: 40 });
          doc.text(`${paymentDetails.currency} ${Number(item.rate).toFixed(2)}`, 370, itemY, { align: 'right', width: 80 });
          doc.font('Helvetica-Bold').text(`${paymentDetails.currency} ${Number(item.amount).toFixed(2)}`, 460, itemY, { align: 'right', width: 85 });
          doc.font('Helvetica').fillColor('#000000');
          itemY += 20;
        });
        
        doc.fontSize(9).fillColor('#64748b').text(`Razorpay ID: ${paymentDetails.razorpay_payment_id}`, 50, itemY, { width: 330 });
        itemY += 20;
      } else {
        doc.fontSize(10).fillColor('#000000');
        doc.text(paymentDetails.description || 'Payment for Professional Services', 50, itemY, { width: 260 });
        doc.text('1', 320, itemY, { align: 'center', width: 40 });
        doc.text(`${paymentDetails.currency} ${subtotal.toFixed(2)}`, 370, itemY, { align: 'right', width: 80 });
        doc.font('Helvetica-Bold').text(`${paymentDetails.currency} ${subtotal.toFixed(2)}`, 460, itemY, { align: 'right', width: 85 });
        doc.font('Helvetica').fillColor('#000000');
        itemY += 20;
        
        doc.fontSize(9).fillColor('#64748b').text(`Razorpay ID: ${paymentDetails.razorpay_payment_id}`, 50, itemY, { width: 330 });
        itemY += 20;
      }

      doc.moveTo(40, itemY + 10).lineTo(555, itemY + 10).strokeColor('#e2e8f0').stroke();

      // Subtotals & Tax
      let currentY = itemY + 30;
      doc.fontSize(10).font('Helvetica').fillColor('#334155').text('Subtotal:', 300, currentY);
      doc.text(`${paymentDetails.currency} ${subtotal.toFixed(2)}`, 400, currentY, { align: 'right', width: 145 });
      
      currentY += 20;

      let taxRateStr = '5%';
      let discountAmt = 0;
      let discountPct = 0;
      
      if (quotationData) {
        if (quotationData.tax_rate !== undefined && quotationData.tax_rate !== null) {
          taxRateStr = `${parseFloat(quotationData.tax_rate)}%`;
        }
        if (quotationData.discount && parseFloat(quotationData.discount) > 0) {
          discountAmt = parseFloat(quotationData.discount);
          discountPct = subtotal > 0 ? (discountAmt / subtotal) * 100 : 0;
        }
      }

      if (discountAmt > 0) {
        doc.text(`Discount (${discountPct.toFixed(0)}%):`, 300, currentY);
        doc.fillColor('#34d399').text(`-${paymentDetails.currency} ${discountAmt.toFixed(2)}`, 400, currentY, { align: 'right', width: 145 });
        doc.fillColor('#334155');
        currentY += 20;
      }

      doc.text(`VAT (${taxRateStr}):`, 300, currentY);
      doc.text(`${paymentDetails.currency} ${taxAmt.toFixed(2)}`, 400, currentY, { align: 'right', width: 145 });

      currentY += 20;
      doc.moveTo(300, currentY).lineTo(555, currentY).strokeColor('#0A1628').stroke();

      currentY += 10;
      doc.font('Helvetica-Bold').fillColor('#0A1628').text('Total (Incl. VAT):', 300, currentY);
      doc.fontSize(12).text(`${paymentDetails.currency} ${totalAmount.toFixed(2)}`, 400, currentY - 1, { align: 'right', width: 145 });

      currentY += 40;
      doc.rect(400, currentY, 100, 30).fillAndStroke('#ecfdf5', '#10b981');
      doc.fillColor('#059669').fontSize(14).font('Helvetica-Bold').text('PAID', 400, currentY + 8, { width: 100, align: 'center' });

      // Footer
      doc.fontSize(8).font('Helvetica-Oblique').fillColor('#94a3b8')
         .text('Thank you for your business. This is a computer-generated tax invoice.', 40, 780, { align: 'center' });

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

    // 2. Fetch the full payment record to get the description and case_id
    const paymentRecords = await prisma.$queryRaw`SELECT * FROM "crm_payments" WHERE "id" = ${payment_record_id}::uuid`;
    const paymentRec = paymentRecords.length > 0 ? paymentRecords[0] : null;
    const actualCaseId = paymentRec ? paymentRec.case_id : case_id;

    // We fetch case data here for both PDF generation and email
    let caseData = null;
    let quotationItems = null;
    let quotationData = null;
    let totalQuotationAmount = 0;
    if (actualCaseId) {
      const cases = await prisma.$queryRaw`SELECT "email", "full_name" FROM "crm_cases" WHERE "id" = ${actualCaseId}::uuid`;
      caseData = cases.length > 0 ? cases[0] : null;
      
      const qs = await prisma.$queryRaw`SELECT "items", "subtotal", "tax_rate", "tax", "discount", "total" FROM "crm_quotations" WHERE "case_id" = ${actualCaseId}::uuid ORDER BY "created_at" DESC LIMIT 1`;
      if (qs.length > 0) {
        quotationData = qs[0];
        quotationItems = qs[0].items;
        totalQuotationAmount = parseFloat(qs[0].total) || 0;
      }
    }

    // Check if fully paid by summing up all 'paid' payments
    const allPays = await prisma.$queryRaw`SELECT SUM(amount) as total_paid FROM "crm_payments" WHERE "case_id" = ${actualCaseId}::uuid AND "status" = 'paid'`;
    const totalPaid = allPays.length > 0 && allPays[0].total_paid ? parseFloat(allPays[0].total_paid) : 0;
    const isFullyPaid = (totalPaid >= totalQuotationAmount && totalQuotationAmount > 0);

    // 3. Generate Professional PDF Receipt and Invoice
    const receiptBuffer = await generateReceiptPDF({
      id: payment_record_id,
      amount: parseFloat(amount),
      currency,
      description: paymentRec ? paymentRec.description : 'Payment for Professional Services',
      razorpay_payment_id,
      razorpay_order_id
    }, caseData);
    
    const invoiceBuffer = await generateInvoicePDF({
      id: payment_record_id,
      amount: parseFloat(amount),
      currency,
      description: paymentRec ? paymentRec.description : 'Payment for Professional Services',
      razorpay_payment_id,
      razorpay_order_id
    }, caseData, quotationItems, quotationData);

    // 4. Record Activity and Email Receipt
    if (actualCaseId) {
      const metadata = { amount: parseFloat(amount), currency, status: 'paid', razorpay_payment_id };
      await prisma.$executeRaw`INSERT INTO "crm_activities" ("case_id", "type", "description", "metadata") VALUES (${actualCaseId}::uuid, 'payment', 'Payment marked as paid', ${metadata}::jsonb)`;

      if (isFullyPaid) {
        await prisma.$executeRaw`UPDATE "crm_cases" SET "status" = 'Payment Completed' WHERE "id" = ${actualCaseId}::uuid AND "status" != 'Payment Completed'`;
        await prisma.$executeRaw`INSERT INTO "crm_activities" ("case_id", "type", "description") VALUES (${actualCaseId}::uuid, 'status_change', 'Status updated to Payment Completed')`;
      }

      if (caseData && caseData.email) {
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #0A1628;">Payment Successful</h2>
            <p>Dear ${caseData.full_name},</p>
            <p>Thank you for your payment of <strong style="color: #0A1628; font-size: 16px;">${currency} ${parseFloat(amount).toFixed(2)}</strong>.</p>
            <p>We have successfully received your payment. Please find your official payment receipt${isFullyPaid ? ' and tax invoice' : ''} attached to this email as a PDF.</p>
            <br/>
            <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br/><strong>DNex Consulting</strong></p>
          </div>
        `;
        
        let attachments = [
          {
            filename: `Receipt_${razorpay_payment_id}.pdf`,
            content: receiptBuffer.toString('base64'),
            encoding: 'base64',
            contentType: 'application/pdf'
          }
        ];

        if (isFullyPaid) {
          attachments.push({
            filename: `Invoice_${payment_record_id.split('-')[0].toUpperCase()}.pdf`,
            content: invoiceBuffer.toString('base64'),
            encoding: 'base64',
            contentType: 'application/pdf'
          });
        }

        try {
          // Use the main mailer API to guarantee consistency with Quotation emails
          const emailRes = await fetch(`http://localhost:${process.env.PORT || 3006}/api/notify/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: caseData.email,
              subject: 'Payment Receipt - DNex Consulting',
              body: emailBody,
              attachments
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
