import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Phone, CheckCircle, XCircle, ChevronRight, ChevronDown, Send, FileText, CreditCard, Package, ArrowLeft, Plus, Paperclip, Image, File, UploadCloud, RefreshCw } from 'lucide-react';
import logo from '@/assets/images/website_logo.png';
import { updateCaseStatus, updateCase, updateCaseWorkflowField } from '../services/caseService';
import type { CRMCase, CaseStatus } from '../services/caseService';
import { logCall, fetchCalls } from '../services/callService';
import type { CRMCall } from '../services/callService';
import { createQuotation, fetchQuotations, updateQuotationStatus } from '../services/quotationService';
import type { QuotationItem, CRMQuotation } from '../services/quotationService';
import { createPayment } from '../services/paymentService';
import { fetchServicesForCRM } from '../../../lib/servicesStore';
import type { ServiceItem } from '../../../lib/servicesStore';
import { OUTCOME_LABELS, OUTCOME_COLORS } from '../services/callService';
import { sendCustomEmail } from '../services/emailNotificationService';
import { generateQuotationPDFBase64 } from '../utils/pdfGenerator';
import jsPDF from 'jspdf';
import { fetchDocuments } from '../services/documentService';
import type { CRMDocument } from '../services/documentService';
import { fetchPayments, updatePaymentStatus } from '../services/paymentService';
import type { CRMPayment } from '../services/paymentService';
const GOLD = '#C9963C';

// ── Shared attachment type (used in ProcessingStep) ────────────────────────────
interface AttachmentFile {
  filename: string;
  content: string;       // base64
  contentType: string;   // MIME type
  encoding: 'base64';
  sizeKb: number;        // for display
}
const MAX_ATTACH_MB = 10;
function getAttachIcon(contentType: string) {
  if (contentType.startsWith('image/')) return <Image size={13} color='#94a3b8' />;
  if (contentType === 'application/pdf' || contentType.includes('text')) return <FileText size={13} color='#94a3b8' />;
  return <File size={13} color='#94a3b8' />;
}

interface Props {
  crmCase: CRMCase;
  onRefresh: () => void;
  onBack?: () => void;
  isViewOnly?: boolean;
  isCaseLocked?: boolean;
  effectiveStage?: string;
  onReturnToCurrent?: () => void;
}

// ── Step: Contacted ──────────────────────────────────────────────────────────
export function ContactedStep({ crmCase, onRefresh, onBack, isViewOnly }: Props) {
  const [dur, setDur] = useState(5);
  const [outcome, setOutcome] = useState<'answered' | 'voicemail' | 'no_answer' | 'busy'>('answered');
  const [notes, setNotes] = useState('');
  const [recordingData, setRecordingData] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [logSaved, setLogSaved] = useState(false);
  const [callLogs, setCallLogs] = useState<CRMCall[]>([]);
  const [nextAction, setNextAction] = useState<'req_gathering' | 'another_call' | null>(null);

  // Load existing call logs for this case
  useEffect(() => {
    fetchCalls(crmCase.id).then(setCallLogs).catch(console.error);
  }, [crmCase.id, logSaved]);

  const saveCallLog = async () => {
    setSaving(true);
    try {
      const finalNotes = recordingData ? `${notes}\n\n[RECORDING_DATA]:${recordingData}` : notes;
      await logCall(crmCase.id, { duration_minutes: dur, outcome, notes: finalNotes });
      setLogSaved(v => !v); // trigger reload
      setDur(5); setOutcome('answered'); setNotes(''); setRecordingData(null);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf: 'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: GOLD, fontWeight: 700, fontSize: 15 }}>
        <Phone size={18} /> Log a Call
      </div>

      {/* Existing call logs */}
      {callLogs.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Previous Calls ({callLogs.length})</div>
          {callLogs.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <div style={{ fontWeight: 600, color: OUTCOME_COLORS[c.outcome] ?? '#1e293b', fontSize: 13 }}>{OUTCOME_LABELS[c.outcome]}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.called_at ? new Date(c.called_at).toLocaleString() : ''}</div>
                {c.notes && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                    {c.notes.includes('[RECORDING_DATA]:') ? (
                      <>
                        <div style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>{c.notes.split('[RECORDING_DATA]:')[0].trim()}</div>
                        <audio controls src={c.notes.split('[RECORDING_DATA]:')[1]?.trim()} style={{ height: 32, width: '100%', maxWidth: 300, outline: 'none' }} />
                      </>
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{c.notes}</div>
                    )}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{c.called_by_name ?? 'Agent'}</div>
            </div>
          ))}
        </div>
      )}

      {/* New call form (hidden in view-only mode) */}
      {!isViewOnly && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Outcome</label>
              <select className="crm-select" value={outcome} onChange={e => setOutcome(e.target.value as any)}>
                <option value="answered">Answered</option>
                <option value="voicemail">Voicemail</option>
                <option value="no_answer">No Answer</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Call Notes</label>
            <textarea className="crm-textarea" rows={3} value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="What was discussed..." />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Call Recording (Optional)</label>
            <input type="file" accept="audio/*" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) {
                setRecordingData(null);
                return;
              }
              const reader = new FileReader();
              reader.onload = () => setRecordingData(reader.result as string);
              reader.readAsDataURL(file);
            }} style={{ fontSize: 12 }} />
          </div>

          <button className="crm-btn crm-btn--ghost" disabled={saving} onClick={saveCallLog}
            style={{ alignSelf: 'flex-start' }}>
            <Plus size={14} /> {saving ? 'Saving...' : 'Save Call Log'}
          </button>

          <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>What's next?</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className={`crm-btn ${nextAction === 'req_gathering' ? 'crm-btn--primary' : 'crm-btn--ghost'}`}
              onClick={() => setNextAction('req_gathering')}>
              <ChevronRight size={14} /> Proceed to Requirement Gathering
            </button>
          </div>
          <button className="crm-btn crm-btn--primary" disabled={!nextAction || saving} onClick={confirm}
            style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Saving...' : 'Confirm & Continue'} <ChevronRight size={14} />
          </button>
        </>
      )}
    </div>
  );
}

export function RequirementStep({ crmCase, onRefresh, onBack, isViewOnly, isCaseLocked, onReturnToCurrent }: Props) {
  const [fields, setFields] = useState({
    service_title: crmCase.requirement_data?.service_title || '',
    budget: crmCase.requirement_data?.budget || '',
    currency: crmCase.requirement_data?.currency || 'AED',
    timeline: crmCase.requirement_data?.timeline || '',
    business_type: crmCase.requirement_data?.business_type || '',
    custom_business_type: crmCase.requirement_data?.custom_business_type || '',
    nationality: crmCase.requirement_data?.nationality || '',
    other_info: crmCase.requirement_data?.other_info || ''
  });
  const [sendingReq, setSendingReq] = useState(false);
  const [reqSentStatus, setReqSentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saving, setSaving] = useState(false);
  const [natSearch, setNatSearch] = useState('');
  const [natOpen, setNatOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [historicalEditMode, setHistoricalEditMode] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const effectivelyViewOnly = isViewOnly && !historicalEditMode;

  useEffect(() => {
    fetchServicesForCRM().then(setServices).catch(console.error);
  }, []);

  const updateHistory = async () => {
    setSaving(true);
    try {
      await updateCaseWorkflowField(crmCase.id, 'requirement_data', fields);
      await updateCase(crmCase.id, { service_type: fields.service_title });
      await updateCaseWorkflowField(crmCase.id, 'selected_service', fields.service_title);
      onRefresh();
      setHistoricalEditMode(false);
      if (onReturnToCurrent) onReturnToCurrent();
    } finally { setSaving(false); }
  };

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
    'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Argentine', 'Armenian',
    'Australian', 'Austrian', 'Azerbaijani', 'Bahraini', 'Bangladeshi', 'Belarusian', 'Belgian',
    'Bolivian', 'Bosnian', 'Brazilian', 'British', 'Bulgarian', 'Cambodian', 'Cameroonian', 'Canadian',
    'Chilean', 'Chinese', 'Colombian', 'Congolese', 'Croatian', 'Cuban', 'Czech', 'Danish', 'Dutch',
    'Egyptian', 'Emirati', 'Eritrean', 'Estonian', 'Ethiopian', 'Fijian', 'Finnish', 'French',
    'Georgian', 'German', 'Ghanaian', 'Greek', 'Guatemalan', 'Guinean', 'Haitian', 'Honduran',
    'Hungarian', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian', 'Ivorian',
    'Jamaican', 'Japanese', 'Jordanian', 'Kazakhstani', 'Kenyan', 'Korean', 'Kuwaiti', 'Kyrgyz',
    'Laotian', 'Latvian', 'Lebanese', 'Liberian', 'Libyan', 'Lithuanian', 'Luxembourgish',
    'Malagasy', 'Malawian', 'Malaysian', 'Maldivian', 'Malian', 'Maltese', 'Mauritanian',
    'Mauritian', 'Mexican', 'Moldovan', 'Mongolian', 'Moroccan', 'Mozambican', 'Myanmar',
    'Namibian', 'Nepali', 'New Zealander', 'Nicaraguan', 'Nigerian', 'Norwegian', 'Omani',
    'Pakistani', 'Palestinian', 'Panamanian', 'Paraguayan', 'Peruvian', 'Filipino', 'Polish',
    'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Rwandan', 'Saudi', 'Senegalese', 'Serbian',
    'Sierra Leonean', 'Singaporean', 'Slovak', 'Slovenian', 'Somali', 'South African', 'Spanish',
    'Sri Lankan', 'Sudanese', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Tajik', 'Tanzanian',
    'Thai', 'Togolese', 'Tunisian', 'Turkish', 'Turkmen', 'Ugandan', 'Ukrainian', 'Uruguayan',
    'Uzbek', 'Venezuelan', 'Vietnamese', 'Yemeni', 'Zambian', 'Zimbabwean', 'Other'
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
    setSaving(true);
    try {
      await updateCaseWorkflowField(crmCase.id, 'requirement_data', fields);
      await updateCase(crmCase.id, { service_type: fields.service_title });
      await updateCaseWorkflowField(crmCase.id, 'selected_service', fields.service_title);
      await updateCaseStatus(crmCase.id, 'Service Assigned');
      onRefresh();
    } finally { setSaving(false); }
  };

  const sendRequirements = async () => {
    setSendingReq(true);
    setReqSentStatus('idle');
    try {
      const reqBody = [
        fields.service_title ? `<b>Service Required:</b> ${fields.service_title}` : '',
        `<b>Budget:</b> ${fields.currency} ${fields.budget || '—'}`,
        fields.timeline ? `<b>Timeline:</b> ${fields.timeline}` : '',
        fields.business_type ? `<b>Business Type:</b> ${fields.business_type}${fields.custom_business_type ? ` (${fields.custom_business_type})` : ''}` : '',
        fields.nationality ? `<b>Nationality:</b> ${fields.nationality}` : '',
        fields.other_info ? `<b>Additional Info:</b> ${fields.other_info}` : '',
      ].filter(Boolean).join('<br/>');
      const res = await sendCustomEmail({
        to: crmCase.email,
        subject: `Your Service Requirement Details — ${crmCase.case_id} | DNex Consulting`,
        body: `<p>Dear <strong>${crmCase.full_name}</strong>,</p><p>Thank you for discussing your requirements with us. Here is a summary of what we have gathered:</p><div style="background:#f8fafc;padding:16px;border-radius:8px;margin:12px 0;">${reqBody}</div><p>Our team will review these and get back to you shortly with a tailored proposal.</p><p style="margin-top:16px;">Best regards,<br/><strong>DNex Consulting Team</strong></p>`,
      });
      setReqSentStatus(res.success ? 'success' : 'error');
    } catch { setReqSentStatus('error'); }
    finally { setSendingReq(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf: 'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: GOLD, fontWeight: 700, fontSize: 15 }}>📋 Gather Client Requirements</div>
        {isViewOnly && !historicalEditMode && !isCaseLocked && (
          <button className="crm-btn crm-btn--ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setHistoricalEditMode(true)}>
            ✏️ Edit Data
          </button>
        )}
        {historicalEditMode && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="crm-btn crm-btn--ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setHistoricalEditMode(false)}>Cancel</button>
            <button className="crm-btn crm-btn--primary" style={{ fontSize: 12, padding: '4px 10px', background: '#eab308' }} disabled={saving} onClick={updateHistory}>{saving ? 'Updating...' : 'Save Updates'}</button>
          </div>
        )}
      </div>

      {/* Service Requirement Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
        <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Service Requirement Title *</label>
        
        <div 
          className="crm-input" 
          style={{ minHeight: 38, cursor: effectivelyViewOnly ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}
          onClick={() => !effectivelyViewOnly && setServiceOpen(!serviceOpen)}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
            {fields.service_title ? fields.service_title.split(', ').map(s => (
              <span key={s} style={{ background: 'rgba(201,150,60,0.1)', color: '#C9963C', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {s}
                {!effectivelyViewOnly && (
                  <span 
                    style={{ cursor: 'pointer', opacity: 0.6 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = fields.service_title.split(', ').filter(x => x !== s);
                      setFields(f => ({ ...f, service_title: next.join(', ') }));
                    }}
                  >
                    ×
                  </span>
                )}
              </span>
            )) : <span style={{ color: '#94a3b8' }}>Select services...</span>}
          </div>
          <ChevronDown size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
        </div>

        {serviceOpen && !effectivelyViewOnly && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, zIndex: 10, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: 4 }}>
            {services.map(svc => {
              const service = svc.title;
              const selected = (fields.service_title || '').split(', ').includes(service);
              return (
                <div 
                  key={svc.id}
                  style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: selected ? '#f8fafc' : '#fff', borderBottom: '1px solid #f1f5f9' }}
                  onClick={() => {
                    const current = (fields.service_title || '').split(', ').filter(Boolean);
                    let next;
                    if (current.includes(service)) next = current.filter(s => s !== service);
                    else next = [...current, service];
                    setFields(f => ({ ...f, service_title: next.join(', ') }));
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.background = selected ? '#f8fafc' : '#fff')}
                >
                  <input type="checkbox" checked={selected} readOnly style={{ accentColor: '#C9963C' }} />
                  <span style={{ fontSize: 13, color: '#1e293b' }}>{service}</span>
                </div>
              );
            })}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
              <input 
                className="crm-input" 
                placeholder="Other custom service..." 
                style={{ fontSize: 13, padding: '4px 8px' }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      const current = (fields.service_title || '').split(', ').filter(Boolean);
                      if (!current.includes(val)) {
                        setFields(f => ({ ...f, service_title: [...current, val].join(', ') }));
                      }
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>
            <div style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '8px 12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-start' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setServiceOpen(false);
                }}
                className="crm-btn crm-btn--primary" 
                style={{ fontSize: 12, padding: '4px 16px' }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Budget with Currency Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Budget Amount *</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <select className="crm-select" value={fields.currency} disabled={effectivelyViewOnly}
              onChange={e => setFields(f => ({ ...f, currency: e.target.value }))}
              style={{ width: '90px', flexShrink: 0 }}>
              {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            <input type="text" className="crm-input" placeholder="e.g. 15000"
              value={fields.budget} disabled={effectivelyViewOnly} onChange={e => handleBudgetChange(e.target.value)} style={{ flex: 1 }} />
          </div>
        </div>

        {/* Timeline — Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Timeline (Target Date)</label>
          <input type="date" className="crm-input"
            value={fields.timeline} disabled={effectivelyViewOnly}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setFields(f => ({ ...f, timeline: e.target.value }))} />
        </div>

        {/* Business Type Dropdown + custom input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Business Type</label>
          <select className="crm-select" value={fields.business_type} disabled={effectivelyViewOnly}
              onChange={e => setFields(f => ({ ...f, business_type: e.target.value, custom_business_type: '' }))}>
            <option value="">Select industry type...</option>
            {businessTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          {isCustomBusiness && (
            <input className="crm-input" placeholder="Enter business type..." disabled={effectivelyViewOnly}
              value={fields.custom_business_type}
              onChange={e => setFields(f => ({ ...f, custom_business_type: e.target.value }))} />
          )}
        </div>

        {/* Nationality — searchable dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Nationality</label>
          <input className="crm-input"
            placeholder="Search nationality..."
            value={natSearch || fields.nationality} disabled={effectivelyViewOnly}
            onFocus={() => { if (!effectivelyViewOnly) { setNatOpen(true); setNatSearch(''); } }}
            onChange={e => { if (!effectivelyViewOnly) { setNatSearch(e.target.value); setNatOpen(true); } }} />
          {natOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 200, overflowY: 'auto', marginTop: 2
            }}>
              {filteredNats.map(n => (
                <div key={n}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#1e293b',
                    background: fields.nationality === n ? '#f0f9ff' : 'transparent'
                  }}
                  onMouseDown={() => {
                    setFields(f => ({ ...f, nationality: n }));
                    setNatSearch(''); setNatOpen(false);
                  }}>
                  {n}
                </div>
              ))}
              {filteredNats.length === 0 && (
                <div style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>No match found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {natOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setNatOpen(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Additional Information</label>
        <textarea className="crm-textarea" rows={3} value={fields.other_info} disabled={effectivelyViewOnly}
          onChange={e => setFields(f => ({ ...f, other_info: e.target.value }))}
          placeholder="Any special requirements, notes from client..." />
      </div>

      {!isViewOnly && (
        <>
          {/* Send Requirements Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="crm-btn crm-btn--primary" style={{ background: '#2563eb' }}
              disabled={sendingReq}
              onClick={sendRequirements}>
              <Send size={14} /> {sendingReq ? 'Sending...' : 'Capture Client Details'}
            </button>
            {reqSentStatus === 'success' && <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>✓ Sent successfully!</span>}
            {reqSentStatus === 'error' && <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>✗ Failed to send.</span>}
          </div>

          <button className="crm-btn crm-btn--primary"
            disabled={saving}
            onClick={confirm} style={{ alignSelf: 'flex-start', marginTop: 16 }}>
            {saving ? 'Saving...' : 'Confirm & Continue'} <ChevronRight size={14} />
          </button>
        </>
      )}
    </div>
  );
}


export function QuotationStep({ crmCase, onRefresh, onBack, isViewOnly, isCaseLocked, onReturnToCurrent }: Props) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [items, setItems] = useState<QuotationItem[]>(() => {
    if (!crmCase.service_type) return [{ service_name: '', description: '', qty: 1, rate: 0, amount: 0 }];
    const parts = crmCase.service_type.split(', ');
    return parts.map(p => ({ service_name: p, description: p, qty: 1, rate: 0, amount: 0 }));
  });
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
  const [historicalEditMode, setHistoricalEditMode] = useState(false);
  const effectivelyViewOnly = isViewOnly && !historicalEditMode;

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
      if (!isViewOnly) {
        await updateCaseStatus(crmCase.id, 'Quotation Sent');
      }
      setQuoteSaved(true);
      fetchQuotations(crmCase.id).then(setPrevQuotations).catch(console.error);
      setHistoricalEditMode(false);
      onRefresh();
      if (isViewOnly && onReturnToCurrent) onReturnToCurrent();
    } finally { setSaving(false); }
  };

  const sendViaWhatsApp = async () => {
    setSendingWA(true);
    try {
      if (!quoteSaved || historicalEditMode) {
        await saveQuotation();
      }
      let phone = crmCase.phone.replace(/[^0-9]/g, '');
      if (phone.startsWith('0')) phone = '971' + phone.slice(1);
      const msg = `Dear ${crmCase.full_name},\n\nYour quotation from DNex Consulting:\nService: ${crmCase.service_type}\nSubtotal: ${currency} ${subtotal.toFixed(2)}\nDiscount (${discountPct}%): -${currency} ${discountAmt.toFixed(2)}\nTax (${taxRate}%): ${currency} ${tax.toFixed(2)}\n*Total: ${currency} ${total.toFixed(2)}*\nValidity: ${validity} days\n\nReply to confirm. Thank you!`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } finally { setSendingWA(false); }
  };

  const sendViaEmail = async () => {
    setSendingEmail(true);
    try {
      if (!quoteSaved || historicalEditMode) {
        await saveQuotation();
      }
      const pdfBase64 = generateQuotationPDFBase64({ crmCase, items, subtotal, tax, taxRate, discountAmt, discountPct, total, validity, currency });
      const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';
      await sendCustomEmail({
        to: crmCase.email,
        subject: `Quotation — ${crmCase.service_type} | DNex Consulting`,
        body: `<p>Dear <strong>${crmCase.full_name}</strong>,</p><p>Please find your quotation attached below.</p><table style="border-collapse:collapse;width:100%;font-family:sans-serif"><tr><td style="padding:6px 0;color:#64748b">Service</td><td><strong>${crmCase.service_type}</strong></td></tr><tr><td style="padding:6px 0;color:#64748b">Subtotal</td><td>${currency} ${subtotal.toFixed(2)}</td></tr>${discountPct > 0 ? `<tr><td style="padding:6px 0;color:#34d399">Discount (${discountPct}%)</td><td>-${currency} ${discountAmt.toFixed(2)}</td></tr>` : ''}<tr><td style="padding:6px 0;color:#64748b">Tax (${taxRate}%)</td><td>${currency} ${tax.toFixed(2)}</td></tr><tr style="font-weight:700;font-size:16px"><td style="padding:8px 0;border-top:2px solid #e2e8f0">Total</td><td>${currency} ${total.toFixed(2)}</td></tr></table><p>Validity: ${validity} days</p>${notes ? `<p>Notes: ${notes}</p>` : ''}<div style="margin-top:30px;margin-bottom:30px;"><p style="margin-bottom:15px;font-weight:600;">Please click one of the options below to respond:</p><a href="${BACKEND_URL}/api/quotation/accept?case_id=${crmCase.id}" style="background-color:#10b981;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin-right:15px;display:inline-block;">✓ Accept Quotation</a><a href="${BACKEND_URL}/api/quotation/reject?case_id=${crmCase.id}" style="background-color:#ef4444;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">✗ Reject Quotation</a></div>`,
        attachments: [{
          filename: `Quotation_DNX_${crmCase.case_id}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf'
        }]
      });
      alert('Email sent successfully with PDF attached!');
    } finally { setSendingEmail(false); }
  };

  const clientConfirmed = async () => {
    await updateCaseStatus(crmCase.id, 'Payment Pending');
    onRefresh();
  };

  const STATUS_C: Record<string, string> = { sent: GOLD, accepted: '#34d399', rejected: '#f87171', draft: '#94a3b8', paid: '#0284c7' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {onBack && <button className="crm-btn crm-btn--ghost" style={{ alignSelf: 'flex-start' }} onClick={onBack}><ArrowLeft size={14} /> Back</button>}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: GOLD, fontWeight: 700, fontSize: 15 }}><FileText size={18} style={{ display: 'inline', marginRight: 6 }} />Quotation Builder</div>
          {isViewOnly && !historicalEditMode && !isCaseLocked && (
            <button className="crm-btn crm-btn--ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setHistoricalEditMode(true)}>
              ➕ Create New Quotation
            </button>
          )}
          {historicalEditMode && (
            <button className="crm-btn crm-btn--ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setHistoricalEditMode(false)}>
              Cancel
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Currency:</label>
          <select className="crm-select" style={{ width: 110, padding: '3px 6px', fontSize: 12 }} value={currency} onChange={e => setCurrency(e.target.value)} disabled={effectivelyViewOnly}>
            <option value="AED">AED (د.إ)</option>
            <option value="INR">INR (₹)</option>
            <option value="SAR">SAR (ر.س)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {/* Auto-filled client info banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 12, background: 'rgba(201,150,60,0.06)', borderRadius: 10, border: '1px solid rgba(201,150,60,0.15)', fontSize: 12 }}>
        <div><span style={{ color: '#94a3b8' }}>Client: </span><strong>{crmCase.full_name}</strong></div>
        <div><span style={{ color: '#94a3b8' }}>Service: </span><strong>{crmCase.service_type || '—'}</strong></div>
        <div><span style={{ color: '#94a3b8' }}>Case ID: </span><strong>{crmCase.case_id}</strong></div>
      </div>

      {/* Line items table */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
          <span>Description</span><span>Qty</span><span>Rate ({currency})</span><span>Amount</span><span />
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <select className="crm-select" style={{ flex: 1 }} disabled={effectivelyViewOnly}
                value={it.service_name || '__custom__'}
                onChange={e => {
                  const val = e.target.value;
                  const sel = services.find(s => s.title === val);
                  if (val !== '__custom__') {
                    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, service_name: val, description: sel ? sel.description : val } : item));
                  } else {
                    updateItem(i, 'service_name', '');
                  }
                }}>
                <option value="__custom__">Custom...</option>
                {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
              </select>
              <input className="crm-input" value={it.description} placeholder="Description" disabled={effectivelyViewOnly}
                onChange={e => updateItem(i, 'description', e.target.value)} style={{ flex: 2 }} />
            </div>
            <input className="crm-input" type="number" value={it.qty === 0 ? '' : it.qty} placeholder="1" min={1} disabled={effectivelyViewOnly}
              onChange={e => updateItem(i, 'qty', e.target.value === '' ? 0 : +e.target.value)} />
            <input className="crm-input" type="number" value={it.rate === 0 ? '' : it.rate} placeholder="0.00" min={0} disabled={effectivelyViewOnly}
              onChange={e => updateItem(i, 'rate', e.target.value === '' ? 0 : +e.target.value)} />
            <input className="crm-input" value={it.amount.toFixed(2)} readOnly style={{ opacity: 0.7 }} disabled={effectivelyViewOnly} />
            <button className="crm-btn crm-btn--danger" style={{ padding: '8px 10px' }} disabled={effectivelyViewOnly}
              onClick={() => setItems(p => p.filter((_, idx) => idx !== i))}><XCircle size={14} /></button>
          </div>
        ))}
        <button className="crm-btn crm-btn--ghost" style={{ fontSize: 13 }} disabled={effectivelyViewOnly}
          onClick={() => setItems(p => [...p, { service_name: '', description: '', qty: 1, rate: 0, amount: 0 }])}>+ Add Line</button>
      </div>

      {/* Tax / Discount / Validity row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Tax Rate (%)</label>
          <input className="crm-input" type="number" value={taxRateStr} placeholder="5" disabled={effectivelyViewOnly}
            onChange={e => setTaxRateStr(e.target.value)} onFocus={e => { if (e.target.value === '0') setTaxRateStr(''); }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Discount (%)</label>
          <input className="crm-input" type="number" value={discountPctStr} placeholder="0" min={0} max={100} disabled={effectivelyViewOnly}
            onChange={e => setDiscountPctStr(e.target.value)} onFocus={e => { if (e.target.value === '0') setDiscountPctStr(''); }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Validity (days)</label>
          <input className="crm-input" type="number" value={validityStr} placeholder="30" disabled={effectivelyViewOnly}
            onChange={e => setValidityStr(e.target.value)} />
        </div>
      </div>

      {/* Live total summary */}
      <div style={{ background: 'rgba(10,22,40,0.05)', borderRadius: 10, padding: 14, border: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 4 }}><span>Subtotal</span><span>{currency} {subtotal.toFixed(2)}</span></div>
        {discountPct > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#34d399', marginBottom: 4 }}><span>Discount ({discountPct}%) — applied before tax</span><span>-{currency} {discountAmt.toFixed(2)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 4 }}><span>Tax ({taxRate}%)</span><span>{currency} {tax.toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#0A1628', borderTop: '2px solid rgba(0,0,0,0.1)', paddingTop: 8, marginTop: 4 }}><span>Total</span><span>{currency} {total.toFixed(2)}</span></div>
      </div>

      {/* Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Notes / Terms</label>
        <textarea className="crm-textarea" rows={2} value={notes} disabled={effectivelyViewOnly}
          onChange={e => setNotes(e.target.value)} placeholder="Additional notes, payment terms..." />
      </div>

      {/* Preview & Download */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="crm-btn crm-btn--ghost" onClick={() => setShowPreview(v => !v)} style={{ alignSelf: 'flex-start' }}>
          👁 {showPreview ? 'Hide' : 'Preview'} Quotation
        </button>
        <button className="crm-btn crm-btn--ghost" onClick={() => {
          const doc = new jsPDF('p', 'pt', 'a4');
          // We can just use the download method or generate it and trigger a save.
          // Wait, generateQuotationPDFBase64 returns base64. We can create a blob.
          const b64 = generateQuotationPDFBase64({ crmCase, items, subtotal, tax, taxRate, discountAmt, discountPct, total, validity, currency });
          const link = document.createElement('a');
          link.href = `data:application/pdf;base64,${b64}`;
          link.download = `Quotation_DNX_${crmCase.case_id}.pdf`;
          link.click();
        }} style={{ alignSelf: 'flex-start' }}>
          📥 Download PDF
        </button>
      </div>

      {/* Preview card */}
      {showPreview && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 30, background: '#fff', fontSize: 13, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 20 }}>
            <div>
              <img src={logo} alt="DNex Logo" style={{ height: 40 }} />
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#475569' }}>
              <div style={{ fontWeight: 600, color: '#0A1628', fontSize: 12 }}>DNex Consulting</div>
              <div>Business Centre, Sharjah Publishing City Free Zone</div>
              <div>Sharjah, United Arab Emirates</div>
              <div>TRN: 100123456789012</div>
              <div>Phone: +971 551251185 | Email: info@dnex.ae</div>
            </div>
          </div>
          
          {/* Title & Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0A1628' }}>PROPOSAL FOR PROFESSIONAL SERVICES</div>
            <div style={{ textAlign: 'right', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <span style={{ color: '#475569' }}>Reference No:</span>
                <span style={{ fontWeight: 600 }}>DNX-QT-XXXX</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <span style={{ color: '#475569' }}>Date:</span>
                <span style={{ fontWeight: 600 }}>{new Date().toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <span style={{ color: '#475569' }}>Valid Until:</span>
                <span style={{ fontWeight: 600 }}>{new Date(Date.now() + validity * 86400000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* TO block */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: '#475569', fontSize: 12, marginBottom: 4 }}>TO:</div>
            <div style={{ fontSize: 13, color: '#000' }}>
              <div>{crmCase.full_name}</div>
              <div>{crmCase.email}</div>
              {crmCase.phone && <div>{crmCase.phone}</div>}
              <div>{crmCase.country || 'United Arab Emirates'}</div>
            </div>
          </div>

          <div style={{ marginBottom: 20, color: '#000', lineHeight: 1.5 }}>
            Dear {crmCase.full_name.split(' ')[0]},<br/><br/>
            Thank you for choosing DNex Consulting. We are pleased to submit the following proposal for professional services in connection with your business requirements. Our scope of services and associated professional fees are detailed below:
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 12, color: '#0A1628', fontWeight: 600 }}>Description of Services</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#0A1628', fontWeight: 600 }}>Qty</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12, color: '#0A1628', fontWeight: 600 }}>Unit Rate</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12, color: '#0A1628', fontWeight: 600 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 8px' }}>{it.description}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{it.qty}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>{currency} {it.rate.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>{currency} {it.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', fontSize: 13, marginBottom: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, marginBottom: 4 }}>
                <span style={{ color: '#475569' }}>Professional Fees:</span>
                <span style={{ width: 100 }}>{currency} {subtotal.toFixed(2)}</span>
            </div>
            {discountPct > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, marginBottom: 4 }}>
                    <span style={{ color: '#475569' }}>Discount ({discountPct}%):</span>
                    <span style={{ width: 100 }}>-{currency} {discountAmt.toFixed(2)}</span>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, marginBottom: 4 }}>
                <span style={{ color: '#475569' }}>VAT ({taxRate}%):</span>
                <span style={{ width: 100 }}>{currency} {tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, marginTop: 8, paddingTop: 8, borderTop: '2px solid #0A1628', fontWeight: 700, fontSize: 15, color: '#0A1628' }}>
                <span>Total Amount Due:</span>
                <span style={{ width: 100 }}>{currency} {total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ marginBottom: 30 }}>
            <div style={{ fontWeight: 700, color: '#0A1628', fontSize: 13, marginBottom: 8 }}>Terms and Conditions</div>
            <ol style={{ paddingLeft: 16, margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.6 }}>
                <li>This proposal is valid for the period mentioned above. DNex Consulting reserves the right to revise the fees if not accepted within this timeframe.</li>
                <li>Payment is due in full prior to the commencement of any services.</li>
                <li>Professional fees mentioned are exclusive of any government fees, external third-party charges, or out-of-pocket expenses unless explicitly stated otherwise.</li>
                <li>By signing this document, you acknowledge and accept our terms of engagement.</li>
            </ol>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
            <div style={{ width: '40%' }}>
                <div style={{ fontWeight: 700, color: '#0A1628', fontSize: 12, marginBottom: 30 }}>For and on behalf of DNex Consulting</div>
                <div style={{ borderTop: '1px solid #000', paddingTop: 8, fontSize: 11 }}>Authorized Signatory</div>
            </div>
            <div style={{ width: '40%' }}>
                <div style={{ fontWeight: 700, color: '#0A1628', fontSize: 12, marginBottom: 30 }}>Accepted By Client</div>
                <div style={{ borderTop: '1px solid #000', paddingTop: 8, fontSize: 11 }}>Authorized Signatory / Date</div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!effectivelyViewOnly && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
          <button className="crm-btn crm-btn--success" style={{ background: '#25d366' }} disabled={sendingWA || items.length === 0} onClick={sendViaWhatsApp}>
            {sendingWA || saving ? 'Processing...' : '💬 Send via WhatsApp'}
          </button>
          <button className="crm-btn crm-btn--primary" style={{ background: '#2563eb' }} disabled={sendingEmail || items.length === 0} onClick={sendViaEmail}>
            {sendingEmail || saving ? 'Processing...' : '📧 Send via Email (with PDF)'}
          </button>
        </div>
      )}

      {/* Client confirmed → move to payment */}
      {(quoteSaved || crmCase.status === 'Quotation Sent') && !historicalEditMode && (
        <div style={{ display: 'flex', gap: 10, padding: 14, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          <div style={{ flex: 1, fontSize: 13, color: '#065f46' }}>✅ Quotation sent! Has the client confirmed acceptance?</div>
          <button className="crm-btn crm-btn--success" onClick={clientConfirmed}>
            <CheckCircle size={14} /> Client Confirmed — Move to Payment
          </button>
        </div>
      )}

      {/* Quotation history timeline — always visible */}
      {prevQuotations.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 Quotation History ({prevQuotations.length})</div>
          <div style={{ position: 'relative', paddingLeft: 20 }}>
            <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: 'rgba(201,150,60,0.25)' }} />
            {prevQuotations.map((q, idx) => (
              <div key={q.id} style={{ position: 'relative', marginBottom: 14 }}>
                <div style={{ position: 'absolute', left: -17, top: 4, width: 10, height: 10, borderRadius: '50%', background: STATUS_C[q.status] ?? '#94a3b8', border: '2px solid #fff', boxShadow: '0 0 0 2px rgba(201,150,60,0.3)' }} />
                <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{q.quotation_number}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_C[q.status] ?? '#94a3b8', background: `${STATUS_C[q.status] ?? '#94a3b8'}18`, padding: '2px 8px', borderRadius: 20 }}>{q.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Total: <strong>{currency} {Number(q.total).toLocaleString()}</strong> · {q.service_name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(q.created_at).toLocaleString()} · Valid {q.validity_days}d · Tax {q.tax_rate}%{Number(q.discount) > 0 ? ` · Discount: ${currency} ${Number(q.discount).toFixed(2)}` : ''}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {q.status !== 'paid' && q.status !== 'rejected' && (
                        <>
                          <button onClick={async () => { await updateQuotationStatus(q.id, 'paid'); fetchQuotations(crmCase.id).then(setPrevQuotations); }} style={{ fontSize: 10, padding: '4px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: 4, cursor: 'pointer', border: 'none', fontWeight: 600 }}>Mark Paid</button>
                          {q.status !== 'accepted' && <button onClick={async () => { await updateQuotationStatus(q.id, 'accepted'); fetchQuotations(crmCase.id).then(setPrevQuotations); }} style={{ fontSize: 10, padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: 4, cursor: 'pointer', border: 'none', fontWeight: 600 }}>Accept</button>}
                          <button onClick={async () => { await updateQuotationStatus(q.id, 'rejected'); fetchQuotations(crmCase.id).then(setPrevQuotations); }} style={{ fontSize: 10, padding: '4px 8px', background: '#fee2e2', color: '#991b1b', borderRadius: 4, cursor: 'pointer', border: 'none', fontWeight: 600 }}>Reject</button>
                        </>
                      )}
                      <button 
                        onClick={() => {
                          const discountPctHist = Number(q.discount) > 0 ? (Number(q.discount) / (Number(q.subtotal))) * 100 : 0;
                          const b64 = generateQuotationPDFBase64({ 
                            crmCase, 
                            items: q.items || [{ description: q.service_name, qty: 1, rate: Number(q.total), amount: Number(q.total) }], 
                            subtotal: Number(q.subtotal), 
                            tax: Number(q.tax), 
                            taxRate: Number(q.tax_rate), 
                            discountAmt: Number(q.discount), 
                            discountPct: discountPctHist, 
                            total: Number(q.total), 
                            validity: q.validity_days, 
                            currency: crmCase.requirement_data?.quotation_currency || 'AED' 
                          });
                          const link = document.createElement('a');
                          link.href = `data:application/pdf;base64,${b64}`;
                          link.download = `Quotation_${q.quotation_number}.pdf`;
                          link.click();
                        }}
                        style={{ fontSize: 11, padding: '4px 10px', background: '#e2e8f0', color: '#475569', borderRadius: 4, cursor: 'pointer', border: 'none', fontWeight: 600 }}
                      >
                        📥 View PDF
                      </button>
                    </div>
                  </div>
                  {idx === 0 && <div style={{ fontSize: 10, color: GOLD, marginTop: 4, fontWeight: 600 }}>← Latest</div>}
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
export function PaymentStep({ crmCase, onRefresh, onBack, isViewOnly, effectiveStage, onReturnToCurrent }: Props) {
  const [amount, setAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [currency, setCurrency] = useState(crmCase.requirement_data?.currency || 'AED');
  const [desc, setDesc] = useState(crmCase.service_type || '');
  const [saving, setSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [showNotInterested, setShowNotInterested] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pays, setPays] = useState<CRMPayment[]>([]);
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);

  useEffect(() => {
    fetchQuotations(crmCase.id)
      .then(qs => {
        if (qs.length > 0) {
          setTotalAmount(Number(qs[0].total));
        }
      })
      .catch(console.error);
    fetchPayments(crmCase.id).then(setPays).catch(console.error);
  }, [crmCase.id, crmCase.updated_at]);

  const paidAmount = pays.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  useEffect(() => {
    if (remainingAmount > 0) {
      setAmount(remainingAmount.toString());
    } else {
      setAmount('');
    }
  }, [remainingAmount]);

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
      const payRecord = await createPayment(crmCase.id, parseFloat(amount), desc, currency);
      
      const qs = await fetchQuotations(crmCase.id);
      let attachments: any[] = [];
      let emailBody = `<p>Dear ${crmCase.full_name},</p><p>You can complete your payment of <b>${currency} ${amount}</b> for <b>${desc}</b> securely online.</p><p>Payment Link: <a href="${window.location.origin}/pay/${payRecord.id}?amount=${amount}&currency=${currency}&desc=${encodeURIComponent(desc)}&rzp=${payRecord.razorpay_id}">Pay Now</a></p>`;

      if (qs.length > 0) {
        const q = qs[0];
        
        const pdfBase64 = generateQuotationPDFBase64({
          crmCase,
          items: q.items as any,
          subtotal: Number(q.subtotal),
          tax: Number(q.tax),
          taxRate: q.tax_rate,
          discountAmt: Number(q.discount),
          discountPct: 0,
          total: Number(q.total),
          validity: q.validity_days,
          currency: currency
        });

        attachments = [{
          filename: `Quotation_${crmCase.case_id}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf'
        }];
        emailBody = `<p>Dear ${crmCase.full_name},</p><p>Please find attached your official quotation. You can complete your payment of <b>${currency} ${amount}</b> for <b>${desc}</b> securely online.</p><p>Payment Link: <a href="${window.location.origin}/pay/${payRecord.id}?amount=${amount}&currency=${currency}&desc=${encodeURIComponent(desc)}&rzp=${payRecord.razorpay_id}">Pay Now</a></p>`;
      }

      const emailRes = await sendCustomEmail({
        to: crmCase.email,
        subject: `Payment Link for ${desc} - DNex Consulting`,
        body: emailBody,
        attachments
      });

      if (!emailRes.success) {
        alert('Payment link created, but failed to send email: ' + emailRes.error);
      } else {
        alert('Payment link sent successfully!');
      }

      const updatedPays = await fetchPayments(crmCase.id);
      setPays(updatedPays);
      
      if (crmCase.status !== 'Payment Completed') {
        await updateCaseStatus(crmCase.id, 'Payment Pending');
      }
      setShowNewPaymentForm(false);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      alert('Error creating payment link: ' + (err.message || String(err)));
    } finally { setSaving(false); }
  };

  const markPaid = async () => {
    if (!amount) return;
    setMarkingPaid(true);
    try {
      const pendingPayment = pays.find(p => p.status === 'pending' && Math.abs(Number(p.amount) - parseFloat(amount)) < 1);
      
      if (pendingPayment) {
        await updatePaymentStatus(pendingPayment.id, 'paid');
      } else {
        const { error } = await supabase.from('crm_payments').insert({
          case_id: crmCase.id,
          amount: parseFloat(amount),
          currency,
          description: desc,
          status: 'paid',
          paid_at: new Date().toISOString()
        });
        if (error) throw error;
      }
      
      const updatedPays = await fetchPayments(crmCase.id);
      setPays(updatedPays);
      
      const newPaidSum = updatedPays.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
      if (newPaidSum >= totalAmount) {
        await updateCaseStatus(crmCase.id, 'Payment Completed');
      } else {
        await updateCaseStatus(crmCase.id, 'Payment Pending');
      }
      setShowNewPaymentForm(false);
      setAmount((Math.max(0, totalAmount - newPaidSum)).toString());
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Error marking as paid');
    } finally { setMarkingPaid(false); }
  };

  const currentView = effectiveStage || crmCase.status;
  
  const handleNewQuotation = async () => {
    setSaving(true);
    try {
      await updateCaseStatus(crmCase.id, 'Service Assigned');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  if (currentView === 'Quotation Sent') {
    const isAccepted = ['Payment Pending', 'Document Collection', 'Verification', 'Preview', 'Processing', 'Completed', 'Closed'].includes(crmCase.status);
    const isRejected = crmCase.status === 'Not Interested';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {onBack && (
          <button className="crm-btn crm-btn--ghost" style={{ alignSelf: 'flex-start' }} onClick={onBack}>
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <div style={{ color: GOLD, fontWeight: 700, fontSize: 15 }}>📋 Client Response to Quotation</div>
        
        {isAccepted ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 30, background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12 }}>
            <div style={{ fontSize: 24 }}>✅</div>
            <div style={{ fontSize: 14, color: '#065f46', fontWeight: 600 }}>Quotation Accepted</div>
            <div style={{ fontSize: 12, color: '#065f46', textAlign: 'center' }}>
              The client has successfully approved the quotation.
            </div>
            {isViewOnly && onReturnToCurrent && (
               <button className="crm-btn crm-btn--primary" onClick={() => onReturnToCurrent()} style={{ marginTop: 12 }}>
                 Return to Current Stage
               </button>
            )}
          </div>
        ) : isRejected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 30, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12 }}>
            <div style={{ fontSize: 24 }}>❌</div>
            <div style={{ fontSize: 14, color: '#991b1b', fontWeight: 600 }}>Quotation Rejected</div>
            <div style={{ fontSize: 12, color: '#991b1b', textAlign: 'center' }}>
              The client has rejected this quotation.
            </div>
            {!isViewOnly && (
              <button className="crm-btn crm-btn--primary" onClick={handleNewQuotation} style={{ marginTop: 12 }}>
                Re-issue New Quotation
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--crm-text)' }}>
              Please capture the client's response to the sent quotation before initiating the payment phase.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 30, background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--crm-border)', borderRadius: 12 }}>
              <div className="crm-spinner" style={{ width: 30, height: 30, borderColor: `${GOLD} transparent transparent transparent` }} />
              <div style={{ fontSize: 14, color: GOLD, fontWeight: 600 }}>Waiting for Client's Approval...</div>
              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                We've sent the quotation via email with Accept/Reject links.<br/>
                When the client clicks a link, this case will automatically update.
              </div>
              <button className="crm-btn crm-btn--secondary" onClick={onRefresh} style={{ marginTop: 12 }}>
                <RefreshCw size={14} /> Refresh Status
              </button>
            </div>
            {!isViewOnly && (
              <button className="crm-btn crm-btn--ghost" onClick={handleNewQuotation} style={{ alignSelf: 'flex-start' }}>
                <FileText size={14} /> Re-issue New Quotation
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf: 'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: GOLD, fontWeight: 700, fontSize: 15 }}><CreditCard size={18} style={{ display: 'inline', marginRight: 6 }} />Payment Processing</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Currency:</label>
          <select className="crm-select" style={{ width: 100, padding: '3px 6px', fontSize: 12 }} value={currency} onChange={e => setCurrency(e.target.value)} disabled={isViewOnly}>
            {currencies.map(c => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <div>
           <div style={{ fontSize: 12, color: '#64748b' }}>Total Quotation</div>
           <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{currency} {totalAmount.toFixed(2)}</div>
        </div>
        <div>
           <div style={{ fontSize: 12, color: '#64748b' }}>Paid Amount</div>
           <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{currency} {paidAmount.toFixed(2)}</div>
        </div>
        <div>
           <div style={{ fontSize: 12, color: '#64748b' }}>Remaining Balance</div>
           <div style={{ fontSize: 18, fontWeight: 700, color: remainingAmount > 0 ? '#f59e0b' : '#10b981' }}>{currency} {remainingAmount.toFixed(2)}</div>
        </div>
      </div>

      {pays.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Payment Links &amp; History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pays.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: p.status === 'paid' ? 'rgba(52,211,153,0.05)' : '#fff', border: `1px solid ${p.status === 'paid' ? 'rgba(52,211,153,0.2)' : '#e2e8f0'}`, borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{Number(p.amount).toFixed(2)} {p.currency}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{p.description || 'Payment'} • {new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, color: p.status === 'paid' ? '#10b981' : p.status === 'pending' ? '#f59e0b' : '#ef4444', background: p.status === 'paid' ? 'rgba(16,185,129,0.1)' : p.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    {p.status.toUpperCase()}
                  </span>
                  {!isViewOnly && p.status === 'pending' && (
                     <button className="crm-btn crm-btn--ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={async () => {
                       if (confirm(`Mark this ${p.amount} payment as paid?`)) {
                         setMarkingPaid(true);
                         try {
                           await updatePaymentStatus(p.id, 'paid');
                           const updatedPays = await fetchPayments(crmCase.id);
                           setPays(updatedPays);
                           const newPaidSum = updatedPays.filter(up => up.status === 'paid').reduce((sum, up) => sum + Number(up.amount), 0);
                           if (newPaidSum >= totalAmount) await updateCaseStatus(crmCase.id, 'Payment Completed');
                           setAmount((Math.max(0, totalAmount - newPaidSum)).toString());
                           onRefresh();
                         } finally { setMarkingPaid(false); }
                       }
                     }}>✓ Mark Paid</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {remainingAmount <= 0 ? (
        <div style={{ padding: 16, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, textAlign: 'center', color: '#065f46', fontWeight: 600 }}>
          🎉 All payments completed for this quotation.
        </div>
      ) : (
        <>
          {(!pays.some(p => p.status === 'pending') || showNewPaymentForm) ? (
            <div style={{ marginTop: 12, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>Create New / Part Payment</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Amount ({currency})</label>
                  <input className="crm-input" type="number" value={amount} placeholder="0.00" onChange={e => setAmount(e.target.value)} disabled={isViewOnly} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Description</label>
                  <input className="crm-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Part payment for..." disabled={isViewOnly} />
                </div>
              </div>
              <div style={{ padding: 10, background: 'rgba(201,150,60,0.08)', border: '1px solid rgba(201,150,60,0.2)', borderRadius: 8, fontSize: 12, color: '#64748b', marginTop: 12 }}>
                🔗 Payment link will be sent via <strong style={{ color: GOLD }}>Email &amp; WhatsApp</strong>. Once paid, status auto-updates.
              </div>
              {!isViewOnly && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="crm-btn crm-btn--primary" disabled={saving || !amount} onClick={sendLink}>
                    {saving ? 'Sending...' : 'Send Payment Link'} <Send size={14} />
                  </button>
                  <button className="crm-btn crm-btn--success" disabled={markingPaid || !amount} onClick={markPaid}>
                    {markingPaid ? '...' : '✓ Mark as Paid (Manual)'}
                  </button>
                  {pays.length > 0 && (
                    <button className="crm-btn crm-btn--ghost" onClick={() => setShowNewPaymentForm(false)}>Cancel</button>
                  )}
                </div>
              )}
            </div>
          ) : (
            !isViewOnly && remainingAmount > 0 && (
               <button className="crm-btn crm-btn--ghost" style={{ alignSelf: 'flex-start', color: '#0ea5e9' }} onClick={() => setShowNewPaymentForm(true)}>
                 + Create Additional Payment Link
               </button>
            )
          )}
        </>
      )}

      {/* Always allow proceeding to next stage if this is the active stage */}
      {!isViewOnly && effectiveStage === 'Payment Pending' && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="crm-btn crm-btn--primary" onClick={async () => {
            if (remainingAmount > 0) {
              if (!confirm('Payments are still pending. Are you sure you want to proceed without full payment?')) return;
            }
            await updateCaseStatus(crmCase.id, 'Payment Completed');
            onRefresh();
          }}>Proceed to Next Stage ➔</button>
        </div>
      )}
    </div>
  );
}

// ── Step: Preview ──────────────────────────────────────────────────────────────
export function PreviewStep({ crmCase, onRefresh, onBack, isViewOnly, onReturnToCurrent }: Props) {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<CRMDocument[]>([]);
  const [quots, setQuots] = useState<CRMQuotation[]>([]);
  const [pays, setPays] = useState<CRMPayment[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      setFetching(true);
      try {
        const [d, q, p] = await Promise.all([
          fetchDocuments(crmCase.id),
          fetchQuotations(crmCase.id),
          fetchPayments(crmCase.id)
        ]);
        setDocs(d);
        setQuots(q);
        setPays(p);
      } catch(e) { console.error(e); }
      finally { setFetching(false); }
    }
    load();
  }, [crmCase.id]);

  const proceedToProcessing = async () => {
    setLoading(true);
    try {
      await updateCaseStatus(crmCase.id, 'Processing');
      onRefresh();
      if (onReturnToCurrent) onReturnToCurrent();
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const latestQuot = quots[0];
  const totalQuot = latestQuot ? latestQuot.total : 0;
  const postPaymentStatuses = ['Payment Completed', 'Document Collection', 'Verification', 'Preview', 'Processing', 'Completed', 'Closed'];
  const isPaidState = postPaymentStatuses.includes(crmCase.status);
  
  const actualPayments = pays.filter(p => p.status === 'paid');
  const manualPaid = actualPayments.length === 0 && isPaidState;
  
  const totalPaid = manualPaid ? totalQuot : actualPayments.reduce((sum, p) => sum + p.amount, 0);
  const paymentsCount = manualPaid ? 1 : actualPayments.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf: 'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <div style={{ color: GOLD, fontWeight: 700, fontSize: 15 }}>🔎 Final Preview &amp; Verification</div>
      <div style={{ padding: 12, background: 'rgba(255,237,213,0.1)', border: '1px solid rgba(253,186,116,0.3)', borderRadius: 10, fontSize: 13, color: '#c2410c' }}>
        Please review all the information gathered so far. If everything looks correct, you can proceed to the final processing stage.
      </div>
      
      {fetching ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>Loading case history...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
           {/* Lead Info */}
           <div style={{ background: 'rgba(0,0,0,0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--crm-border)' }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>👤 Lead Details</div>
              <div style={{ fontSize: 13, color: 'var(--crm-text)' }}>
                <strong>Name:</strong> {crmCase.full_name} <br/>
                <strong>Email:</strong> {crmCase.email} <br/>
                <strong>Phone:</strong> {crmCase.phone} <br/>
                <strong>Source:</strong> {crmCase.source || 'Website'}
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
             {/* Client Requirements */}
             <div style={{ background: 'rgba(0,0,0,0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--crm-border)' }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>📋 Requirements &amp; Assignment</div>
                <div style={{ fontSize: 13, color: 'var(--crm-text)' }}>
                  <strong>Budget:</strong> {crmCase.requirement_data?.budget || 'N/A'} {crmCase.requirement_data?.currency || ''}<br/>
                  <strong>Service Title:</strong> {crmCase.requirement_data?.service_title || 'N/A'} <br/>
                  <strong>Nationality:</strong> {crmCase.requirement_data?.nationality || 'N/A'} <br/>
                  <strong>Assigned Service:</strong> <span style={{ color: GOLD }}>{crmCase.service_type || 'None'}</span>
                </div>
             </div>

             {/* Financials */}
             <div style={{ background: 'rgba(0,0,0,0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--crm-border)' }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>💰 Financial Overview</div>
                <div style={{ fontSize: 13, color: 'var(--crm-text)' }}>
                  <strong>Quotations Generated:</strong> {quots.length} <br/>
                  <strong>Latest Quote Value:</strong> {totalQuot.toLocaleString()} {crmCase.requirement_data?.currency || ''} <br/>
                  <strong>Payments Received:</strong> {paymentsCount} {manualPaid ? '(Manual)' : ''}<br/>
                  <strong>Amount Paid:</strong> <span style={{ color: '#10b981', fontWeight: 600 }}>{totalPaid.toLocaleString()} {crmCase.requirement_data?.currency || ''}</span>
                </div>
             </div>
           </div>

           {/* Documents */}
           <div style={{ background: 'rgba(0,0,0,0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--crm-border)' }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>📄 Collected Documents ({docs.filter(d => d.status === 'approved').length} Approved)</div>
              {docs.length === 0 ? (
                <div style={{ fontSize: 12, color: '#64748b' }}>No documents uploaded.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {docs.map(d => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--crm-text)' }}>
                      {d.status === 'approved' ? <CheckCircle size={12} color="#10b981" /> : d.status === 'rejected' ? <XCircle size={12} color="#ef4444" /> : <div style={{width:12,height:12,borderRadius:'50%',background:'#f59e0b'}} />}
                      {d.name} {d.version > 1 && <span style={{ color: '#94a3b8' }}>v{d.version}</span>}
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      )}

      {!isViewOnly && (
        <div style={{ marginTop: 16 }}>
          <button className="crm-btn crm-btn--primary" onClick={proceedToProcessing} disabled={loading || fetching}>
            {loading ? 'Moving to Processing...' : 'Approve & Proceed to Processing ➔'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Step: Processing ─────────────────────────────────────────────────────────
export function ProcessingStep({ crmCase, onRefresh, onBack, isViewOnly, onReturnToCurrent, isCompletedStage }: Props & { isCompletedStage?: boolean }) {
  const [procNotes, setProcNotes] = useState(crmCase.processing_notes || '');
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);

  // Attachment state
  const [attachments, setAttachments]   = useState<AttachmentFile[]>([]);
  const [isDragOver, setIsDragOver]     = useState(false);
  const [attachError, setAttachError]   = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setAttachError('');
    Array.from(files).forEach(file => {
      if (file.size > MAX_ATTACH_MB * 1024 * 1024) {
        setAttachError(`"${file.name}" exceeds ${MAX_ATTACH_MB} MB and was skipped.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAttachments(prev => [
          ...prev,
          { filename: file.name, content: base64, contentType: file.type || 'application/octet-stream', encoding: 'base64', sizeKb: Math.round(file.size / 1024) },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (idx: number) =>
    setAttachments(prev => prev.filter((_, i) => i !== idx));

  // Email form state
  const [emailSubject, setEmailSubject] = useState(
    isCompletedStage 
      ? `Congratulations! Your Case is Completed - ${crmCase.case_id}`
      : `Update regarding your application - ${crmCase.case_id}`
  );
  const [emailBody, setEmailBody] = useState(
    isCompletedStage
      ? `Dear ${crmCase.full_name},\n\nCongratulations! We are thrilled to inform you that your process for ${crmCase.service_type || 'business setup'} is now fully completed.\n\nPlease find your final documents attached to this email. We are officially closing your case on our end.\n\nThank you for choosing DNex Consulting. We wish you immense success in your business endeavors!\n\nBest regards,\nDNex Consulting Team`
      : `Dear ${crmCase.full_name},\n\nWe are pleased to inform you that your case (${crmCase.case_id}) for ${crmCase.service_type || 'business setup'} is currently in processing. We are making great progress and will share further milestones soon.\n\nBest regards,\nDNex Consulting Team`
  );
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // WhatsApp state
  const [waText, setWaText] = useState(
    isCompletedStage
      ? `Congratulations ${crmCase.full_name}! 🎉 Your ${crmCase.service_type || 'business setup'} process is fully completed. Your final documents have been issued. We are now closing your case. Thank you for choosing DNex Consulting!`
      : `Hello ${crmCase.full_name}, we have an update regarding your ${crmCase.service_type || 'business setup'} application with DNex Consulting. We have processed the files and submitted them to the department.`
  );
  const [waTemplates, setWaTemplates] = useState<any[]>([]);
  const [showWaTemplates, setShowWaTemplates] = useState(false);

  useEffect(() => {
    supabase.from('system_templates').select('*').eq('type', 'whatsapp')
      .then(({ data }) => setWaTemplates(data || []));
  }, []);

  const applyWaTemplate = (t: any) => {
    let finalBody = t.body || '';
    const vars: Record<string, string> = {
      'client_name': crmCase.full_name || '',
      'full_name': crmCase.full_name || '',
      'case_id': crmCase.case_id || '',
      'email': crmCase.email || '',
      'phone': crmCase.phone || '',
    };
    for (const [key, val] of Object.entries(vars)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      finalBody = finalBody.replace(regex, val);
    }
    setWaText(finalBody);
    setShowWaTemplates(false);
  };

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
      await updateCaseStatus(crmCase.id, isCompletedStage ? 'Closed' : 'Completed');
      onRefresh();
    } finally { setClosing(false); }
  };
  
  const [uploadingFinalDoc, setUploadingFinalDoc] = useState(false);
  const finalDocInputRef = useRef<HTMLInputElement>(null);
  const handleFinalDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFinalDoc(true);
    try {
      const { uploadDocument } = await import('../services/documentService');
      await uploadDocument(crmCase.case_id, file, 'Final Generated Document', 'Admin', crmCase.assigned_to || undefined);
      alert('Final document uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload final document');
    } finally {
      setUploadingFinalDoc(false);
      if (finalDocInputRef.current) finalDocInputRef.current.value = '';
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailStatus('idle');
    try {
      const res = await sendCustomEmail({
        to: crmCase.email,
        subject: emailSubject,
        body: emailBody.replace(/\n/g, '<br/>'),
        attachments: attachments.map(a => ({ filename: a.filename, content: a.content, encoding: a.encoding, contentType: a.contentType })),
      });
      if (res.success) {
        setEmailStatus('success');
        setEmailBody('');
        setAttachments([]);   // clear attachments after send
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {onBack && (
        <button className="crm-btn crm-btn--ghost" style={{ alignSelf: 'flex-start' }} onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <div style={{ color: isCompletedStage ? '#10b981' : GOLD, fontWeight: 700, fontSize: 15 }}>
        {isCompletedStage ? '🎉 Completed & Final Handover' : '⚙️ Processing & Operations'}
      </div>
      <div style={{ padding: 12, background: isCompletedStage ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.08)', border: isCompletedStage ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(99,102,241,0.2)', borderRadius: 10, fontSize: 13, color: isCompletedStage ? '#059669' : '#4f46e5' }}>
        {isCompletedStage 
          ? 'Service is complete! Send final handover documents to the client, upload the generated license/document, and close the case.'
          : 'Use verified documents to process the requested service. Update notes regularly — client receives periodic notifications.'}
      </div>

      {!isViewOnly && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid var(--crm-border)', paddingTop: 16 }}>
          {/* Email Client form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--crm-border)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: GOLD }}>📧 Send Email Update</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>Subject</label>
              <input className="crm-input" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>HTML/Text Content</label>
              <textarea className="crm-textarea" rows={4} value={emailBody} onChange={e => setEmailBody(e.target.value)} />
            </div>
            <button className="crm-btn crm-btn--primary" onClick={handleSendEmail} disabled={sendingEmail || !emailBody}>
              {sendingEmail ? 'Sending Email...' : '✉ Send Email'}
            </button>
            {emailStatus === 'success' && <div style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>✓ Email sent successfully via server!</div>}
            {emailStatus === 'error' && <div style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>✗ Failed to send email. Check backend.</div>}
          </div>

          {/* WhatsApp Client form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--crm-border)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#25d366' }}>💬 Send WhatsApp Update</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 11, color: '#94a3b8' }}>WhatsApp Message</label>
                <button
                  onClick={() => setShowWaTemplates(v => !v)}
                  style={{
                    background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.4)',
                    borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#25d366',
                    fontWeight: 700, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  ⚡ Select Template <ChevronDown size={12} />
                </button>
              </div>
              
              {showWaTemplates && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 50,
                  background: '#1e2d45', border: '1px solid rgba(37,211,102,0.4)',
                  borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  minWidth: 260, maxHeight: 260, overflowY: 'auto', marginTop: 4,
                }}>
                  {waTemplates.map(t => (
                    <div
                      key={t.id}
                      onClick={() => applyWaTemplate(t)}
                      style={{
                        padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#e2e8f0',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#25d366' }}>{t.name}</div>
                    </div>
                  ))}
                  {waTemplates.length === 0 && <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13 }}>No templates found</div>}
                </div>
              )}
              
              <textarea className="crm-textarea" rows={6} value={waText} onChange={e => setWaText(e.target.value)} />
            </div>
            <button className="crm-btn crm-btn--success" onClick={handleSendWhatsApp} disabled={!waText}>
              📲 Open WhatsApp Chat
            </button>
          </div>
        </div>
      )}

      {/* Attachment upload — before Processing Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--crm-border)', paddingTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <Paperclip size={12} style={{ marginRight: 5 }} />
            {isCompletedStage ? 'UPLOAD FINAL DOCUMENTS' : 'ATTACH DOCUMENTS TO EMAIL'}
            <span style={{ fontWeight: 400, color: '#475569', marginLeft: 6 }}>(optional · max {MAX_ATTACH_MB} MB each)</span>
          </label>
          {attachments.length > 0 && (
            <span style={{ fontSize: 11, color: '#64748b' }}>{attachments.length} file{attachments.length > 1 ? 's' : ''} attached</span>
          )}
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
          style={{
            border: `2px dashed ${isDragOver ? GOLD : 'rgba(201,150,60,0.25)'}`,
            borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
            background: isDragOver ? 'rgba(201,150,60,0.08)' : 'rgba(255,255,255,0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <Paperclip size={14} color={isDragOver ? GOLD : '#475569'} />
          <span style={{ fontSize: 12, color: isDragOver ? GOLD : '#475569' }}>
            Drag & drop files here, or{' '}
            <span style={{ color: GOLD, fontWeight: 600 }}>click to browse</span>
          </span>
        </div>
        <input
          ref={fileInputRef}
          type='file'
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />

        {/* Size error */}
        {attachError && <div style={{ fontSize: 11, color: '#f87171' }}>⚠ {attachError}</div>}

        {/* Hint when files present */}
        {attachments.length > 0 && (
          <div style={{ fontSize: 11, color: '#64748b' }}>
            📎 These files will be attached to the next email you send.
          </div>
        )}

        {/* File list */}
        {attachments.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 8,
            background: 'rgba(201,150,60,0.07)', border: '1px solid rgba(201,150,60,0.2)',
          }}>
            {getAttachIcon(f.contentType)}
            <span style={{ flex: 1, fontSize: 12, color: 'var(--crm-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.filename}</span>
            <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{f.sizeKb} KB</span>
            <button
              onClick={() => removeAttachment(i)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2, display: 'flex', alignItems: 'center' }}
              title='Remove'
            >
              <XCircle size={13} />
            </button>
          </div>
        ))}
      </div>

      {!isCompletedStage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--crm-border)', paddingTop: 16 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Processing Notes (internal)</label>
          <textarea className="crm-textarea" rows={5} value={procNotes}
            onChange={e => setProcNotes(e.target.value)}
            disabled={isViewOnly}
            placeholder="Log processing progress, steps completed, issues encountered..." />
        </div>
      )}


      {!isViewOnly && (
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          {!isCompletedStage && (
            <button className="crm-btn crm-btn--ghost" disabled={saving} onClick={saveNotes}>
              {saving ? 'Saving...' : '💾 Save Notes'}
            </button>
          )}
          <button className="crm-btn crm-btn--success" disabled={closing} onClick={closeCase}>
            {closing ? '...' : (isCompletedStage ? '🔒 Close Case' : '✅ Mark Service Complete')}
          </button>
        </div>
      )}
    </div>
  );
}

