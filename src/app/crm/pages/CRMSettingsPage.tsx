import { useState, useEffect } from 'react';
import { CRMNavbar } from '../components/CRMNavbar';
import { fetchAutomationRules, createAutomationRule, updateAutomationRule, deleteAutomationRule, DEFAULT_AUTOMATION_RULES, AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from '../services/automationService';
import type { AutomationRule } from '../services/automationService';
import { fetchCases, updateCaseStatus, CASE_STATUSES } from '../services/caseService';
import { Plus, Trash2, ToggleLeft, ToggleRight, Zap, RefreshCw } from 'lucide-react';

const GOLD = '#C9963C';

export function CRMSettingsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    trigger: 'payment_success',
    action: 'update_status',
    action_status: 'Document Collection',
    action_message: '',
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    try { setRules(await fetchAutomationRules()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const seedDefaults = async () => {
    try {
      for (const rule of DEFAULT_AUTOMATION_RULES) {
        await createAutomationRule(rule);
      }
      await load();
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.trigger || !form.action) return;
    const actionData =
      form.action === 'update_status'
        ? { status: form.action_status }
        : { message: form.action_message };
    try {
      await createAutomationRule({
        name: form.name,
        trigger: form.trigger,
        condition: null,
        action: form.action,
        action_data: actionData,
        is_active: form.is_active,
      });
      setShowForm(false);
      setForm({ name: '', trigger: 'payment_success', action: 'update_status', action_status: 'Document Collection', action_message: '', is_active: true });
      await load();
    } catch (e) { console.error(e); }
  };

  const toggleRule = async (rule: AutomationRule) => {
    try {
      await updateAutomationRule(rule.id, { is_active: !rule.is_active });
      await load();
    } catch (e) { console.error(e); }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    try { await deleteAutomationRule(id); await load(); }
    catch (e) { console.error(e); }
  };

  return (
    <div className="crm-page">
      <CRMNavbar title="Automation & Settings" subtitle="Configure automation rules and system settings" />
      <div className="crm-page__content">

        {/* Automation Rules Section */}
        <div className="crm-table-wrap" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: '#fff', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color={GOLD} /> Automation Rules
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                Trigger-based actions that run automatically when conditions are met.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {rules.length === 0 && (
                <button className="crm-btn crm-btn--ghost" onClick={seedDefaults}>
                  <RefreshCw size={14} /> Seed Defaults
                </button>
              )}
              <button className="crm-btn crm-btn--primary" onClick={() => setShowForm(v => !v)}>
                <Plus size={16} /> Add Rule
              </button>
            </div>
          </div>

          {/* Create Form */}
          {showForm && (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>New Automation Rule</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="crm-form-group">
                  <label>Rule Name</label>
                  <input className="crm-input" placeholder="e.g. Payment Success → Status Update"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="crm-form-row">
                  <div className="crm-form-group">
                    <label>Trigger</label>
                    <select className="crm-select" value={form.trigger}
                      onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}>
                      {AUTOMATION_TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="crm-form-group">
                    <label>Action</label>
                    <select className="crm-select" value={form.action}
                      onChange={e => setForm(f => ({ ...f, action: e.target.value }))}>
                      {AUTOMATION_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </div>
                </div>
                {form.action === 'update_status' && (
                  <div className="crm-form-group">
                    <label>Set Status To</label>
                    <select className="crm-select" value={form.action_status}
                      onChange={e => setForm(f => ({ ...f, action_status: e.target.value }))}>
                      {CASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {(form.action === 'send_notification' || form.action === 'send_reminder') && (
                  <div className="crm-form-group">
                    <label>Message</label>
                    <input className="crm-input" placeholder="Notification message..." value={form.action_message}
                      onChange={e => setForm(f => ({ ...f, action_message: e.target.value }))} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="crm-btn crm-btn--primary" onClick={handleCreate}>Save Rule</button>
                  <button className="crm-btn crm-btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Rules List */}
          {loading ? <div className="crm-spinner" /> : rules.length === 0 ? (
            <div className="crm-empty">
              <div className="crm-empty__icon">⚡</div>
              <div className="crm-empty__title">No automation rules yet</div>
              <div className="crm-empty__sub">Click "Seed Defaults" to add pre-built rules.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rules.map(rule => {
                const trigger = AUTOMATION_TRIGGERS.find(t => t.value === rule.trigger);
                const action = AUTOMATION_ACTIONS.find(a => a.value === rule.action);
                return (
                  <div key={rule.id} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    opacity: rule.is_active ? 1 : 0.5,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{rule.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span>🔔 <strong>When:</strong> {trigger?.label ?? rule.trigger}</span>
                        <span>→</span>
                        <span>⚡ <strong>Do:</strong> {action?.label ?? rule.action}</span>
                        {!!rule.action_data?.status && <span style={{ color: GOLD }}>({rule.action_data.status as string})</span>}
                        {!!rule.action_data?.message && <span style={{ color: '#94a3b8' }}>"{rule.action_data.message as string}"</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRule(rule)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: rule.is_active ? '#10b981' : '#94a3b8' }}
                      title={rule.is_active ? 'Disable' : 'Enable'}
                    >
                      {rule.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                    <button className="crm-btn crm-btn--danger" style={{ padding: '6px 10px' }}
                      onClick={() => deleteRule(rule.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System info card */}
        <div className="crm-table-wrap" style={{ padding: '24px' }}>
          <h2 style={{ color: '#fff', margin: '0 0 16px' }}>📋 CRM Configuration</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Case Lifecycle Stages', value: `${CASE_STATUSES.length} stages configured`, icon: '🔄' },
              { label: 'Supabase Backend', value: 'Connected', icon: '✅' },
              { label: 'Real-time Updates', value: 'Active via Supabase Channels', icon: '📡' },
              { label: 'Document Storage', value: 'Supabase Storage (crm-documents)', icon: '📂' },
              { label: 'Payment Gateway', value: 'Razorpay (configure API keys)', icon: '💳' },
              { label: 'Email Integration', value: 'Configure SMTP in Supabase Edge', icon: '📧' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', padding: '14px',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
