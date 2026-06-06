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
  isViewOnly?: boolean;
}

// ── Step: Contacted ──────────────────────────────────────────────────────────
export function ContactedStep({ crmCase, onRefresh, onBack, isViewOnly }: Props) {
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

      {/* New call form (hidden in view-only mode) */}
      {!isViewOnly && (
        <>
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
        </>
      )}
    </div>
  );
}

export function RequirementStep({ crmCase, onRefresh, onBack, isViewOnly }: Props) {
  const [fields, setFields] = useState({
    budget: crmCase.requirement_data?.budget || '',
    currency: crmCase.requirement_data?.currency || 'AED',
    timeline: crmCase.requirement_data?.timeline || '',
    business_type: crmCase.requirement_data?.business_type || '',
    custom_business_type: crmCase.requirement_data?.custom_business_type || '',
    nationality: crmCase.requirement_data?.nationality || '',
    other_info: crmCase.requirement_data?.other_info || ''
  });
  const [decision, setDecision] = useState<'interested'|'not_interested'|null>(null);
  const [reason, setReason] = useState(crmCase.not_interested_reason || '');
  const [saving, setSaving] = useState(false);
  const [natSearch, setNatSearch] = useState('');
  const [natOpen, setNatOpen] = useState(false);

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

  const NATIONALITIES = [
    'Afghan','Albanian','Algerian','American','Andorran','Angolan','Argentine','Armenian',
    'Australian','Austrian','Azerbaijani','Bahraini','Bangladeshi','Belarusian','Belgian',
    'Bolivian','Bosnian','Brazilian','British','Bulgarian','Cambodian','Cameroonian','Canadian',
    'Chilean','Chinese','Colombian','Congolese','Croatian','Cuban','Czech','Danish','Dutch',
    'Egyptian','Emirati','Eritrean','Estonian','Ethiopian','Fijian','Finnish','French',
    'Georgian','German','Ghanaian','Greek','Guatemalan','Guinean','Haitian','Honduran',
    'Hungarian','Indian','Indonesian','Iranian','Iraqi','Irish','Israeli','Italian','Ivorian',
    'Jamaican','Japanese','Jordanian','Kazakhstani','Kenyan','Korean','Kuwaiti','Kyrgyz',
    'Laotian','Latvian','Lebanese','Liberian','Libyan','Lithuanian','Luxembourgish',
    'Malagasy','Malawian','Malaysian','Maldivian','Malian','Maltese','Mauritanian',
    'Mauritian','Mexican','Moldovan','Mongolian','Moroccan','Mozambican','Myanmar',
    'Namibian','Nepali','New Zealander','Nicaraguan','Nigerian','Norwegian','Omani',
    'Pakistani','Palestinian','Panamanian','Paraguayan','Peruvian','Filipino','Polish',
    'Portuguese','Qatari','Romanian','Russian','Rwandan','Saudi','Senegalese','Serbian',
    'Sierra Leonean','Singaporean','Slovak','Slovenian','Somali','South African','Spanish',
    'Sri Lankan','Sudanese','Swedish','Swiss','Syrian','Taiwanese','Tajik','Tanzanian',
    'Thai','Togolese','Tunisian','Turkish','Turkmen','Ugandan','Ukrainian','Uruguayan',
    'Uzbek','Venezuelan','Vietnamese','Yemeni','Zambian','Zimbabwean','Other'
  ];

  const filteredNats = natSearch
    ? NATIONALITIES.filter(n => n.toLowerCase().includes(natSearch.toLowerCase()))
    : NATIONALITIES;

  const isCustomBusiness = fields.business_type === 'Others / Custom';

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
            <select className="crm-select" value={fields.currency}
              onChange={e => setFields(f => ({ ...f, currency: e.target.value }))}
              style={{ width:'90px', flexShrink:0 }}>
              {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            <input type="text" className="crm-input" placeholder="e.g. 15000"
              value={fields.budget} onChange={e => handleBudgetChange(e.target.value)} style={{ flex:1 }} />
          </div>
        </div>

        {/* Timeline */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Timeline</label>
          <input className="crm-input" placeholder="e.g. ASAP / 2 weeks"
            value={fields.timeline} onChange={e => setFields(f => ({ ...f, timeline: e.target.value }))} />
        </div>

        {/* Business Type Dropdown + custom input */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Business Type</label>
          <select className="crm-select" value={fields.business_type}
            onChange={e => setFields(f => ({ ...f, business_type: e.target.value, custom_business_type: '' }))}>
            <option value="">Select industry type...</option>
            {businessTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          {isCustomBusiness && (
            <input className="crm-input" placeholder="Enter business type..."
              value={fields.custom_business_type}
              onChange={e => setFields(f => ({ ...f, custom_business_type: e.target.value }))} />
          )}
        </div>

        {/* Nationality — searchable dropdown */}
        <div style={{ display:'flex', flexDirection:'column', gap:6, position:'relative' }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Nationality</label>
          <input className="crm-input"
            placeholder="Search nationality..."
            value={natSearch || fields.nationality}
            onFocus={() => { setNatOpen(true); setNatSearch(''); }}
            onChange={e => { setNatSearch(e.target.value); setNatOpen(true); }} />
          {natOpen && (
            <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:50,
              background:'#fff', border:'1px solid #e2e8f0', borderRadius:8,
              boxShadow:'0 8px 24px rgba(0,0,0,0.12)', maxHeight:200, overflowY:'auto', marginTop:2 }}>
              {filteredNats.map(n => (
                <div key={n}
                  style={{ padding:'8px 12px', cursor:'pointer', fontSize:13, color:'#1e293b',
                    background: fields.nationality === n ? '#f0f9ff' : 'transparent' }}
                  onMouseDown={() => {
                    setFields(f => ({ ...f, nationality: n }));
                    setNatSearch(''); setNatOpen(false);
                  }}>
                  {n}
                </div>
              ))}
              {filteredNats.length === 0 && (
                <div style={{ padding:'10px 12px', fontSize:12, color:'#94a3b8' }}>No match found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {natOpen && <div style={{ position:'fixed', inset:0, zIndex:49 }} onClick={() => setNatOpen(false)} />}

      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Additional Information</label>
        <textarea className="crm-textarea" rows={3} value={fields.other_info} disabled={isViewOnly}
          onChange={e => setFields(f => ({ ...f, other_info: e.target.value }))}
          placeholder="Any special requirements, notes from client..." />
      </div>

      {!isViewOnly && (
        <>
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

          <button className="crm-btn crm-btn--primary"
            disabled={!decision || saving || (decision==='not_interested' && !reason)}
            onClick={confirm} style={{ alignSelf:'flex-start' }}>
            {saving ? 'Saving...' : 'Confirm Decision'} <ChevronRight size={14}/>
          </button>
        </>
      )}
    </div>
  );
}

// ── Step: Service Assignment ─────────────────────────────────────────────────
export function ServiceStep({ crmCase, onRefresh, onBack, isViewOnly }: Props) {
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
      {!isViewOnly && (
        <button className="crm-btn crm-btn--primary" disabled={!effectiveTitle || saving} onClick={confirm} style={{ alignSelf:'flex-start' }}>
          {saving ? 'Saving...' : 'Confirm Service & Notify Client'} <Send size={14}/>
        </button>
      )}
    </div>
  );
}


export function QuotationStep({ crmCase, onRefresh, onBack, isViewOnly }: Props) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [items, setItems] = useState<QuotationItem[]>([{ description: crmCase.service_type || '', qty: 1, rate: 0, amount: 0 }]);
  const [taxRateStr, setTaxRateStr] = useState('5');
  const [discountPctStr, setDiscountPctStr] = useState('0');
  const [validityStr, setValidityStr] = useState('30');
  const [currency, setCurrency] = useState('AED');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingWA, setSendingWA] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [prevQuotations, setPrevQuotations] = useState<CRMQuotation[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState(false);

  useEffect(() => {
    fetchServicesForCRM().then(setServices).catch(console.error);
    fetchQuotations(crmCase.id).then(q => { setPrevQuotations(q); if (q.length > 0) setQuoteSaved(true); }).catch(console.error);
  }, [crmCase.id]);

  const taxRate = parseFloat(taxRateStr) || 0;
  const discountPct = Math.min(100, Math.max(0, parseFloat(discountPctStr) || 0));
  const validity = parseInt(validityStr) || 30;

  const updateItem = (i: number, key: keyof QuotationItem, val: string | number) => {
    setItems(prev => prev.map((it, idx) => {
      if (idx !== i) return it;
      const updated = { ...it, [key]: val };
      if (key === 'qty' || key === 'rate') updated.amount = parseFloat((+updated.qty * +updated.rate).toFixed(2));
      return updated;
    }));
  };

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const discountAmt = parseFloat(((subtotal * discountPct) / 100).toFixed(2));
  const discountedSubtotal = Math.max(0, subtotal - discountAmt);
  const tax = parseFloat(((discountedSubtotal * taxRate) / 100).toFixed(2));
  const total = parseFloat((discountedSubtotal + tax).toFixed(2));

  const saveQuotation = async () => {
    setSaving(true);
    try {
      await createQuotation(crmCase.id, {
        client_name: crmCase.full_name, client_email: crmCase.email,
        client_phone: crmCase.phone, service_name: crmCase.service_type,
        items, tax_rate: taxRate, discount: discountAmt, validity_days: validity, notes,
      });
      await updateCaseWorkflowField(crmCase.id, 'requirement_data', { ...crmCase.requirement_data, quotation_currency: currency });
      await updateCaseStatus(crmCase.id, 'Quotation Sent');
      setQuoteSaved(true);
      fetchQuotations(crmCase.id).then(setPrevQuotations).catch(console.error);
      onRefresh();
    } finally { setSaving(false); }
  };

  const sendViaWhatsApp = async () => {
    setSendingWA(true);
    try {
      if (!quoteSaved) await saveQuotation();
      let phone = crmCase.phone.replace(/[^0-9]/g, '');
      if (phone.startsWith('0')) phone = '971' + phone.slice(1);
      const msg = `Dear ${crmCase.full_name},\n\nYour quotation from DNex Consulting:\nService: ${crmCase.service_type}\nSubtotal: ${currency} ${subtotal.toFixed(2)}\nDiscount (${discountPct}%): -${currency} ${discountAmt.toFixed(2)}\nTax (${taxRate}%): ${currency} ${tax.toFixed(2)}\n*Total: ${currency} ${total.toFixed(2)}*\nValidity: ${validity} days\n\nReply to confirm. Thank you!`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } finally { setSendingWA(false); }
  };

  const sendViaEmail = async () => {
    setSendingEmail(true);
    try {
      if (!quoteSaved) await saveQuotation();
      await sendCustomEmail({
        to: crmCase.email,
        subject: `Quotation — ${crmCase.service_type} | DNex Consulting`,
        body: `<p>Dear <strong>${crmCase.full_name}</strong>,</p><p>Please find your quotation below:</p><table style="border-collapse:collapse;width:100%;font-family:sans-serif"><tr><td style="padding:6px 0;color:#64748b">Service</td><td><strong>${crmCase.service_type}</strong></td></tr><tr><td style="padding:6px 0;color:#64748b">Subtotal</td><td>${currency} ${subtotal.toFixed(2)}</td></tr>${discountPct > 0 ? `<tr><td style="padding:6px 0;color:#34d399">Discount (${discountPct}%)</td><td>-${currency} ${discountAmt.toFixed(2)}</td></tr>` : ''}<tr><td style="padding:6px 0;color:#64748b">Tax (${taxRate}%)</td><td>${currency} ${tax.toFixed(2)}</td></tr><tr style="font-weight:700;font-size:16px"><td style="padding:8px 0;border-top:2px solid #e2e8f0">Total</td><td>${currency} ${total.toFixed(2)}</td></tr></table><p>Validity: ${validity} days</p>${notes ? `<p>Notes: ${notes}</p>` : ''}<p>Please reply to confirm acceptance.</p>`,
      });
    } finally { setSendingEmail(false); }
  };

  const clientConfirmed = async () => {
    await updateCaseStatus(crmCase.id, 'Payment Pending');
    onRefresh();
  };

  const STATUS_C: Record<string, string> = { sent: GOLD, accepted: '#34d399', rejected: '#f87171', draft: '#94a3b8' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {onBack && <button className="crm-btn crm-btn--ghost" style={{ alignSelf:'flex-start' }} onClick={onBack}><ArrowLeft size={14}/> Back</button>}

      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}><FileText size={18} style={{ display:'inline', marginRight:6 }}/>Quotation Builder</div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <label style={{ fontSize:11, color:'#94a3b8', fontWeight:700 }}>Currency:</label>
          <select className="crm-select" style={{ width:110, padding:'3px 6px', fontSize:12 }} value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="AED">AED (د.إ)</option>
            <option value="INR">INR (₹)</option>
            <option value="SAR">SAR (ر.س)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {/* Auto-filled client info banner */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:12, background:'rgba(201,150,60,0.06)', borderRadius:10, border:'1px solid rgba(201,150,60,0.15)', fontSize:12 }}>
        <div><span style={{ color:'#94a3b8' }}>Client: </span><strong>{crmCase.full_name}</strong></div>
        <div><span style={{ color:'#94a3b8' }}>Service: </span><strong>{crmCase.service_type || '—'}</strong></div>
        <div><span style={{ color:'#94a3b8' }}>Case ID: </span><strong>{crmCase.case_id}</strong></div>
      </div>

      {/* Line items table */}
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr auto', gap:8, marginBottom:8, fontSize:11, color:'#94a3b8', fontWeight:700 }}>
          <span>Description</span><span>Qty</span><span>Rate ({currency})</span><span>Amount</span><span/>
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr auto', gap:8, marginBottom:8 }}>
            <div style={{ display:'flex', gap:4 }}>
              <select className="crm-select" style={{ flex:1 }}
                value={services.find(s => s.title === it.description) ? it.description : '__custom__'}
                onChange={e => { if (e.target.value !== '__custom__') updateItem(i, 'description', e.target.value); }}>
                <option value="__custom__">Custom...</option>
                {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
              </select>
              <input className="crm-input" value={it.description} placeholder="or type here"
                onChange={e => updateItem(i, 'description', e.target.value)} style={{ flex:2 }} />
            </div>
            <input className="crm-input" type="number" value={it.qty === 0 ? '' : it.qty} placeholder="1" min={1}
              onChange={e => updateItem(i, 'qty', e.target.value === '' ? 0 : +e.target.value)} />
            <input className="crm-input" type="number" value={it.rate === 0 ? '' : it.rate} placeholder="0.00" min={0}
              onChange={e => updateItem(i, 'rate', e.target.value === '' ? 0 : +e.target.value)} />
            <input className="crm-input" value={it.amount.toFixed(2)} readOnly style={{ opacity:0.7 }}/>
            <button className="crm-btn crm-btn--danger" style={{ padding:'8px 10px' }}
              onClick={() => setItems(p => p.filter((_, idx) => idx !== i))}><XCircle size={14}/></button>
          </div>
        ))}
        <button className="crm-btn crm-btn--ghost" style={{ fontSize:13 }}
          onClick={() => setItems(p => [...p, { description:'', qty:1, rate:0, amount:0 }])}>+ Add Line</button>
      </div>

      {/* Tax / Discount / Validity row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Tax Rate (%)</label>
          <input className="crm-input" type="number" value={taxRateStr} placeholder="5"
            onChange={e => setTaxRateStr(e.target.value)} onFocus={e => { if (e.target.value === '0') setTaxRateStr(''); }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Discount (%)</label>
          <input className="crm-input" type="number" value={discountPctStr} placeholder="0" min={0} max={100}
            onChange={e => setDiscountPctStr(e.target.value)} onFocus={e => { if (e.target.value === '0') setDiscountPctStr(''); }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Validity (days)</label>
          <input className="crm-input" type="number" value={validityStr} placeholder="30"
            onChange={e => setValidityStr(e.target.value)} />
        </div>
      </div>

      {/* Live total summary */}
      <div style={{ background:'rgba(10,22,40,0.05)', borderRadius:10, padding:14, border:'1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#64748b', marginBottom:4 }}><span>Subtotal</span><span>{currency} {subtotal.toFixed(2)}</span></div>
        {discountPct > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#34d399', marginBottom:4 }}><span>Discount ({discountPct}%) — applied before tax</span><span>-{currency} {discountAmt.toFixed(2)}</span></div>}
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#64748b', marginBottom:4 }}><span>Tax ({taxRate}%)</span><span>{currency} {tax.toFixed(2)}</span></div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:800, color:'#0A1628', borderTop:'2px solid rgba(0,0,0,0.1)', paddingTop:8, marginTop:4 }}><span>Total</span><span>{currency} {total.toFixed(2)}</span></div>
      </div>

      {/* Notes */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Notes / Terms</label>
        <textarea className="crm-textarea" rows={2} value={notes}
          onChange={e => setNotes(e.target.value)} placeholder="Additional notes, payment terms..." />
      </div>

      {/* Preview toggle */}
      <button className="crm-btn crm-btn--ghost" onClick={() => setShowPreview(v => !v)} style={{ alignSelf:'flex-start' }}>
        👁 {showPreview ? 'Hide' : 'Preview'} Quotation
      </button>

      {/* Preview card */}
      {showPreview && (
        <div style={{ border:'2px solid rgba(201,150,60,0.3)', borderRadius:12, padding:20, background:'#fff', fontSize:13 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
            <div><div style={{ fontWeight:800, fontSize:16, color:'#0A1628' }}>DNex Consulting</div><div style={{ fontSize:11, color:'#64748b' }}>Dubai, UAE</div></div>
            <div style={{ textAlign:'right' }}><div style={{ fontWeight:700, color:GOLD, fontSize:14 }}>QUOTATION</div><div style={{ fontSize:11, color:'#64748b' }}>Date: {new Date().toLocaleDateString()}</div><div style={{ fontSize:11, color:'#64748b' }}>Valid: {validity} days</div></div>
          </div>
          <div style={{ marginBottom:12, padding:10, background:'#f8fafc', borderRadius:8, fontSize:12 }}>
            <strong>{crmCase.full_name}</strong> · {crmCase.email} · {crmCase.phone}
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
            <thead><tr style={{ background:'#0A1628', color:'#fff' }}>{['Description','Qty','Rate','Amount'].map(h => <th key={h} style={{ padding:'6px 8px', textAlign:'left', fontSize:11 }}>{h}</th>)}</tr></thead>
            <tbody>{items.map((it, i) => <tr key={i} style={{ borderBottom:'1px solid #e2e8f0' }}><td style={{ padding:'6px 8px' }}>{it.description}</td><td style={{ padding:'6px 8px' }}>{it.qty}</td><td style={{ padding:'6px 8px' }}>{currency} {it.rate.toFixed(2)}</td><td style={{ padding:'6px 8px', fontWeight:600 }}>{currency} {it.amount.toFixed(2)}</td></tr>)}</tbody>
          </table>
          <div style={{ textAlign:'right', fontSize:13 }}>
            <div style={{ color:'#64748b' }}>Subtotal: {currency} {subtotal.toFixed(2)}</div>
            {discountPct > 0 && <div style={{ color:'#34d399' }}>Discount ({discountPct}%): -{currency} {discountAmt.toFixed(2)}</div>}
            <div style={{ color:'#64748b' }}>Tax ({taxRate}%): {currency} {tax.toFixed(2)}</div>
            <div style={{ fontWeight:800, fontSize:16, color:'#0A1628', marginTop:4 }}>Total: {currency} {total.toFixed(2)}</div>
          </div>
          {notes && <div style={{ marginTop:10, fontSize:11, color:'#64748b', borderTop:'1px solid #e2e8f0', paddingTop:8 }}>Notes: {notes}</div>}
        </div>
      )}

      {/* Action buttons */}
      {!isViewOnly && (
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', paddingTop:4 }}>
          <button className="crm-btn crm-btn--primary" disabled={saving || items.length === 0} onClick={saveQuotation}>
            {saving ? 'Saving...' : '💾 Save & Advance to Quotation Sent'} <ChevronRight size={14}/>
          </button>
          <button className="crm-btn crm-btn--success" style={{ background:'#25d366' }} disabled={sendingWA || items.length === 0} onClick={sendViaWhatsApp}>
            {sendingWA ? 'Opening...' : '💬 Send via WhatsApp'}
          </button>
          <button className="crm-btn crm-btn--primary" style={{ background:'#2563eb' }} disabled={sendingEmail || items.length === 0} onClick={sendViaEmail}>
            {sendingEmail ? 'Sending...' : '📧 Send via Email'}
          </button>
        </div>
      )}

      {/* Client confirmed → move to payment */}
      {!isViewOnly && (quoteSaved || crmCase.status === 'Quotation Sent') && (
        <div style={{ display:'flex', gap:10, padding:14, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)', borderRadius:10, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ flex:1, fontSize:13, color:'#065f46' }}>✅ Quotation sent! Has the client confirmed acceptance?</div>
          <button className="crm-btn crm-btn--success" onClick={clientConfirmed}>
            <CheckCircle size={14}/> Client Confirmed — Move to Payment
          </button>
        </div>
      )}

      {/* Quotation history timeline — always visible */}
      {prevQuotations.length > 0 && (
        <div style={{ marginTop:8 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#64748b', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>📋 Quotation History ({prevQuotations.length})</div>
          <div style={{ position:'relative', paddingLeft:20 }}>
            <div style={{ position:'absolute', left:7, top:0, bottom:0, width:2, background:'rgba(201,150,60,0.25)' }}/>
            {prevQuotations.map((q, idx) => (
              <div key={q.id} style={{ position:'relative', marginBottom:14 }}>
                <div style={{ position:'absolute', left:-17, top:4, width:10, height:10, borderRadius:'50%', background: STATUS_C[q.status] ?? '#94a3b8', border:'2px solid #fff', boxShadow:'0 0 0 2px rgba(201,150,60,0.3)' }}/>
                <div style={{ background:'rgba(0,0,0,0.03)', borderRadius:8, padding:'10px 12px', border:'1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontWeight:700, fontSize:13, color:'#1e293b' }}>{q.quotation_number}</span>
                    <span style={{ fontSize:11, fontWeight:600, color: STATUS_C[q.status] ?? '#94a3b8', background:`${STATUS_C[q.status] ?? '#94a3b8'}18`, padding:'2px 8px', borderRadius:20 }}>{q.status}</span>
                  </div>
                  <div style={{ fontSize:12, color:'#64748b' }}>Total: <strong>{currency} {Number(q.total).toLocaleString()}</strong> · {q.service_name}</div>
                  <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{new Date(q.created_at).toLocaleString()} · Valid {q.validity_days}d · Tax {q.tax_rate}%{Number(q.discount) > 0 ? ` · Discount: ${currency} ${Number(q.discount).toFixed(2)}` : ''}</div>
                  {idx === 0 && <div style={{ fontSize:10, color:GOLD, marginTop:4, fontWeight:600 }}>← Latest</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}





// ── Step: Payment ────────────────────────────────────────────────────────────
export function PaymentStep({ crmCase, onRefresh, onBack, isViewOnly }: Props) {
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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
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
      {!isViewOnly && (
        <div style={{ display:'flex', gap:10 }}>
          <button className="crm-btn crm-btn--primary" disabled={saving || !amount} onClick={sendLink}>
            {saving ? 'Sending...' : 'Send Payment Link'} <Send size={14}/>
          </button>
          <button className="crm-btn crm-btn--success" disabled={markingPaid} onClick={markPaid}>
            {markingPaid ? '...' : '✓ Mark as Paid (Manual)'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Step: Processing ─────────────────────────────────────────────────────────
export function ProcessingStep({ crmCase, onRefresh, onBack, isViewOnly }: Props) {
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

      {!isViewOnly && (
        <div style={{ display:'flex', gap:10 }}>
          <button className="crm-btn crm-btn--ghost" disabled={saving} onClick={saveNotes}>
            {saving ? 'Saving...' : '💾 Save Notes'}
          </button>
          <button className="crm-btn crm-btn--success" disabled={closing} onClick={closeCase}>
            {closing ? '...' : '✅ Mark Service Complete & Close Case'}
          </button>
        </div>
      )}
    </div>
  );
}

