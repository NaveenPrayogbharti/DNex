import { supabase } from '../../../lib/supabase';
import { CASE_STATUSES } from './caseService';

export interface CRMNotification {
  id: string;
  user_id: string | null;
  case_id: string | null;
  type: 'reminder' | 'payment' | 'document' | 'status' | 'sla' | 'task';
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

export async function fetchNotifications(userId?: string): Promise<CRMNotification[]> {
  let query = supabase
    .from('crm_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CRMNotification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_notifications')
    .update({ read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('crm_notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
}

export async function createNotification(input: {
  user_id?: string;
  case_id?: string;
  type: CRMNotification['type'];
  title: string;
  message?: string;
}): Promise<void> {
  const { error } = await supabase.from('crm_notifications').insert(input);
  if (error) throw error;
}

// ─── Analytics Service ────────────────────────────────────────────────────────

export async function fetchAnalytics() {
  const [casesRes, paymentsRes, tasksRes] = await Promise.all([
    supabase.from('crm_cases').select('status, priority, service_type, assigned_to, created_at, updated_at'),
    supabase.from('crm_payments').select('amount, status, created_at'),
    // crm_tasks is optional — don't crash if it doesn't exist
    supabase.from('crm_tasks').select('status, priority, due_date')
  ]);

  interface CaseRecord {
    status: string;
    priority: string;
    service_type: string;
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
  }

  interface PaymentRecord {
    amount: number | string;
    status: string;
    created_at: string;
  }

  interface TaskRecord {
    status: string;
    priority: string;
    due_date: string;
  }

  const cases = (casesRes.data ?? []) as CaseRecord[];
  const payments = (paymentsRes.data ?? []) as PaymentRecord[];
  const tasks = (tasksRes.data ?? []) as TaskRecord[];

  // Conversion funnel
  const funnel = CASE_STATUSES.map(stage => ({
    stage,
    count: cases.filter(c => c.status === stage).length,
  }));

  // Revenue by month
  const revenueByMonth: Record<string, number> = {};
  payments.filter(p => p.status === 'paid').forEach(p => {
    const key = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    revenueByMonth[key] = (revenueByMonth[key] ?? 0) + Number(p.amount);
  });

  // Cases by service type
  const byService: Record<string, number> = {};
  cases.forEach(c => {
    if (c.service_type) byService[c.service_type] = (byService[c.service_type] ?? 0) + 1;
  });

  // Cases by priority
  const byPriority = {
    low:    cases.filter(c => c.priority === 'low').length,
    medium: cases.filter(c => c.priority === 'medium').length,
    high:   cases.filter(c => c.priority === 'high').length,
    urgent: cases.filter(c => c.priority === 'urgent').length,
  };

  // Total revenue
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((s: number, p) => s + Number(p.amount), 0);

  const pendingRevenue = payments
    .filter(p => p.status === 'pending')
    .reduce((s: number, p) => s + Number(p.amount), 0);

  // Conversion rate
  const paymentCompleted = cases.filter(c =>
    ['Payment Completed', 'Document Collection', 'Verification', 'Processing', 'Completed', 'Closed']
      .includes(c.status)
  ).length;
  const conversionRate = cases.length > 0
    ? parseFloat(((paymentCompleted / cases.length) * 100).toFixed(1))
    : 0;

  // Cases this month vs last month
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthCases = cases.filter(c => new Date(c.created_at) >= thisMonthStart).length;
  const lastMonthCases = cases.filter(c => {
    const d = new Date(c.created_at);
    return d >= lastMonthStart && d < thisMonthStart;
  }).length;

  // Task completion rate
  const taskCompletionRate = tasks.length > 0
    ? parseFloat(((tasks.filter(t => t.status === 'done').length / tasks.length) * 100).toFixed(1))
    : 0;

  return {
    funnel,
    revenueByMonth,
    byService,
    byPriority,
    totalRevenue,
    pendingRevenue,
    conversionRate,
    totalCases: cases.length,
    thisMonthCases,
    lastMonthCases,
    taskCompletionRate,
    totalTasks: tasks.length,
    overdueTasks: tasks.filter(t =>
      t.due_date && new Date(t.due_date) < now && t.status !== 'done'
    ).length,
  };
}
