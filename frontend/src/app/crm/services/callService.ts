import { supabase } from '../../../lib/supabase';

export interface CRMCall {
  id: string;
  case_id: string;
  duration_minutes: number;
  outcome: 'answered' | 'voicemail' | 'no_answer' | 'busy';
  notes: string | null;
  called_by: string | null;
  called_by_name: string | null;
  called_at: string;
}

export async function fetchCalls(caseId: string): Promise<CRMCall[]> {
  const { data, error } = await supabase
    .from('crm_calls')
    .select('*')
    .eq('case_id', caseId)
    .order('called_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CRMCall[];
}

export async function logCall(
  caseId: string,
  call: {
    duration_minutes: number;
    outcome: CRMCall['outcome'];
    notes?: string;
    called_by?: string;
    called_by_name?: string;
  }
): Promise<CRMCall> {
  const { data, error } = await supabase
    .from('crm_calls')
    .insert({ case_id: caseId, ...call })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from('crm_activities').insert({
    case_id: caseId,
    type: 'call',
    description: `Call logged: ${call.duration_minutes}m — ${call.outcome}${call.notes ? ` — ${call.notes}` : ''}`,
    performed_by: call.called_by,
    performed_by_name: call.called_by_name ?? 'Agent',
    metadata: { outcome: call.outcome, duration: call.duration_minutes },
  });

  return data as CRMCall;
}

export const OUTCOME_LABELS: Record<string, string> = {
  answered:  '✅ Answered',
  voicemail: '📱 Voicemail',
  no_answer: '❌ No Answer',
  busy:      '⚡ Busy',
};

export const OUTCOME_COLORS: Record<string, string> = {
  answered:  '#059669',
  voicemail: '#d97706',
  no_answer: '#dc2626',
  busy:      '#9333ea',
};
