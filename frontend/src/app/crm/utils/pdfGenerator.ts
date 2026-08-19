import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CRMCase } from '../services/caseService';
import type { QuotationItem } from '../services/quotationService';
import { LOGO_BASE64 } from './logoBase64';

export interface PDFData {
  crmCase: CRMCase;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discountAmt: number;
  discountPct: number;
  total: number;
  validity: number;
  currency: string;
}

export function generateQuotationPDFBase64(data: PDFData): string {
  const { crmCase, items, subtotal, tax, taxRate, discountAmt, discountPct, total, validity, currency } = data;
  
  // Create an A4 PDF
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Define colors
  const navy = '#0A1628';
  const gray = '#334155';
  const lightGray = '#94a3b8';
  const black = '#000000';
  
  // ==========================================
  // HEADER
  // ==========================================
  doc.addImage(LOGO_BASE64, 'PNG', 40, 40, 110, 30);
  
  doc.setFontSize(9);
  doc.setTextColor(gray);
  doc.setFont('helvetica', 'normal');
  doc.text('DNex Consulting', pageWidth - 40, 45, { align: 'right' });
  doc.text('Business Centre, Sharjah Publishing City Free Zone', pageWidth - 40, 58, { align: 'right' });
  doc.text('Sharjah, United Arab Emirates', pageWidth - 40, 71, { align: 'right' });
  doc.text('TRN: 100123456789012', pageWidth - 40, 84, { align: 'right' });
  doc.text('Phone: +971 551251185 | Email: info@dnex.ae', pageWidth - 40, 97, { align: 'right' });
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(40, 120, pageWidth - 40, 120);

  // ==========================================
  // TITLE & METADATA
  // ==========================================
  doc.setFontSize(14);
  doc.setTextColor(navy);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPOSAL FOR PROFESSIONAL SERVICES', 40, 155);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black);
  
  const quoteDate = new Date();
  const validDate = new Date();
  validDate.setDate(validDate.getDate() + validity);
  
  const refNo = `DNX-QT-${Math.floor(1000 + Math.random() * 9000)}`;

  // Metadata block (Right aligned)
  doc.text(`Reference No:`, pageWidth - 160, 150);
  doc.text(`Date:`, pageWidth - 160, 165);
  doc.text(`Valid Until:`, pageWidth - 160, 180);

  doc.setFont('helvetica', 'bold');
  doc.text(refNo, pageWidth - 40, 150, { align: 'right' });
  doc.text(quoteDate.toLocaleDateString(), pageWidth - 40, 165, { align: 'right' });
  doc.text(validDate.toLocaleDateString(), pageWidth - 40, 180, { align: 'right' });

  // ==========================================
  // CLIENT INFO (TO SECTION)
  // ==========================================
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(gray);
  doc.text('TO:', 40, 185);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black);
  doc.text(crmCase.full_name, 40, 200);
  doc.text(crmCase.email, 40, 215);
  if (crmCase.phone) doc.text(crmCase.phone, 40, 230);
  doc.text(crmCase.country || 'United Arab Emirates', 40, crmCase.phone ? 245 : 230);

  // ==========================================
  // SALUTATION & SCOPE
  // ==========================================
  const startY = crmCase.phone ? 280 : 265;
  doc.setFont('helvetica', 'normal');
  doc.text(`Dear ${crmCase.full_name.split(' ')[0]},`, 40, startY);
  
  const introText = 'Thank you for choosing DNex Consulting. We are pleased to submit the following proposal for professional services in connection with your business requirements. Our scope of services and associated professional fees are detailed below:';
  const splitIntro = doc.splitTextToSize(introText, pageWidth - 80);
  doc.text(splitIntro, 40, startY + 20);

  // ==========================================
  // SERVICES TABLE
  // ==========================================
  const tableData = items.map(it => [
    it.description,
    `${it.qty}`,
    `${currency} ${it.rate.toFixed(2)}`,
    `${currency} ${it.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: startY + 20 + (splitIntro.length * 15) + 15,
    head: [['Description of Services', 'Qty', 'Unit Rate', 'Amount']],
    body: tableData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 8, textColor: black },
    headStyles: { fillColor: '#f8fafc', textColor: navy, fontStyle: 'bold', lineWidth: 0.5, lineColor: '#e2e8f0' },
    bodyStyles: { lineWidth: 0.5, lineColor: '#e2e8f0' },
    columnStyles: {
      0: { cellWidth: 260 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 80, halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 40, right: 40 }
  });
  
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY;
  
  // ==========================================
  // TOTALS BLOCK
  // ==========================================
  const totalsX = pageWidth - 200;
  let currentY = finalY + 20;
  
  doc.setFontSize(10);
  doc.setTextColor(gray);
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  doc.text('Professional Fees:', totalsX, currentY);
  doc.text(`${currency} ${subtotal.toFixed(2)}`, pageWidth - 40, currentY, { align: 'right' });
  currentY += 18;
  
  // Discount
  if (discountAmt > 0) {
    doc.text(`Discount (${discountPct}%):`, totalsX, currentY);
    doc.text(`-${currency} ${discountAmt.toFixed(2)}`, pageWidth - 40, currentY, { align: 'right' });
    currentY += 18;
  }
  
  // Tax
  doc.text(`VAT (${taxRate}%):`, totalsX, currentY);
  doc.text(`${currency} ${tax.toFixed(2)}`, pageWidth - 40, currentY, { align: 'right' });
  currentY += 18;
  
  // Total Line
  doc.setDrawColor(navy);
  doc.setLineWidth(1);
  doc.line(totalsX, currentY - 8, pageWidth - 40, currentY - 8);
  
  doc.setFontSize(11);
  doc.setTextColor(navy);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount Due:', totalsX, currentY + 8);
  doc.text(`${currency} ${total.toFixed(2)}`, pageWidth - 40, currentY + 8, { align: 'right' });
  
  doc.line(totalsX, currentY + 18, pageWidth - 40, currentY + 18);
  doc.line(totalsX, currentY + 20, pageWidth - 40, currentY + 20); // Double line for total
  
  currentY += 40;

  // ==========================================
  // TERMS AND SIGNATURES
  // ==========================================
  // Check page break for terms
  if (currentY > doc.internal.pageSize.getHeight() - 250) {
    doc.addPage();
    currentY = 50;
  }

  doc.setFontSize(10);
  doc.setTextColor(navy);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms and Conditions', 40, currentY);
  
  doc.setTextColor(gray);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const terms = [
    '1. This proposal is valid for the period mentioned above. DNex Consulting reserves the right to revise the fees if not accepted within this timeframe.',
    '2. Payment is due in full prior to the commencement of any services.',
    '3. Professional fees mentioned are exclusive of any government fees, external third-party charges, or out-of-pocket expenses unless explicitly stated otherwise.',
    '4. By signing this document, you acknowledge and accept our terms of engagement.'
  ];
  
  let tY = currentY + 15;
  terms.forEach(t => {
    const splitT = doc.splitTextToSize(t, pageWidth - 80);
    doc.text(splitT, 40, tY);
    tY += (splitT.length * 12) + 4;
  });
  
  tY += 40;
  
  // Signature Block
  doc.setFontSize(10);
  doc.setTextColor(black);
  
  // DNex signature
  doc.setFont('helvetica', 'bold');
  doc.text('For and on behalf of DNex Consulting', 40, tY);
  doc.setDrawColor(black);
  doc.setLineWidth(0.5);
  doc.line(40, tY + 40, 220, tY + 40);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', 40, tY + 55);

  // Client signature
  doc.setFont('helvetica', 'bold');
  doc.text('Accepted By Client', pageWidth - 220, tY);
  doc.line(pageWidth - 220, tY + 40, pageWidth - 40, tY + 40);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory / Date', pageWidth - 220, tY + 55);
  
  // ==========================================
  // FOOTER
  // ==========================================
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(lightGray);
  doc.text('This is a computer-generated document. No signature is required for validity unless specified for client acceptance.', pageWidth / 2, pageHeight - 30, { align: 'center' });
  doc.text('DNex Consulting | Business Centre, Sharjah Publishing City Free Zone, Sharjah, UAE', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  // Convert to Base64 (Data URI format)
  const dataUri = doc.output('datauristring');
  
  // Extract just the base64 part for nodemailer
  const base64 = dataUri.split(',')[1];
  return base64;
}
