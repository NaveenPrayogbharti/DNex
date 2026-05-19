import { supabase } from '../../../lib/supabase';

export type CaseStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Requirement Gathering'
  | 'Interested'
  | 'Not Interested'
  | 'Service Assigned'
  | 'Quotation Sent'
  | 'Payment Pending'
  | 'Payment Completed'
  | 'Document Collection'
  | 'Verification'
  | 'Processing'
  | 'Completed'
  | 'Closed';

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export const CASE_STATUSES: CaseStatus[] = [
  'New Lead',
  'Contacted',
  'Requirement Gathering',
  'Interested',
  'Not Interested',
  'Service Assigned',
  'Quotation Sent',
  'Payment Pending',
  'Payment Completed',
  'Document Collection',
  'Verification',
  'Processing',
  'Completed',
  'Closed',
];

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'New Lead':              { bg: '#e0f2fe', text: '#0369a1', border: '#38bdf8' },
  'Contacted':             { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
  'Requirement Gathering': { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  'Interested':            { bg: '#dcfce7', text: '#15803d', border: '#4ade80' },
  'Not Interested':        { bg: '#fee2e2', text: '#991b1b', border: '#f87171' },
  'Service Assigned':      { bg: '#ede9fe', text: '#5b21b6', border: '#a78bfa' },
  'Quotation Sent':        { bg: '#fff7ed', text: '#c2410c', border: '#fb923c' },
  'Payment Pending':       { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
  'Payment Completed':     { bg: '#d1fae5', text: '#065f46', border: '#34d399' },
  'Document Collection':   { bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
  'Verification':          { bg: '#fce7f3', text: '#9d174d', border: '#f472b6' },
  'Processing':            { bg: '#f5f3ff', text: '#6d28d9', border: '#c4b5fd' },
  'Completed':             { bg: '#ecfdf5', text: '#064e3b', border: '#6ee7b7' },
  'Closed':                { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' },
};

export interface CRMCase {
  id: string;
  case_id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  service_type: string;
  status: CaseStatus;
  priority: CasePriority;
  source: string;
  assigned_to: string | null;
  notes: string | null;
  sla_deadline: string | null;
  // Workflow fields
  requirement_data: Record<string, string> | null;
  not_interested_reason: string | null;
  selected_service: string | null;
  processing_notes: string | null;
  inquiry_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseFilters {
  search?: string;
  status?: string;
  assigned_to?: string;
  service_type?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateCaseInput {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  service_type: string;
  priority?: CasePriority;
  source?: string;
  assigned_to?: string;
  notes?: string;
  sla_deadline?: string;
}

// Generate a unique case ID
function generateCaseId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DNX-${year}-${rand}`;
}

export async function fetchCases(filters?: CaseFilters): Promise<CRMCase[]> {
  let query = supabase
    .from('crm_cases')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to);
  }
  if (filters?.service_type) {
    query = query.eq('service_type', filters.service_type);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    const end = new Date(filters.dateTo);
    end.setDate(end.getDate() + 1);
    query = query.lt('created_at', end.toISOString());
  }
  if (filters?.search) {
    const term = `%${filters.search}%`;
    query = query.or(
      `full_name.ilike.${term},email.ilike.${term},phone.ilike.${term},case_id.ilike.${term}`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CRMCase[];
}

export async function fetchCaseById(id: string): Promise<CRMCase> {
  const { data, error } = await supabase
    .from('crm_cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as CRMCase;
}

export async function createCase(input: CreateCaseInput): Promise<CRMCase> {
  const payload = {
    ...input,
    case_id: generateCaseId(),
    status: 'New Lead' as CaseStatus,
    priority: input.priority ?? 'medium',
    source: input.source ?? 'manual',
  };

  const { data, error } = await supabase
    .from('crm_cases')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  // Auto-log activity for new case
  await supabase.from('crm_activities').insert({
    case_id: (data as CRMCase).id,
    type: 'status_change',
    description: 'Case opened — New Lead',
    performed_by_name: 'System',
    metadata: { status: 'New Lead' },
  });

  return data as CRMCase;
}

export async function updateCaseWorkflowField(
  id: string,
  field: 'requirement_data' | 'not_interested_reason' | 'selected_service' | 'processing_notes',
  value: unknown
): Promise<void> {
  const { error } = await supabase
    .from('crm_cases')
    .update({ [field]: value })
    .eq('id', id);
  if (error) throw error;
}

export async function updateCaseStatus(
  id: string,
  status: CaseStatus,
  performedBy?: string,
  performedByName?: string
): Promise<void> {
  const { error } = await supabase
    .from('crm_cases')
    .update({ status })
    .eq('id', id);

  if (error) throw error;

  // Log activity
  await supabase.from('crm_activities').insert({
    case_id: id,
    type: 'status_change',
    description: `Status changed to "${status}"`,
    performed_by: performedBy,
    performed_by_name: performedByName ?? 'System',
    metadata: { status },
  });
}

export async function updateCase(
  id: string,
  updates: Partial<CRMCase>
): Promise<CRMCase> {
  const { data, error } = await supabase
    .from('crm_cases')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CRMCase;
}

export async function deleteCase(id: string): Promise<void> {
  const { error } = await supabase.from('crm_cases').delete().eq('id', id);
  if (error) throw error;
}

export async function getCaseStats() {
  const { data, error } = await supabase
    .from('crm_cases')
    .select('status, priority, created_at');

  if (error) throw error;
  const all = data ?? [];

  const statusCounts: Record<string, number> = {};
  CASE_STATUSES.forEach(s => { statusCounts[s] = 0; });
  all.forEach(c => {
    if (c.status in statusCounts) statusCounts[c.status]++;
  });

  const paymentCompleted = all.filter(c => c.status === 'Payment Completed').length;
  const newLeads = all.filter(c => c.status === 'New Lead').length;
  const conversionRate = all.length > 0
    ? ((paymentCompleted / all.length) * 100).toFixed(1)
    : '0.0';

  return {
    total: all.length,
    statusCounts,
    conversionRate: parseFloat(conversionRate),
    newLeads,
    paymentCompleted,
    urgent: all.filter(c => c.priority === 'urgent').length,
  };
}
