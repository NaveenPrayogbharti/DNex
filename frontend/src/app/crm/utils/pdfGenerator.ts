import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CRMCase } from '../services/caseService';
import type { QuotationItem } from '../services/quotationService';

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
  const gold = '#C9963C';
  const navy = '#0A1628';
  const gray = '#64748b';
  
  // HEADER
  doc.setFontSize(24);
  doc.setTextColor(navy);
  doc.setFont('helvetica', 'bold');
  doc.text('DNex Consulting', 40, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(gray);
  doc.setFont('helvetica', 'normal');
  doc.text('Dubai Silicon Oasis', 40, 65);
  doc.text('Dubai, United Arab Emirates', 40, 78);
  doc.text('Website: www.dnex.com', 40, 91);
  doc.text('Phone: +971 4 123 4567', 40, 104);
  
  // TITLE
  doc.setFontSize(28);
  doc.setTextColor(gold);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTE', pageWidth - 40, 50, { align: 'right' });
  
  // METADATA BOX
  doc.setFontSize(10);
  doc.setTextColor(navy);
  doc.text(`DATE`, pageWidth - 140, 75, { align: 'right' });
  doc.text(`QUOTE #`, pageWidth - 140, 90, { align: 'right' });
  doc.text(`CUSTOMER ID`, pageWidth - 140, 105, { align: 'right' });
  doc.text(`VALID UNTIL`, pageWidth - 140, 120, { align: 'right' });
  
  const quoteDate = new Date();
  const validDate = new Date();
  validDate.setDate(validDate.getDate() + validity);
  
  doc.setFont('helvetica', 'normal');
  doc.text(quoteDate.toLocaleDateString(), pageWidth - 40, 75, { align: 'right' });
  doc.text(`DNX-QT-${Math.floor(1000 + Math.random() * 9000)}`, pageWidth - 40, 90, { align: 'right' });
  doc.text(crmCase.case_id || 'N/A', pageWidth - 40, 105, { align: 'right' });
  doc.text(validDate.toLocaleDateString(), pageWidth - 40, 120, { align: 'right' });
  
  // CUSTOMER INFO
  doc.setDrawColor(navy);
  doc.setFillColor(navy);
  doc.rect(40, 135, 250, 15, 'F');
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CUSTOMER', 45, 145);
  
  doc.setTextColor(navy);
  doc.setFont('helvetica', 'normal');
  doc.text(crmCase.full_name, 40, 165);
  doc.text(crmCase.email, 40, 178);
  doc.text(crmCase.phone || '', 40, 191);
  doc.text(crmCase.country || 'United Arab Emirates', 40, 204);
  
  // TABLE
  const tableData = items.map(it => [
    it.description,
    `${currency} ${it.rate.toFixed(2)}`,
    it.qty.toString(),
    `${currency} ${it.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 230,
    head: [['DESCRIPTION', 'UNIT PRICE', 'QTY', 'AMOUNT']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: navy, textColor: '#ffffff', fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 240 },
      1: { cellWidth: 80, halign: 'right' },
      2: { cellWidth: 50, halign: 'center' },
      3: { halign: 'right' }
    },
    margin: { left: 40, right: 40 }
  });
  
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY;
  
  // TOTALS BLOCK
  const totalsX = pageWidth - 200;
  let currentY = finalY + 20;
  
  doc.setFontSize(10);
  doc.setTextColor(navy);
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal', totalsX, currentY);
  doc.text(`${currency} ${subtotal.toFixed(2)}`, pageWidth - 40, currentY, { align: 'right' });
  currentY += 15;
  
  // Discount
  if (discountAmt > 0) {
    doc.text(`Discount (${discountPct}%)`, totalsX, currentY);
    doc.text(`-${currency} ${discountAmt.toFixed(2)}`, pageWidth - 40, currentY, { align: 'right' });
    currentY += 15;
  }
  
  // Tax
  doc.text(`Tax Rate`, totalsX, currentY);
  doc.text(`${taxRate}%`, pageWidth - 40, currentY, { align: 'right' });
  currentY += 15;
  
  doc.text(`Tax Due`, totalsX, currentY);
  doc.text(`${currency} ${tax.toFixed(2)}`, pageWidth - 40, currentY, { align: 'right' });
  currentY += 15;
  
  // Total Line
  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX, currentY - 5, pageWidth - 40, currentY - 5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', totalsX, currentY + 5);
  doc.text(`${currency} ${total.toFixed(2)}`, pageWidth - 40, currentY + 5, { align: 'right' });
  
  // TERMS AND CONDITIONS
  const termsY = finalY + 20;
  doc.setFillColor(navy);
  doc.rect(40, termsY, 250, 15, 'F');
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS AND CONDITIONS', 45, termsY + 10);
  
  doc.setTextColor(navy);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const terms = [
    '1. Customer will be billed after indicating acceptance of this quote',
    '2. Payment will be due prior to delivery of service',
    '3. Fees do not include external government charges unless specified'
  ];
  let tY = termsY + 25;
  terms.forEach(t => {
    doc.text(t, 40, tY);
    tY += 12;
  });
  
  tY += 20;
  doc.setFont('helvetica', 'italic');
  doc.text('Customer Acceptance (sign below):', 40, tY);
  tY += 40;
  doc.line(40, tY, 250, tY); // Signature line
  tY += 12;
  doc.setFont('helvetica', 'normal');
  doc.text('Print Name: ___________________________', 40, tY);
  
  // FOOTER
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text('If you have any questions about this price quote, please contact', pageWidth / 2, 750, { align: 'center' });
  doc.text('DNex Consulting, +971 4 123 4567, billing@dnex.com', pageWidth / 2, 765, { align: 'center' });
  doc.setFont('helvetica', 'bolditalic');
  doc.text('Thank You For Your Business!', pageWidth / 2, 785, { align: 'center' });
  
  // Convert to Base64 (Data URI format)
  const dataUri = doc.output('datauristring');
  
  // Extract just the base64 part for nodemailer
  const base64 = dataUri.split(',')[1];
  return base64;
}
