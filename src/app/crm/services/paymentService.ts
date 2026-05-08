import { supabase } from '../../../lib/supabase';

export interface CRMPayment {
  id: string;
  case_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  payment_link: string | null;
  razorpay_id: string | null;
  description: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface CRMInvoice {
  id: string;
  case_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
  notes: string | null;
  created_at: string;
}

export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${rand}`;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function fetchPayments(caseId: string): Promise<CRMPayment[]> {
  const { data, error } = await supabase
    .from('crm_payments')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CRMPayment[];
}

export async function createPayment(
  caseId: string,
  amount: number,
  description?: string,
  currency = 'INR'
): Promise<CRMPayment> {
  // In production: call Razorpay API here to generate payment_link
  const payment_link = `https://razorpay.com/pay/dnex_${Date.now()}`;

  const { data, error } = await supabase
    .from('crm_payments')
    .insert({ case_id: caseId, amount, currency, description, payment_link, status: 'pending' })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('crm_activities').insert({
    case_id: caseId,
    type: 'payment',
    description: `Payment link created: ₹${amount.toLocaleString()}`,
    metadata: { amount, currency, status: 'pending' },
  });

  return data as CRMPayment;
}

export async function updatePaymentStatus(
  id: string,
  status: 'paid' | 'failed',
  razorpayId?: string
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (status === 'paid') {
    updates.paid_at = new Date().toISOString();
    if (razorpayId) updates.razorpay_id = razorpayId;
  }

  const { error } = await supabase.from('crm_payments').update(updates).eq('id', id);
  if (error) throw error;
}

export async function fetchRevenueStats() {
  const { data, error } = await supabase
    .from('crm_payments')
    .select('amount, status, currency, created_at');

  if (error) throw error;
  const all = data ?? [];

  const totalRevenue = all
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pending = all
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Group by month
  const byMonth: Record<string, number> = {};
  all.filter(p => p.status === 'paid').forEach(p => {
    const month = new Date(p.created_at).toLocaleDateString('en-US', {
      month: 'short', year: 'numeric',
    });
    byMonth[month] = (byMonth[month] ?? 0) + Number(p.amount);
  });

  return { totalRevenue, pending, byMonth };
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function fetchInvoices(caseId: string): Promise<CRMInvoice[]> {
  const { data, error } = await supabase
    .from('crm_invoices')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CRMInvoice[];
}

export async function createInvoice(
  caseId: string,
  clientName: string,
  clientEmail: string,
  items: InvoiceItem[],
  taxRate = 18,
  notes?: string
): Promise<CRMInvoice> {
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const tax = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
  const total = subtotal + tax;

  const { data, error } = await supabase
    .from('crm_invoices')
    .insert({
      case_id: caseId,
      invoice_number: generateInvoiceNumber(),
      client_name: clientName,
      client_email: clientEmail,
      items,
      subtotal,
      tax,
      total,
      status: 'draft',
      notes,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('crm_activities').insert({
    case_id: caseId,
    type: 'payment',
    description: `Invoice created: ₹${total.toLocaleString()} (${(data as CRMInvoice).invoice_number})`,
    metadata: { invoice_number: (data as CRMInvoice).invoice_number, total },
  });

  return data as CRMInvoice;
}

export async function updateInvoiceStatus(
  id: string,
  status: 'draft' | 'sent' | 'paid'
): Promise<void> {
  const { error } = await supabase.from('crm_invoices').update({ status }).eq('id', id);
  if (error) throw error;
}
