import { supabase } from '../../../lib/supabase';

export interface CRMTask {
  id: string;
  case_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export async function fetchTasks(caseId?: string): Promise<CRMTask[]> {
  let query = supabase
    .from('crm_tasks')
    .select('*')
    .order('due_date', { ascending: true });

  if (caseId) {
    query = query.eq('case_id', caseId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CRMTask[];
}

export async function createTask(input: Omit<CRMTask, 'id' | 'created_at' | 'updated_at'>): Promise<CRMTask> {
  const { data, error } = await supabase
    .from('crm_tasks')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as CRMTask;
}

export async function updateTask(id: string, updates: Partial<CRMTask>): Promise<CRMTask> {
  const { data, error } = await supabase
    .from('crm_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CRMTask;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('crm_tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function getTaskStats() {
  const { data, error } = await supabase
    .from('crm_tasks')
    .select('status, due_date, priority');

  if (error) throw error;
  const all = data ?? [];
  const now = new Date();

  return {
    total: all.length,
    pending: all.filter(t => t.status === 'pending').length,
    inProgress: all.filter(t => t.status === 'in_progress').length,
    done: all.filter(t => t.status === 'done').length,
    overdue: all.filter(t =>
      t.due_date && new Date(t.due_date) < now && t.status !== 'done'
    ).length,
    urgent: all.filter(t => t.priority === 'urgent' && t.status !== 'done').length,
  };
}
