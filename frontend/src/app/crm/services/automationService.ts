import { supabase } from '../../../lib/supabase';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: Record<string, unknown> | null;
  action: string;
  action_data: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

export const AUTOMATION_TRIGGERS = [
  { value: 'payment_success', label: 'Payment Marked as Paid' },
  { value: 'document_upload', label: 'Document Uploaded' },
  { value: 'no_response',     label: 'No Response (24h)' },
  { value: 'stage_change',    label: 'Stage Changed' },
  { value: 'sla_breach',      label: 'SLA Deadline Approaching' },
  { value: 'case_created',    label: 'New Case Created' },
];

export const AUTOMATION_ACTIONS = [
  { value: 'update_status',    label: 'Update Case Status' },
  { value: 'send_notification',label: 'Send Notification' },
  { value: 'create_task',      label: 'Create Task' },
  { value: 'send_reminder',    label: 'Send Reminder' },
];

export async function fetchAutomationRules(): Promise<AutomationRule[]> {
  const { data, error } = await supabase
    .from('crm_automation_rules')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as AutomationRule[];
}

export async function createAutomationRule(input: Omit<AutomationRule, 'id' | 'created_at'>): Promise<AutomationRule> {
  const { data, error } = await supabase
    .from('crm_automation_rules')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as AutomationRule;
}

export async function updateAutomationRule(id: string, updates: Partial<AutomationRule>): Promise<void> {
  const { error } = await supabase
    .from('crm_automation_rules')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAutomationRule(id: string): Promise<void> {
  const { error } = await supabase.from('crm_automation_rules').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Process automation rules for a given trigger event.
 * Call this from wherever the trigger happens (payment update, doc upload, etc.)
 */
export async function processAutomations(
  trigger: string,
  context: {
    caseId: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const { data: rules, error } = await supabase
    .from('crm_automation_rules')
    .select('*')
    .eq('trigger', trigger)
    .eq('is_active', true);

  if (error || !rules) return;

  for (const rule of rules) {
    try {
      if (rule.action === 'update_status' && rule.action_data?.status) {
        await supabase
          .from('crm_cases')
          .update({ status: rule.action_data.status })
          .eq('id', context.caseId);

        await supabase.from('crm_activities').insert({
          case_id: context.caseId,
          type: 'system',
          description: `[Auto] Status → "${rule.action_data.status}" via rule "${rule.name}"`,
          metadata: { rule_id: rule.id, trigger },
        });
      }

      if (rule.action === 'send_notification') {
        await supabase.from('crm_notifications').insert({
          case_id: context.caseId,
          user_id: context.userId,
          type: 'status',
          title: rule.name,
          message: rule.action_data?.message as string ?? `Automation triggered: ${rule.name}`,
        });
      }

      if (rule.action === 'create_task' && rule.action_data?.title) {
        await supabase.from('crm_tasks').insert({
          case_id: context.caseId,
          title: rule.action_data.title as string,
          description: rule.action_data.description as string ?? '',
          priority: rule.action_data.priority as string ?? 'medium',
          status: 'pending',
        });
      }
    } catch (e) {
      console.error(`[Automation] Rule "${rule.name}" failed:`, e);
    }
  }
}

// Default rules to seed on first use
export const DEFAULT_AUTOMATION_RULES = [
  {
    name: 'Payment Success → Document Collection',
    trigger: 'payment_success',
    condition: null,
    action: 'update_status',
    action_data: { status: 'Document Collection' },
    is_active: true,
  },
  {
    name: 'Document Upload → Move to Verification',
    trigger: 'document_upload',
    condition: null,
    action: 'update_status',
    action_data: { status: 'Verification' },
    is_active: true,
  },
  {
    name: 'No Response 24h → Send Reminder',
    trigger: 'no_response',
    condition: null,
    action: 'send_notification',
    action_data: { message: 'This lead has not been contacted in 24 hours.' },
    is_active: true,
  },
  {
    name: 'New Case → Notify Team',
    trigger: 'case_created',
    condition: null,
    action: 'send_notification',
    action_data: { message: 'A new case has been created and needs assignment.' },
    is_active: true,
  },
];
