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

const COUNTRIES = [
  "United Arab Emirates", "India", "Pakistan", "United Kingdom", "United States", "Saudi Arabia", "Oman", "Qatar", "Bahrain", "Kuwait",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

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
              <input 
                className="crm-input" 
                value={form.country}
                onChange={e => set('country', e.target.value)} 
                placeholder="UAE" 
                list="countries-list"
              />
              <datalist id="countries-list">
                {COUNTRIES.map((country: string) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
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
              <input 
                className="crm-input" 
                type="date" 
                value={form.sla_deadline ?? ''}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('sla_deadline', e.target.value)} 
              />
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
