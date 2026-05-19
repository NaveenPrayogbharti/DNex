import { useState, useEffect } from 'react';
import { Phone, CheckCircle, XCircle, ChevronRight, Send, FileText, CreditCard, Package, ArrowLeft, Plus } from 'lucide-react';
import { updateCaseStatus, updateCase, updateCaseWorkflowField } from '../services/caseService';
import type { CRMCase, CaseStatus } from '../services/caseService';
import { logCall, fetchCalls } from '../services/callService';
import type { CRMCall } from '../services/callService';
import { createQuotation, fetchQuotations } from '../services/quotationService';
import type { QuotationItem, CRMQuotation } from '../services/quotationService';
import { createPayment } from '../services/paymentService';
import { fetchServicesForCRM } from '../../../lib/servicesStore';
import type { ServiceItem } from '../../../lib/servicesStore';
import { OUTCOME_LABELS, OUTCOME_COLORS } from '../services/callService';
import { sendCustomEmail } from '../services/emailNotificationService';

const GOLD = '#C9963C';

interface Props {
  crmCase: CRMCase;
  onRefresh: () => void;
  onBack?: () => void;
}

// ── Step: Contacted ──────────────────────────────────────────────────────────
export function ContactedStep({ crmCase, onRefresh, onBack }: Props) {
  const [dur, setDur] = useState(5);
  const [outcome, setOutcome] = useState<'answered'|'voicemail'|'no_answer'|'busy'>('answered');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [logSaved, setLogSaved] = useState(false);
  const [callLogs, setCallLogs] = useState<CRMCall[]>([]);
  const [nextAction, setNextAction] = useState<'req_gathering'|'another_call'|null>(null);

  // Load existing call logs for this case
  useEffect(() => {
    fetchCalls(crmCase.id).then(setCallLogs).catch(console.error);
  }, [crmCase.id, logSaved]);

  const saveCallLog = async () => {
    setSaving(true);
    try {
      await logCall(crmCase.id, { duration_minutes: dur, outcome, notes });
      setLogSaved(v => !v); // trigger reload
      setDur(5); setOutcome('answered'); setNotes('');
    } finally { setSaving(false); }
  };

  const confirm = async () => {
    if (!nextAction) return;
    setSaving(true);
    try {
      const next: CaseStatus = nextAction === 'req_gathering' ? 'Requirement Gathering' : 'Contacted';
      await updateCaseStatus(crmCase.id, next);
      onRefresh();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf:'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14}/> Back
        </button>
      )}
      <div style={{ display:'flex', alignItems:'center', gap:8, color:GOLD, fontWeight:700, fontSize:15 }}>
        <Phone size={18} /> Log a Call
      </div>

      {/* Existing call logs */}
      {callLogs.length > 0 && (
        <div style={{ background:'rgba(0,0,0,0.03)', borderRadius:10, padding:12 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Previous Calls ({callLogs.length})</div>
          {callLogs.map(c => (
            <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <div style={{ fontWeight:600, color: OUTCOME_COLORS[c.outcome] ?? '#1e293b', fontSize:13 }}>{OUTCOME_LABELS[c.outcome]}</div>
                <div style={{ fontSize:12, color:'#94a3b8' }}>{c.called_at ? new Date(c.called_at).toLocaleString() : ''} · {c.duration_minutes}min</div>
                {c.notes && <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{c.notes}</div>}
              </div>
              <div style={{ fontSize:12, color:'#94a3b8' }}>{c.called_by_name ?? 'Agent'}</div>
            </div>
          ))}
        </div>
      )}

      {/* New call form */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Duration (mins)</label>
          <input className="crm-input" type="number" value={dur} min={1}
            onChange={e => setDur(+e.target.value)} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Outcome</label>
          <select className="crm-select" value={outcome} onChange={e => setOutcome(e.target.value as any)}>
            <option value="answered">Answered</option>
            <option value="voicemail">Voicemail</option>
            <option value="no_answer">No Answer</option>
            <option value="busy">Busy</option>
          </select>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Call Notes</label>
        <textarea className="crm-textarea" rows={3} value={notes}
          onChange={e => setNotes(e.target.value)} placeholder="What was discussed..." />
      </div>
      <button className="crm-btn crm-btn--ghost" disabled={saving} onClick={saveCallLog}
        style={{ alignSelf:'flex-start' }}>
        <Plus size={14}/> {saving ? 'Saving...' : 'Save Call Log'}
      </button>

      <div style={{ fontSize:13, color:'#1e293b', fontWeight:600 }}>What's next?</div>
      <div style={{ display:'flex', gap:10 }}>
        <button className={`crm-btn ${nextAction==='req_gathering'?'crm-btn--primary':'crm-btn--ghost'}`}
          onClick={() => setNextAction('req_gathering')}>
          <ChevronRight size={14}/> Proceed to Requirement Gathering
        </button>
      </div>
      <button className="crm-btn crm-btn--primary" disabled={!nextAction || saving} onClick={confirm}
        style={{ alignSelf:'flex-start' }}>
        {saving ? 'Saving...' : 'Confirm & Continue'} <ChevronRight size={14}/>
      </button>
    </div>
  );
}

export function RequirementStep({ crmCase, onRefresh, onBack }: Props) {
  const [fields, setFields] = useState({
    budget: '',
    currency: 'AED',
    timeline: '',
    business_type: '',
    nationality: '',
    other_info: ''
  });
  const [decision, setDecision] = useState<'interested'|'not_interested'|null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const businessTypes = [
    'Trading / E-Commerce',
    'Professional Consulting / Services',
    'Real Estate / Construction',
    'Crypto / FinTech / Web3',
    'Logistics / General Import-Export',
    'Manufacturing / General Industries',
    'Tourism / Events / Hospitality',
    'Healthcare / Medical Clinic',
    'Others / Custom'
  ];

  const currencies = [
    { code: 'AED', label: 'AED (UAE Dirham)' },
    { code: 'INR', label: 'INR (Indian Rupee)' },
    { code: 'SAR', label: 'SAR (Saudi Riyal)' },
    { code: 'USD', label: 'USD (US Dollar)' },
    { code: 'EUR', label: 'EUR (Euro)' }
  ];

  const handleBudgetChange = (val: string) => {
    // Keep only numbers
    const cleanNum = val.replace(/[^0-9]/g, '');
    setFields(f => ({ ...f, budget: cleanNum }));
  };

  const confirm = async () => {
    if (!decision) return;
    setSaving(true);
    try {
      await updateCaseWorkflowField(crmCase.id, 'requirement_data', fields);
      if (decision === 'not_interested') {
        await updateCaseWorkflowField(crmCase.id, 'not_interested_reason', reason);
        await updateCaseStatus(crmCase.id, 'Not Interested');
      } else {
        await updateCaseStatus(crmCase.id, 'Interested');
      }
      onRefresh();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf:'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14}/> Back
        </button>
      )}
      <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}>📋 Gather Client Requirements</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Budget with Currency Selector */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Budget Amount *</label>
          <div style={{ display:'flex', gap:6 }}>
            <select
              className="crm-select"
              value={fields.currency}
              onChange={e => setFields(f => ({ ...f, currency: e.target.value }))}
              style={{ width: '90px', flexShrink: 0 }}
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
            <input
              type="text"
              className="crm-input"
              placeholder="e.g. 15000"
              value={fields.budget}
              onChange={e => handleBudgetChange(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Timeline</label>
          <input
            className="crm-input"
            placeholder="e.g. ASAP / 2 weeks"
            value={fields.timeline}
            onChange={e => setFields(f => ({ ...f, timeline: e.target.value }))}
          />
        </div>

        {/* Business Type Dropdown */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Business Type</label>
          <select
            className="crm-select"
            value={fields.business_type}
            onChange={e => setFields(f => ({ ...f, business_type: e.target.value }))}
          >
            <option value="">Select industry type...</option>
            {businessTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Nationality */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Nationality</label>
          <input
            className="crm-input"
            placeholder="Client nationality"
            value={fields.nationality}
            onChange={e => setFields(f => ({ ...f, nationality: e.target.value }))}
          />
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Additional Information</label>
        <textarea className="crm-textarea" rows={3} value={fields.other_info}
          onChange={e => setFields(f => ({ ...f, other_info: e.target.value }))}
          placeholder="Any special requirements, notes from client..." />
      </div>

      <div style={{ padding:'14px', background:'rgba(201,150,60,0.08)', border:'1px solid rgba(201,150,60,0.2)', borderRadius:10, fontSize:13, color:'#1e293b' }}>
        💡 Inform the client about our services. After discussion, record their decision below.
      </div>

      <div style={{ fontSize:13, color:'#1e293b', fontWeight:600 }}>Client's Decision</div>
      <div style={{ display:'flex', gap:10 }}>
        <button className={`crm-btn ${decision==='interested'?'crm-btn--success':'crm-btn--ghost'}`}
          onClick={() => setDecision('interested')}>
          <CheckCircle size={14}/> Interested
        </button>
        <button className={`crm-btn ${decision==='not_interested'?'crm-btn--danger':'crm-btn--ghost'}`}
          onClick={() => setDecision('not_interested')}>
          <XCircle size={14}/> Not Interested
        </button>
      </div>

      {decision === 'not_interested' && (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#f87171', fontWeight:600 }}>Reason (required)</label>
          <textarea className="crm-textarea" rows={3} value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Describe the reason stated by the client for not choosing our service..." />
        </div>
      )}

      <button className="crm-btn crm-btn--primary" disabled={!decision || saving || (decision==='not_interested' && !reason)}
        onClick={confirm} style={{ alignSelf:'flex-start' }}>
        {saving ? 'Saving...' : 'Confirm Decision'} <ChevronRight size={14}/>
      </button>
    </div>
  );
}

// ── Step: Service Assignment ─────────────────────────────────────────────────
export function ServiceStep({ crmCase, onRefresh, onBack }: Props) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [customService, setCustomService] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServicesForCRM().then(setServices).catch(console.error);
  }, []);

  const effectiveTitle = showCustom ? customService : (selected?.title ?? '');

  const confirm = async () => {
    if (!effectiveTitle) return;
    setSaving(true);
    try {
      await updateCaseWorkflowField(crmCase.id, 'selected_service', effectiveTitle);
      await updateCase(crmCase.id, { service_type: effectiveTitle });
      await updateCaseStatus(crmCase.id, 'Service Assigned');
      onRefresh();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf:'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14}/> Back
        </button>
      )}
      <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}><Package size={18} style={{ display:'inline', marginRight:6 }}/>Select Service</div>
      {services.length === 0 ? (
        <div style={{ padding:20, textAlign:'center', color:'#64748b', fontSize:14 }}>Loading services...</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {services.map(svc => (
            <div key={svc.id}
              onClick={() => { setSelected(svc); setShowCustom(false); }}
              style={{
                padding:14, border:`2px solid ${!showCustom && selected?.id===svc.id?GOLD:'rgba(0,0,0,0.1)'}`,
                borderRadius:10, cursor:'pointer', background: !showCustom && selected?.id===svc.id?'rgba(201,150,60,0.08)':'rgba(0,0,0,0.02)',
                transition:'all 0.2s',
              }}>
              <div style={{ fontWeight:700, color:'#1e293b', fontSize:14 }}>{svc.title}</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>{svc.description}</div>
            </div>
          ))}
          {/* Custom/Other option */}
          <div
            onClick={() => { setShowCustom(true); setSelected(null); }}
            style={{
              padding:14, border:`2px solid ${showCustom?GOLD:'rgba(0,0,0,0.1)'}`,
              borderRadius:10, cursor:'pointer', background: showCustom?'rgba(201,150,60,0.08)':'rgba(0,0,0,0.02)',
              transition:'all 0.2s',
            }}>
            <div style={{ fontWeight:700, color:'#1e293b', fontSize:14 }}>➕ Other / Not Listed</div>
            <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>Add a custom service not in our catalog</div>
          </div>
        </div>
      )}
      {showCustom && (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Custom Service Name</label>
          <input className="crm-input" placeholder="Enter service name..." value={customService}
            onChange={e => setCustomService(e.target.value)} />
        </div>
      )}
      {!showCustom && selected && (
        <div style={{ padding:14, background:'rgba(79,70,229,0.06)', border:'1px solid rgba(79,70,229,0.2)', borderRadius:10 }}>
          <div style={{ fontWeight:700, color:'#4f46e5', marginBottom:8 }}>📄 Required Documents for {selected.title}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {(selected.required_docs ?? []).length > 0
              ? (selected.required_docs ?? []).map(d => (
                  <span key={d} style={{ background:'rgba(79,70,229,0.1)', padding:'4px 10px', borderRadius:20, fontSize:12, color:'#4f46e5' }}>{d}</span>
                ))
              : <span style={{ fontSize:13, color:'#64748b' }}>No specific documents listed.</span>
            }
          </div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:10 }}>
            📧 Notification will be sent via Email &amp; WhatsApp to the client.
          </div>
        </div>
      )}
      <button className="crm-btn crm-btn--primary" disabled={!effectiveTitle || saving} onClick={confirm} style={{ alignSelf:'flex-start' }}>
        {saving ? 'Saving...' : 'Confirm Service & Notify Client'} <Send size={14}/>
      </button>
    </div>
  );
}


export function QuotationStep({ crmCase, onRefresh, onBack }: Props) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [items, setItems] = useState<QuotationItem[]>([{ description: crmCase.service_type || '', qty: 1, rate: 0, amount: 0 }]);
  // Use string for editable number fields to avoid "0 sticking" bug
  const [taxRateStr, setTaxRateStr] = useState('5');
  const [discountStr, setDiscountStr] = useState('0');
  const [validityStr, setValidityStr] = useState('30');
  const [currency, setCurrency] = useState('AED');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [prevQuotations, setPrevQuotations] = useState<CRMQuotation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchServicesForCRM().then(setServices).catch(console.error);
    fetchQuotations(crmCase.id).then(setPrevQuotations).catch(console.error);
  }, [crmCase.id]);

  const taxRate = parseFloat(taxRateStr) || 0;
  const discount = parseFloat(discountStr) || 0;
  const validity = parseInt(validityStr) || 30;

  const updateItem = (i: number, key: keyof QuotationItem, val: string | number) => {
    setItems(prev => prev.map((it, idx) => {
      if (idx !== i) return it;
      const updated = { ...it, [key]: val };
      if (key === 'qty' || key === 'rate') updated.amount = parseFloat((+updated.qty * +updated.rate).toFixed(2));
      return updated;
    }));
  };

  // Discount before tax logic
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = (discountedSubtotal * taxRate) / 100;
  const total = discountedSubtotal + tax;

  const generate = async (sendAgain = false) => {
    setSaving(true);
    try {
      await createQuotation(crmCase.id, {
        client_name: crmCase.full_name,
        client_email: crmCase.email,
        client_phone: crmCase.phone,
        service_name: crmCase.service_type,
        items,
        tax_rate: taxRate,
        discount,
        validity_days: validity,
        notes,
      });
      // Save selected currency on case metadata
      await updateCaseWorkflowField(crmCase.id, 'quotation_currency', currency);
      if (!sendAgain) await updateCaseStatus(crmCase.id, 'Quotation Sent');
      onRefresh();
      fetchQuotations(crmCase.id).then(setPrevQuotations).catch(console.error);
    } finally { setSaving(false); }
  };

  const STATUS_C: Record<string,string> = { sent: GOLD, accepted:'#34d399', rejected:'#f87171', draft:'#94a3b8' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf:'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14}/> Back
        </button>
      )}
      <div style={{ display:'flex', justifyBetween:'space-between', alignItems:'center' }}>
        <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}><FileText size={18} style={{ display:'inline', marginRight:6 }}/>Generate Quotation</div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <label style={{ fontSize:11, color:'#94a3b8', fontWeight:700 }}>Currency:</label>
          <select className="crm-select" style={{ width:100, padding:'3px 6px', fontSize:12 }} value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="AED">AED (د.إ)</option>
            <option value="INR">INR (₹)</option>
            <option value="SAR">SAR (ر.س)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {/* Line items */}
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr auto', gap:8, marginBottom:8, fontSize:11, color:'#94a3b8', fontWeight:700 }}>
          <span>Description</span><span>Qty</span><span>Rate ({currency})</span><span>Amount</span><span></span>
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr auto', gap:8, marginBottom:8 }}>
            <div style={{ display:'flex', gap:4 }}>
              <select className="crm-select" style={{ flex:1 }}
                value={services.find(s => s.title === it.description) ? it.description : '__custom__'}
                onChange={e => {
                  if (e.target.value !== '__custom__') updateItem(i, 'description', e.target.value);
                }}>
                <option value="__custom__">Custom...</option>
                {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
              </select>
              <input className="crm-input" value={it.description} placeholder="or type here"
                onChange={e => updateItem(i, 'description', e.target.value)}
                style={{ flex:2 }} />
            </div>
            <input className="crm-input" type="number"
              value={it.qty === 0 ? '' : it.qty} placeholder="1" min={1}
              onChange={e => updateItem(i, 'qty', e.target.value === '' ? 0 : +e.target.value)} />
            <input className="crm-input" type="number"
              value={it.rate === 0 ? '' : it.rate} placeholder="0.00" min={0}
              onChange={e => updateItem(i, 'rate', e.target.value === '' ? 0 : +e.target.value)} />
            <input className="crm-input" value={it.amount.toFixed(2)} readOnly style={{ opacity:0.7 }}/>
            <button className="crm-btn crm-btn--danger" style={{ padding:'8px 10px' }}
              onClick={() => setItems(p => p.filter((_, idx) => idx !== i))}><XCircle size={14}/></button>
          </div>
        ))}
        <button className="crm-btn crm-btn--ghost" style={{ fontSize:13 }}
          onClick={() => setItems(p => [...p, { description:'', qty:1, rate:0, amount:0 }])}>+ Add Line</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Tax Rate (%)</label>
          <input className="crm-input" type="number" value={taxRateStr} placeholder="5"
            onChange={e => setTaxRateStr(e.target.value)} onFocus={e => { if (e.target.value === '0') setTaxRateStr(''); }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Discount ({currency})</label>
          <input className="crm-input" type="number" value={discountStr} placeholder="0"
            onChange={e => setDiscountStr(e.target.value)} onFocus={e => { if (e.target.value === '0') setDiscountStr(''); }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Validity (days)</label>
          <input className="crm-input" type="number" value={validityStr} placeholder="30"
            onChange={e => setValidityStr(e.target.value)} />
        </div>
      </div>

      <div style={{ background:'rgba(0,0,0,0.04)', borderRadius:10, padding:14 }}>
        <div style={{ display:'flex', justifyBetween:'space-between', fontSize:13, color:'#94a3b8', marginBottom:4 }}>
          <span>Subtotal</span><span>{currency} {subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display:'flex', justifyBetween:'space-between', fontSize:13, color:'#34d399', marginBottom:4 }}>
            <span>Discount (applied before tax)</span><span>- {currency} {discount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display:'flex', justifyBetween:'space-between', fontSize:13, color:'#94a3b8', marginBottom:4 }}>
          <span>Tax ({taxRate}%)</span><span>{currency} {tax.toFixed(2)}</span>
        </div>
        <div style={{ display:'flex', justifyBetween:'space-between', fontSize:18, fontWeight:800, color:'#0A1628', borderTop:'1px solid rgba(0,0,0,0.1)', paddingTop:8, marginTop:4 }}>
          <span>Total</span><span>{currency} {total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Notes</label>
        <textarea className="crm-textarea" rows={2} value={notes}
          onChange={e => setNotes(e.target.value)} placeholder="Additional notes for quotation..." />
      </div>

      <div style={{ padding:10, background:'rgba(201,150,60,0.08)', border:'1px solid rgba(201,150,60,0.2)', borderRadius:8, fontSize:12, color:'#64748b' }}>
        📧 Quotation will be sent via <strong style={{ color:GOLD }}>Email &amp; WhatsApp</strong> to the client automatically.
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <button className="crm-btn crm-btn--primary" disabled={saving || items.length === 0} onClick={() => generate(false)} style={{ alignSelf:'flex-start' }}>
          {saving ? 'Generating...' : 'Generate & Send Quotation'} <Send size={14}/>
        </button>
        {prevQuotations.length > 0 && (
          <button className="crm-btn crm-btn--ghost" disabled={saving || items.length === 0} onClick={() => generate(true)}>
            🔄 Send Revised Quotation
          </button>
        )}
        {prevQuotations.length > 0 && (
          <button className="crm-btn crm-btn--ghost" onClick={() => setShowHistory(v => !v)}>
            📋 {showHistory ? 'Hide' : 'Show'} Previous Quotations ({prevQuotations.length})
          </button>
        )}
      </div>

      {/* Previous quotations history */}
      {showHistory && prevQuotations.length > 0 && (
        <div style={{ background:'rgba(0,0,0,0.03)', borderRadius:10, padding:14 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#64748b', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>Quotation History</div>
          {prevQuotations.map(q => (
            <div key={q.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:'#1e293b' }}>{q.quotation_number}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>AED {Number(q.total).toLocaleString()} · {q.service_name}</div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>{new Date(q.created_at).toLocaleString()} · Valid {q.validity_days}d · Tax {q.tax_rate}%</div>
              </div>
              <span style={{ fontSize:12, fontWeight:600, color: STATUS_C[q.status] ?? '#94a3b8',
                background:`${STATUS_C[q.status] ?? '#94a3b8'}18`, padding:'3px 10px', borderRadius:20 }}>
                {q.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step: Payment ────────────────────────────────────────────────────────────
export function PaymentStep({ crmCase, onRefresh, onBack }: Props) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(crmCase.requirement_data?.currency || 'AED');
  const [desc, setDesc] = useState(crmCase.service_type || '');
  const [saving, setSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [showNotInterested, setShowNotInterested] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const currencies = [
    { code: 'AED', label: 'AED (UAE Dirham)' },
    { code: 'INR', label: 'INR (Indian Rupee)' },
    { code: 'SAR', label: 'SAR (Saudi Riyal)' },
    { code: 'USD', label: 'USD (US Dollar)' },
    { code: 'EUR', label: 'EUR (Euro)' }
  ];

  const handleInterestSelect = async (interested: boolean) => {
    setSaving(true);
    try {
      if (interested) {
        // Move from Quotation Sent to Payment Pending
        await updateCaseStatus(crmCase.id, 'Payment Pending');
      } else {
        await updateCaseWorkflowField(crmCase.id, 'not_interested_reason', rejectReason);
        await updateCaseStatus(crmCase.id, 'Not Interested');
      }
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const sendLink = async () => {
    if (!amount) return;
    setSaving(true);
    try {
      await createPayment(crmCase.id, parseFloat(amount), `${currency} ${desc}`);
      await updateCaseStatus(crmCase.id, 'Payment Pending');
      onRefresh();
    } finally { setSaving(false); }
  };

  const markPaid = async () => {
    setMarkingPaid(true);
    try {
      await updateCaseStatus(crmCase.id, 'Payment Completed');
      onRefresh();
    } finally { setMarkingPaid(false); }
  };

  // If status is Quotation Sent, prompt for response first
  if (crmCase.status === 'Quotation Sent') {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {onBack && (
          <button className="crm-btn crm-btn--ghost" style={{ alignSelf:'flex-start' }} onClick={onBack}>
            <ArrowLeft size={14}/> Back
          </button>
        )}
        <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}>📋 Client Response to Quotation</div>
        <div style={{ fontSize:13, color:'var(--crm-text)' }}>
          Please capture the client's response to the sent quotation before initiating the payment phase.
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button className="crm-btn crm-btn--success" disabled={saving} onClick={() => handleInterestSelect(true)}>
            <CheckCircle size={14}/> Interested &amp; Accept Quotation
          </button>
          <button className="crm-btn crm-btn--danger" disabled={saving} onClick={() => setShowNotInterested(true)}>
            <XCircle size={14}/> Not Interested / Reject
          </button>
        </div>

        {showNotInterested && (
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8, padding:12, background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:10 }}>
            <label style={{ fontSize:12, color:'#f87171', fontWeight:600 }}>Reason for rejection *</label>
            <textarea
              className="crm-textarea"
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Budget constraints, chose another provider..."
            />
            <button
              className="crm-btn crm-btn--danger"
              disabled={saving || !rejectReason}
              onClick={() => handleInterestSelect(false)}
              style={{ alignSelf:'flex-start' }}
            >
              Confirm Rejection &amp; Close Case
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf:'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14}/> Back
        </button>
      )}
      <div style={{ display:'flex', justifyBetween:'space-between', alignItems:'center' }}>
        <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}><CreditCard size={18} style={{ display:'inline', marginRight:6 }}/>Payment Processing</div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <label style={{ fontSize:11, color:'#94a3b8', fontWeight:700 }}>Currency:</label>
          <select className="crm-select" style={{ width:100, padding:'3px 6px', fontSize:12 }} value={currency} onChange={e => setCurrency(e.target.value)}>
            {currencies.map(c => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Amount ({currency})</label>
          <input className="crm-input" type="number" value={amount} placeholder="0.00" onChange={e => setAmount(e.target.value)} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Description</label>
          <input className="crm-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Service fee..." />
        </div>
      </div>
      <div style={{ padding:10, background:'rgba(201,150,60,0.08)', border:'1px solid rgba(201,150,60,0.2)', borderRadius:8, fontSize:12, color:'#64748b' }}>
        🔗 Payment link will be sent via <strong style={{ color:GOLD }}>Email &amp; WhatsApp</strong>. Once paid, status auto-updates.
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button className="crm-btn crm-btn--primary" disabled={saving || !amount} onClick={sendLink}>
          {saving ? 'Sending...' : 'Send Payment Link'} <Send size={14}/>
        </button>
        <button className="crm-btn crm-btn--success" disabled={markingPaid} onClick={markPaid}>
          {markingPaid ? '...' : '✓ Mark as Paid (Manual)'}
        </button>
      </div>
    </div>
  );
}

// ── Step: Processing ─────────────────────────────────────────────────────────
export function ProcessingStep({ crmCase, onRefresh, onBack }: Props) {
  const [procNotes, setProcNotes] = useState(crmCase.processing_notes || '');
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);

  // Email form state
  const [emailSubject, setEmailSubject] = useState(`Update regarding your application - ${crmCase.case_id}`);
  const [emailBody, setEmailBody] = useState(`Dear ${crmCase.full_name},\n\nWe are pleased to inform you that your case (${crmCase.case_id}) for ${crmCase.service_type || 'business setup'} is currently in processing. We are making great progress and will share further milestones soon.\n\nBest regards,\nDNex Consulting Team`);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // WhatsApp state
  const [waText, setWaText] = useState(`Hello ${crmCase.full_name}, we have an update regarding your ${crmCase.service_type || 'business setup'} application with DNex Consulting. We have processed the files and submitted them to the department.`);

  const saveNotes = async () => {
    setSaving(true);
    try {
      await updateCaseWorkflowField(crmCase.id, 'processing_notes', procNotes);
    } finally { setSaving(false); }
  };

  const closeCase = async () => {
    setClosing(true);
    try {
      await updateCaseWorkflowField(crmCase.id, 'processing_notes', procNotes);
      await updateCaseStatus(crmCase.id, 'Completed');
      onRefresh();
    } finally { setClosing(false); }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailStatus('idle');
    try {
      const res = await sendCustomEmail({
        to: crmCase.email,
        subject: emailSubject,
        body: emailBody.replace(/\n/g, '<br/>'),
      });
      if (res.success) {
        setEmailStatus('success');
        // Clear body
        setEmailBody('');
      } else {
        setEmailStatus('error');
      }
    } catch (e) {
      console.error(e);
      setEmailStatus('error');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendWhatsApp = () => {
    let cleanPhone = crmCase.phone.replace(/[^0-9]/g, '');
    // Ensure country code is present (default to UAE 971 if it looks like local)
    if (cleanPhone.startsWith('05') || cleanPhone.length === 9) {
      cleanPhone = '971' + cleanPhone.replace(/^0/, '');
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf:'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14}/> Back
        </button>
      )}
      <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}>⚙️ Processing &amp; Operations</div>
      <div style={{ padding:12, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:10, fontSize:13, color:'#4f46e5' }}>
        Use verified documents to process the requested service. Update notes regularly — client receives periodic notifications.
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, borderTop:'1px solid var(--crm-border)', paddingTop:16 }}>
        {/* Email Client form */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, background:'rgba(255,255,255,0.02)', padding:14, borderRadius:10, border:'1px solid var(--crm-border)' }}>
          <div style={{ fontWeight:700, fontSize:13, color:GOLD }}>📧 Send Email Update</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:11, color:'#94a3b8' }}>Subject</label>
            <input className="crm-input" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:11, color:'#94a3b8' }}>HTML/Text Content</label>
            <textarea className="crm-textarea" rows={4} value={emailBody} onChange={e => setEmailBody(e.target.value)} />
          </div>
          <button className="crm-btn crm-btn--primary" onClick={handleSendEmail} disabled={sendingEmail || !emailBody}>
            {sendingEmail ? 'Sending Email...' : '✉ Send Email'}
          </button>
          {emailStatus === 'success' && <div style={{ fontSize:12, color:'#34d399', fontWeight:600 }}>✓ Email sent successfully via server!</div>}
          {emailStatus === 'error' && <div style={{ fontSize:12, color:'#f87171', fontWeight:600 }}>✗ Failed to send email. Check backend.</div>}
        </div>

        {/* WhatsApp Client form */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, background:'rgba(255,255,255,0.02)', padding:14, borderRadius:10, border:'1px solid var(--crm-border)' }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#25d366' }}>💬 Send WhatsApp Update</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:11, color:'#94a3b8' }}>WhatsApp Message</label>
            <textarea className="crm-textarea" rows={6} value={waText} onChange={e => setWaText(e.target.value)} />
          </div>
          <button className="crm-btn crm-btn--success" onClick={handleSendWhatsApp} disabled={!waText}>
            📲 Open WhatsApp Chat
          </button>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:6, borderTop:'1px solid var(--crm-border)', paddingTop:16 }}>
        <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Processing Notes (internal)</label>
        <textarea className="crm-textarea" rows={5} value={procNotes}
          onChange={e => setProcNotes(e.target.value)}
          placeholder="Log processing progress, steps completed, issues encountered..." />
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button className="crm-btn crm-btn--ghost" disabled={saving} onClick={saveNotes}>
          {saving ? 'Saving...' : '💾 Save Notes'}
        </button>
        <button className="crm-btn crm-btn--success" disabled={closing} onClick={closeCase}>
          {closing ? '...' : '✅ Mark Service Complete & Close Case'}
        </button>
      </div>
    </div>
  );
}

