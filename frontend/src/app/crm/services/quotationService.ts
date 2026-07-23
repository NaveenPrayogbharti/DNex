import { supabase } from '../../../lib/supabase';

export interface QuotationItem {
  service_name?: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface CRMQuotation {
  id: string;
  case_id: string;
  quotation_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_name: string;
  items: QuotationItem[];
  subtotal: number;
  tax_rate: number;
  tax: number;
  discount: number;
  total: number;
  validity_days: number;
  notes: string | null;
  terms: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  sent_via: string[] | null;
  created_at: string;
  updated_at: string;
}

function generateQuotationNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QT-${year}${month}-${rand}`;
}

export async function fetchQuotations(caseId: string): Promise<CRMQuotation[]> {
  const { data, error } = await supabase
    .from('crm_quotations')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CRMQuotation[];
}

export async function createQuotation(
  caseId: string,
  input: {
    client_name: string;
    client_email: string;
    client_phone: string;
    service_name: string;
    items: QuotationItem[];
    tax_rate?: number;
    discount?: number;
    validity_days?: number;
    notes?: string;
    terms?: string;
  }
): Promise<CRMQuotation> {
  const subtotal = input.items.reduce((s, i) => s + i.amount, 0);
  const taxRate = input.tax_rate ?? 0;
  const discount = input.discount ?? 0;
  const tax = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
  const total = parseFloat((subtotal + tax - discount).toFixed(2));

  const { data, error } = await supabase
    .from('crm_quotations')
    .insert({
      case_id: caseId,
      quotation_number: generateQuotationNumber(),
      client_name: input.client_name,
      client_email: input.client_email,
      client_phone: input.client_phone,
      service_name: input.service_name,
      items: input.items,
      subtotal,
      tax_rate: taxRate,
      tax,
      discount,
      total,
      validity_days: input.validity_days ?? 30,
      notes: input.notes ?? null,
      terms: input.terms ?? 'Payment due within 7 days of acceptance. All prices are in AED.',
      status: 'draft',
      sent_via: null,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('crm_activities').insert({
    case_id: caseId,
    type: 'quotation',
    description: `Quotation created: ${(data as CRMQuotation).quotation_number} — AED ${total.toLocaleString()}`,
    metadata: { quotation_number: (data as CRMQuotation).quotation_number, total },
  });

  return data as CRMQuotation;
}

export async function updateQuotationStatus(
  id: string,
  status: CRMQuotation['status'],
  sentVia?: string[]
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (sentVia) updates.sent_via = sentVia;
  const { error } = await supabase.from('crm_quotations').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteQuotation(id: string): Promise<void> {
  const { error } = await supabase.from('crm_quotations').delete().eq('id', id);
  if (error) throw error;
}
