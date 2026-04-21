import { supabase } from './supabaseClient';

export type InquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Closed';

export interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  service_needed: string;
  message: string;
  created_at: string;
  status: InquiryStatus;
  admin_notes: string | null;
  contacted_at: string | null;
  assigned_to: string | null;
}

export interface InquiryFilters {
  search?: string;
  status?: InquiryStatus | '';
  service?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchInquiries(filters?: InquiryFilters): Promise<Inquiry[]> {
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.service) {
    query = query.eq('service_needed', filters.service);
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    // Add one day to include the full end date
    const endDate = new Date(filters.dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt('created_at', endDate.toISOString());
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(
      `full_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`
    );
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as Inquiry[];
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  const updates: Record<string, unknown> = { status };

  if (status === 'Contacted') {
    updates.contacted_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function updateInquiryNotes(id: string, admin_notes: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ admin_notes })
    .eq('id', id);

  if (error) throw error;
}

export async function updateInquiryAssignment(id: string, assigned_to: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ assigned_to })
    .eq('id', id);

  if (error) throw error;
}

export async function getInquiryStats() {
  const { data, error } = await supabase
    .from('leads')
    .select('status');

  if (error) throw error;

  const all = data ?? [];
  return {
    total: all.length,
    new: all.filter((r) => !r.status || r.status === 'New').length,
    contacted: all.filter((r) => r.status === 'Contacted').length,
    inProgress: all.filter((r) => r.status === 'In Progress').length,
    closed: all.filter((r) => r.status === 'Closed').length,
  };
}
