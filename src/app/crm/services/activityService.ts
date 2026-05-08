import { supabase } from '../../../lib/supabase';

export interface CRMActivity {
  id: string;
  case_id: string;
  type: 'status_change' | 'note' | 'call' | 'payment' | 'document' | 'message' | 'task' | 'system';
  description: string;
  performed_by: string | null;
  performed_by_name: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export async function fetchActivities(caseId: string): Promise<CRMActivity[]> {
  const { data, error } = await supabase
    .from('crm_activities')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CRMActivity[];
}

export async function addActivity(
  caseId: string,
  type: CRMActivity['type'],
  description: string,
  performedBy?: string,
  performedByName?: string,
  metadata?: Record<string, unknown>
): Promise<CRMActivity> {
  const { data, error } = await supabase
    .from('crm_activities')
    .insert({
      case_id: caseId,
      type,
      description,
      performed_by: performedBy,
      performed_by_name: performedByName ?? 'System',
      metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CRMActivity;
}

export const ACTIVITY_ICONS: Record<string, string> = {
  status_change: '🔄',
  note:          '📝',
  call:          '📞',
  payment:       '💰',
  document:      '📄',
  message:       '💬',
  task:          '✅',
  system:        '⚙️',
};

export const ACTIVITY_COLORS: Record<string, string> = {
  status_change: '#C9963C',
  note:          '#6366f1',
  call:          '#059669',
  payment:       '#0369a1',
  document:      '#7c3aed',
  message:       '#db2777',
  task:          '#d97706',
  system:        '#6b7280',
};
