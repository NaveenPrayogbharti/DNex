import { useState, useEffect } from 'react';
import { Phone, CheckCircle, XCircle, ChevronRight, Send, FileText, CreditCard, Package } from 'lucide-react';
import { updateCaseStatus, updateCase, updateCaseWorkflowField } from '../services/caseService';
import type { CRMCase, CaseStatus } from '../services/caseService';
import { logCall } from '../services/callService';
import { createQuotation } from '../services/quotationService';
import type { QuotationItem } from '../services/quotationService';
import { createPayment } from '../services/paymentService';
import { fetchServicesForCRM } from '../../../lib/servicesStore';
import type { ServiceItem } from '../../../lib/servicesStore';

const GOLD = '#C9963C';

const INPUT = 'width:100%;padding:9px 12px;background:rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.1);border-radius:8px;color:#1e293b;font-size:14px;outline:none;font-family:inherit';
const TEXTAREA = INPUT + ';resize:vertical;min-height:80px';

interface Props {
  crmCase: CRMCase;
  onRefresh: () => void;
}

// ── Step: Contacted ──────────────────────────────────────────────────────────
export function ContactedStep({ crmCase, onRefresh }: Props) {
  const [dur, setDur] = useState(5);
  const [outcome, setOutcome] = useState<'answered'|'voicemail'|'no_answer'|'busy'>('answered');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [nextAction, setNextAction] = useState<'req_gathering'|'another_call'|null>(null);

  const saveCall = async () => {
    setSaving(true);
    try {
      await logCall(crmCase.id, { duration_minutes: dur, outcome, notes });
    } finally { setSaving(false); }
  };

  const confirm = async () => {
    if (!nextAction) return;
    setSaving(true);
    try {
      await saveCall();
      const next: CaseStatus = nextAction === 'req_gathering' ? 'Requirement Gathering' : 'Contacted';
      await updateCaseStatus(crmCase.id, next);
      onRefresh();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, color:GOLD, fontWeight:700, fontSize:15 }}>
        <Phone size={18} /> Log This Call
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Duration (mins)</label>
          <input style={{ ...{ cssText: INPUT } as any }} type="number" value={dur} min={1}
            onChange={e => setDur(+e.target.value)}
            className="crm-input" />
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
      <div style={{ fontSize:13, color:'#1e293b', fontWeight:600 }}>What's next?</div>
      <div style={{ display:'flex', gap:10 }}>
        <button className={`crm-btn ${nextAction==='req_gathering'?'crm-btn--primary':'crm-btn--ghost'}`}
          onClick={() => setNextAction('req_gathering')}>
          <ChevronRight size={14}/> Proceed to Requirement Gathering
        </button>
        <button className={`crm-btn ${nextAction==='another_call'?'crm-btn--primary':'crm-btn--ghost'}`}
          onClick={() => setNextAction('another_call')}>
          <Phone size={14}/> Schedule Another Call
        </button>
      </div>
      <button className="crm-btn crm-btn--primary" disabled={!nextAction || saving} onClick={confirm}
        style={{ alignSelf:'flex-start' }}>
        {saving ? 'Saving...' : 'Confirm & Continue'} <ChevronRight size={14}/>
      </button>
    </div>
  );
}

// ── Step: Requirement Gathering ──────────────────────────────────────────────
export function RequirementStep({ crmCase, onRefresh }: Props) {
  const [fields, setFields] = useState({ budget: '', timeline: '', business_type: '', nationality: '', other_info: '' });
  const [decision, setDecision] = useState<'interested'|'not_interested'|null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

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
      <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}>📋 Gather Client Requirements</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[['Budget Range','budget','e.g. AED 10,000–20,000'],['Timeline','timeline','e.g. ASAP / 2 months'],
          ['Business Type','business_type','e.g. Trading, Consulting'],['Nationality','nationality','Client nationality']
        ].map(([label, key, ph]) => (
          <div key={key} style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>{label}</label>
            <input className="crm-input" placeholder={ph} value={(fields as any)[key]}
              onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}
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
export function ServiceStep({ crmCase, onRefresh }: Props) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServicesForCRM().then(setServices).catch(console.error);
  }, []);

  const confirm = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateCaseWorkflowField(crmCase.id, 'selected_service', selected.title);
      await updateCase(crmCase.id, { service_type: selected.title });
      await updateCaseStatus(crmCase.id, 'Service Assigned');
      onRefresh();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}><Package size={18} style={{ display:'inline', marginRight:6 }}/>Select Service</div>
      {services.length === 0 ? (
        <div style={{ padding:20, textAlign:'center', color:'#64748b', fontSize:14 }}>Loading services...</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {services.map(svc => (
            <div key={svc.id}
              onClick={() => setSelected(svc)}
              style={{
                padding:14, border:`2px solid ${selected?.id===svc.id?GOLD:'rgba(0,0,0,0.1)'}`,
                borderRadius:10, cursor:'pointer', background: selected?.id===svc.id?'rgba(201,150,60,0.08)':'rgba(0,0,0,0.02)',
                transition:'all 0.2s',
              }}>
              <div style={{ fontWeight:700, color:'#1e293b', fontSize:14 }}>{svc.title}</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>{svc.description}</div>
            </div>
          ))}
        </div>
      )}
      {selected && (
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
            📧 Notification will be sent via Email & WhatsApp to the client.
          </div>
        </div>
      )}
      <button className="crm-btn crm-btn--primary" disabled={!selected || saving} onClick={confirm} style={{ alignSelf:'flex-start' }}>
        {saving ? 'Saving...' : 'Confirm Service & Notify Client'} <Send size={14}/>
      </button>
    </div>
  );
}

// ── Step: Quotation ──────────────────────────────────────────────────────────
export function QuotationStep({ crmCase, onRefresh }: Props) {
  const [items, setItems] = useState<QuotationItem[]>([{ description: crmCase.service_type || '', qty: 1, rate: 0, amount: 0 }]);
  const [taxRate, setTaxRate] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [validity, setValidity] = useState(30);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const updateItem = (i: number, key: keyof QuotationItem, val: string | number) => {
    setItems(prev => prev.map((it, idx) => {
      if (idx !== i) return it;
      const updated = { ...it, [key]: val };
      if (key === 'qty' || key === 'rate') updated.amount = parseFloat((+updated.qty * +updated.rate).toFixed(2));
      return updated;
    }));
  };

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax - discount;

  const generate = async () => {
    setSaving(true);
    try {
      await createQuotation(crmCase.id, {
        client_name: crmCase.full_name,
        client_email: crmCase.email,
        client_phone: crmCase.phone,
        service_name: crmCase.service_type,
        items, tax_rate: taxRate, discount, validity_days: validity, notes,
      });
      await updateCaseStatus(crmCase.id, 'Quotation Sent');
      onRefresh();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}><FileText size={18} style={{ display:'inline', marginRight:6 }}/>Generate Quotation</div>
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr auto', gap:8, marginBottom:8, fontSize:11, color:'#94a3b8', fontWeight:700 }}>
          <span>Description</span><span>Qty</span><span>Rate (AED)</span><span>Amount</span><span></span>
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr auto', gap:8, marginBottom:8 }}>
            <input className="crm-input" value={it.description} placeholder="Service description"
              onChange={e => updateItem(i, 'description', e.target.value)} />
            <input className="crm-input" type="number" value={it.qty} min={1}
              onChange={e => updateItem(i, 'qty', +e.target.value)} />
            <input className="crm-input" type="number" value={it.rate} min={0}
              onChange={e => updateItem(i, 'rate', +e.target.value)} />
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
          <input className="crm-input" type="number" value={taxRate} min={0} max={100}
            onChange={e => setTaxRate(+e.target.value)} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Discount (AED)</label>
          <input className="crm-input" type="number" value={discount} min={0}
            onChange={e => setDiscount(+e.target.value)} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Validity (days)</label>
          <input className="crm-input" type="number" value={validity} min={1}
            onChange={e => setValidity(+e.target.value)} />
        </div>
      </div>
      <div style={{ background:'rgba(0,0,0,0.04)', borderRadius:10, padding:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#94a3b8', marginBottom:4 }}>
          <span>Subtotal</span><span>AED {subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#94a3b8', marginBottom:4 }}>
          <span>Tax ({taxRate}%)</span><span>AED {tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#34d399', marginBottom:4 }}>
            <span>Discount</span><span>- AED {discount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:800, color:'#0A1628', borderTop:'1px solid rgba(0,0,0,0.1)', paddingTop:8, marginTop:4 }}>
          <span>Total</span><span>AED {total.toFixed(2)}</span>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Notes</label>
        <textarea className="crm-textarea" rows={2} value={notes}
          onChange={e => setNotes(e.target.value)} placeholder="Additional notes for quotation..." />
      </div>
      <div style={{ padding:10, background:'rgba(201,150,60,0.08)', border:'1px solid rgba(201,150,60,0.2)', borderRadius:8, fontSize:12, color:'#64748b' }}>
        📧 Quotation will be sent via <strong style={{ color:GOLD }}>Email & WhatsApp</strong> to the client automatically.
      </div>
      <button className="crm-btn crm-btn--primary" disabled={saving || items.length === 0} onClick={generate} style={{ alignSelf:'flex-start' }}>
        {saving ? 'Generating...' : 'Generate & Send Quotation'} <Send size={14}/>
      </button>
    </div>
  );
}

// ── Step: Payment ────────────────────────────────────────────────────────────
export function PaymentStep({ crmCase, onRefresh }: Props) {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState(crmCase.service_type || '');
  const [saving, setSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const sendLink = async () => {
    if (!amount) return;
    setSaving(true);
    try {
      await createPayment(crmCase.id, parseFloat(amount), desc);
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

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}><CreditCard size={18} style={{ display:'inline', marginRight:6 }}/>Payment</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Amount (AED)</label>
          <input className="crm-input" type="number" value={amount} placeholder="0.00" onChange={e => setAmount(e.target.value)} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Description</label>
          <input className="crm-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Service fee..." />
        </div>
      </div>
      <div style={{ padding:10, background:'rgba(201,150,60,0.08)', border:'1px solid rgba(201,150,60,0.2)', borderRadius:8, fontSize:12, color:'#64748b' }}>
        🔗 Payment link will be sent via <strong style={{ color:GOLD }}>Email & WhatsApp</strong>. Once paid, status auto-updates.
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
export function ProcessingStep({ crmCase, onRefresh }: Props) {
  const [procNotes, setProcNotes] = useState(crmCase.processing_notes || '');
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);

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

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ color:GOLD, fontWeight:700, fontSize:15 }}>⚙️ Processing</div>
      <div style={{ padding:12, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:10, fontSize:13, color:'#4f46e5' }}>
        Use verified documents to process the requested service. Update notes regularly — client receives periodic notifications.
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
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
