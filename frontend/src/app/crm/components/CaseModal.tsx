import { useState } from 'react';
import { X } from 'lucide-react';
import { createCase } from '../services/caseService';
import type { CreateCaseInput, CasePriority } from '../services/caseService';
import { processAutomations } from '../services/automationService';
import { useNavigate } from 'react-router';

const SERVICES = [
  'Company Formation', 'Freezone Setup', 'PRO Services', 'Visa Processing',
  'Bank Account Opening', 'Business License', 'Tax Consultation',
  'Legal Services', 'Document Attestation', 'Golden Visa',
];

const SOURCES = ['website', 'referral', 'walk-in', 'whatsapp', 'email', 'social media', 'other'];
const PRIORITIES: CasePriority[] = ['low', 'medium', 'high', 'urgent'];

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CaseModal({ onClose, onCreated }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateCaseInput>({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    service_type: '',
    priority: 'medium',
    source: 'website',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof CreateCaseInput, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.full_name || !form.phone || !form.service_type) {
      setError('Name, phone, and service type are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const newCase = await createCase(form);
      await processAutomations('case_created', { caseId: newCase.id });
      onCreated();
      onClose();
      navigate(`/crm/cases/${newCase.id}`);
    } catch (e: any) {
      setError(e.message ?? 'Failed to create case');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="crm-modal-overlay" onClick={onClose}>
      <div className="crm-modal" onClick={e => e.stopPropagation()}>
        <div className="crm-modal__header">
          <h2>➕ New Case</h2>
          <button className="crm-modal__close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="crm-modal__body">
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <div className="crm-form-row">
            <div className="crm-form-group">
              <label>Full Name *</label>
              <input className="crm-input" value={form.full_name}
                onChange={e => set('full_name', e.target.value)} placeholder="Client name" />
            </div>
            <div className="crm-form-group">
              <label>Phone *</label>
              <input className="crm-input" value={form.phone}
                onChange={e => set('phone', e.target.value)} placeholder="+971..." />
            </div>
          </div>
          <div className="crm-form-row">
            <div className="crm-form-group">
              <label>Email</label>
              <input className="crm-input" type="email" value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="crm-form-group">
              <label>Country</label>
              <input className="crm-input" value={form.country}
                onChange={e => set('country', e.target.value)} placeholder="UAE" />
            </div>
          </div>
          <div className="crm-form-row">
            <div className="crm-form-group">
              <label>Service Type *</label>
              <select className="crm-select" value={form.service_type}
                onChange={e => set('service_type', e.target.value)}>
                <option value="">Select service...</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="crm-form-group">
              <label>Priority</label>
              <select className="crm-select" value={form.priority}
                onChange={e => set('priority', e.target.value as CasePriority)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="crm-form-row">
            <div className="crm-form-group">
              <label>Source</label>
              <select className="crm-select" value={form.source}
                onChange={e => set('source', e.target.value)}>
                {SOURCES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="crm-form-group">
              <label>SLA Deadline</label>
              <input className="crm-input" type="date" value={form.sla_deadline ?? ''}
                onChange={e => set('sla_deadline', e.target.value)} />
            </div>
          </div>
          <div className="crm-form-group">
            <label>Notes</label>
            <textarea className="crm-textarea" rows={3} value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)} placeholder="Initial notes..." />
          </div>
        </div>
        <div className="crm-modal__footer">
          <button className="crm-btn crm-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : 'Create Case'}
          </button>
        </div>
      </div>
    </div>
  );
}
