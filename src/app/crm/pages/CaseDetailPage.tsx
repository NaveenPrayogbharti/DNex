import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CRMNavbar } from '../components/CRMNavbar';
import {
  fetchCaseById, updateCaseStatus, updateCase, CASE_STATUSES, STATUS_COLORS,
} from '../services/caseService';
import type { CRMCase, CaseStatus } from '../services/caseService';
import { fetchActivities, ACTIVITY_ICONS, ACTIVITY_COLORS } from '../services/activityService';
import type { CRMActivity } from '../services/activityService';
import { fetchCalls, OUTCOME_LABELS } from '../services/callService';
import type { CRMCall } from '../services/callService';
import { fetchDocuments, updateDocumentStatus, addDocumentRecord } from '../services/documentService';
import type { CRMDocument } from '../services/documentService';
import { fetchPayments, updatePaymentStatus } from '../services/paymentService';
import type { CRMPayment } from '../services/paymentService';
import { fetchQuotations } from '../services/quotationService';
import type { CRMQuotation } from '../services/quotationService';
import {
  ContactedStep, RequirementStep, ServiceStep, QuotationStep, PaymentStep, ProcessingStep,
} from '../components/WorkflowSteps';
import { ArrowLeft, Edit2, Save, X, Plus, Check, XCircle } from 'lucide-react';

const GOLD = '#C9963C';

// Which statuses show the workflow action panel
const WORKFLOW_STAGES: Record<CaseStatus, boolean> = {
  'New Lead': true,
  'Contacted': true,
  'Requirement Gathering': true,
  'Interested': true,
  'Not Interested': false,
  'Service Assigned': true,
  'Quotation Sent': true,
  'Payment Pending': true,
  'Payment Completed': true,
  'Document Collection': true,
  'Verification': true,
  'Processing': true,
  'Completed': false,
  'Closed': false,
};

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [crmCase, setCrmCase] = useState<CRMCase | null>(null);
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [calls, setCalls] = useState<CRMCall[]>([]);
  const [documents, setDocuments] = useState<CRMDocument[]>([]);
  const [payments, setPayments] = useState<CRMPayment[]>([]);
  const [quotations, setQuotations] = useState<CRMQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline'|'calls'|'documents'|'payments'|'quotations'>('timeline');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [docName, setDocName] = useState('');

  const loadAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [c, a, cl, d, p, q] = await Promise.all([
        fetchCaseById(id),
        fetchActivities(id),
        fetchCalls(id),
        fetchDocuments(id),
        fetchPayments(id),
        fetchQuotations(id),
      ]);
      setCrmCase(c); setNotes(c.notes ?? '');
      setActivities(a); setCalls(cl); setDocuments(d); setPayments(p); setQuotations(q);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSaveNotes = async () => {
    if (!crmCase) return;
    setSavingNotes(true);
    try { await updateCase(crmCase.id, { notes }); setEditingNotes(false); }
    catch (e) { console.error(e); }
    finally { setSavingNotes(false); }
  };

  const handleDocStatus = async (docId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDocumentStatus(docId, status);
      if (status === 'approved' && crmCase) {
        const allDocs = documents.map(d => d.id === docId ? { ...d, status } : d);
        const allApproved = allDocs.every(d => d.status === 'approved');
        if (allApproved) await updateCaseStatus(crmCase.id, 'Processing');
      }
      await loadAll();
    } catch (e) { console.error(e); }
  };

  const handleAddDoc = async () => {
    if (!crmCase || !docName) return;
    try { await addDocumentRecord(crmCase.id, docName, 'Agent'); setShowDocForm(false); setDocName(''); await loadAll(); }
    catch (e) { console.error(e); }
  };

  const handlePaymentMark = async (pid: string, status: 'paid' | 'failed') => {
    try {
      await updatePaymentStatus(pid, status);
      if (status === 'paid' && crmCase) await updateCaseStatus(crmCase.id, 'Payment Completed');
      await loadAll();
    } catch (e) { console.error(e); }
  };

  // Open case from New Lead
  const handleOpenCase = async () => {
    if (!crmCase) return;
    await updateCaseStatus(crmCase.id, 'Contacted');
    await loadAll();
  };

  if (loading) return <div className="crm-page"><CRMNavbar title="Loading..." /><div className="crm-spinner" /></div>;
  if (!crmCase) return <div className="crm-page"><CRMNavbar title="Not found" /><div className="crm-empty"><div className="crm-empty__title">Case not found</div></div></div>;

  const sc = STATUS_COLORS[crmCase.status] ?? STATUS_COLORS['New Lead'];
  const currentIdx = CASE_STATUSES.indexOf(crmCase.status);

  // What workflow panel to show
  const renderWorkflowPanel = () => {
    if (!WORKFLOW_STAGES[crmCase.status]) return null;

    // Back handlers — revert to previous logical status
    const goBack = async (prevStatus: CaseStatus) => {
      await updateCaseStatus(crmCase.id, prevStatus);
      await loadAll();
    };

    switch (crmCase.status) {
      case 'New Lead':
        return (
          <div style={{ padding:24, background:'rgba(201,150,60,0.06)', border:'1px solid rgba(201,150,60,0.2)', borderRadius:12 }}>
            <div style={{ fontSize:16, fontWeight:700, color:GOLD, marginBottom:12 }}>📂 New Inquiry Received</div>
            <div style={{ fontSize:14, color:'var(--crm-text)', marginBottom:16 }}>
              A new inquiry has been logged for <strong>{crmCase.full_name}</strong>. Open the case to begin the contact process.
            </div>
            <button className="crm-btn crm-btn--primary" onClick={handleOpenCase}>
              📞 Open Case &amp; Start Contact
            </button>
          </div>
        );
      case 'Contacted':
        return <ContactedStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('New Lead')} />;
      case 'Requirement Gathering':
        return <RequirementStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Contacted')} />;
      case 'Interested':
        return <ServiceStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Requirement Gathering')} />;
      case 'Not Interested':
        return (
          <div style={{ padding:20, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12 }}>
            <div style={{ fontWeight:700, color:'#f87171', marginBottom:8 }}>❌ Client Not Interested</div>
            <div style={{ fontSize:13, color:'var(--crm-text)' }}>
              <strong>Reason: </strong>{crmCase.not_interested_reason || 'No reason provided.'}
            </div>
          </div>
        );
      case 'Service Assigned':
        return <QuotationStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Interested')} />;
      case 'Quotation Sent':
        return <PaymentStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Service Assigned')} />;
      case 'Payment Pending':
        return <PaymentStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Quotation Sent')} />;
      case 'Payment Completed':
        return (
          <div style={{ padding:20, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)', borderRadius:12 }}>
            <div style={{ fontWeight:700, color:'#34d399', marginBottom:8 }}>✅ Payment Received</div>
            <div style={{ fontSize:13, color:'var(--crm-text)', marginBottom:16 }}>
              Payment has been confirmed. Proceed to collect all required documents from the client.
            </div>
            <button className="crm-btn crm-btn--primary" onClick={() => { updateCaseStatus(crmCase.id, 'Document Collection').then(loadAll); }}>
              📁 Start Document Collection
            </button>
          </div>
        );
      case 'Document Collection':
      case 'Verification':
        return (
          <div style={{ padding:20, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12 }}>
            <div style={{ fontWeight:700, color:'#a5b4fc', marginBottom:8 }}>
              {crmCase.status === 'Verification' ? '🔍 Verify Documents' : '📁 Document Collection'}
            </div>
            <div style={{ fontSize:13, color:'var(--crm-text)', marginBottom:12 }}>
              Request and collect all required documents. Once all are approved, case moves to Processing automatically.
            </div>
            <button className="crm-btn crm-btn--ghost" onClick={() => setActiveTab('documents')}>
              📄 Go to Documents Tab
            </button>
          </div>
        );
      case 'Processing':
        return <ProcessingStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Document Collection')} />;
      default:
        return null;
    }
  };

  const tabs = ['timeline','calls','documents','payments','quotations'] as const;
  const tabIcons: Record<string, string> = { timeline:'🕐', calls:'📞', documents:'📄', payments:'💰', quotations:'📋' };

  return (
    <div className="crm-page">
      <CRMNavbar title={`Case: ${crmCase.case_id}`} subtitle={crmCase.full_name} />
      <div className="crm-page__content">

        {/* Back + badges */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="crm-btn crm-btn--ghost" onClick={() => navigate('/crm/cases')}>
            <ArrowLeft size={16} /> Back
          </button>
          <span className="crm-badge" style={{ background:sc.bg, color:sc.text, borderColor:sc.border, fontSize:13, padding:'4px 12px' }}>
            {crmCase.status}
          </span>
          <span className={`crm-priority crm-priority--${crmCase.priority}`}>{crmCase.priority}</span>
        </div>

        {/* Pipeline stepper */}
        <div className="crm-pipeline">
          {CASE_STATUSES.filter(s => s !== 'Not Interested').map((s, i) => {
            const scc = STATUS_COLORS[s];
            const adjustedIdx = (CASE_STATUSES.filter(x => x !== 'Not Interested') as CaseStatus[]).indexOf(crmCase.status);
            const isActive = i === adjustedIdx;
            const isDone = i < adjustedIdx;
            return (
              <div key={s} className={`crm-pipeline__step ${isActive?'crm-pipeline__step--active':''} ${isDone?'crm-pipeline__step--done':''}`}
                style={{ background: isActive?scc.bg:isDone?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.02)',
                  color: isActive?scc.text:isDone?'#64748b':'#475569', borderColor: isActive?scc.border:'transparent' }}
                title={s}>
                {isDone && '✓ '}{s}
              </div>
            );
          })}
        </div>

        {/* Workflow Action Panel */}
        {renderWorkflowPanel() && (
          <div style={{ background:'var(--crm-panel)', border:'1px solid var(--crm-border)', borderRadius:12, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'1px', color:'var(--crm-muted)', marginBottom:16, textTransform:'uppercase' }}>
              Current Stage Action Required
            </div>
            {renderWorkflowPanel()}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16 }}>
          {/* Left: Tabs */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', gap:4, background:'rgba(0,0,0,0.04)', padding:4, borderRadius:10, flexWrap:'wrap' }}>
              {tabs.map(tab => (
                <button key={tab} className="crm-btn" onClick={() => setActiveTab(tab)}
                  style={{ padding:'7px 14px', fontSize:12, background: activeTab===tab?GOLD:'transparent', color: activeTab===tab?'#0A1628':'#94a3b8' }}>
                  {tabIcons[tab]} {tab.charAt(0).toUpperCase()+tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Timeline */}
            {activeTab === 'timeline' && (
              <div className="crm-table-wrap" style={{ padding:20 }}>
                {activities.length === 0
                  ? <div className="crm-empty"><div className="crm-empty__icon">📋</div><div className="crm-empty__sub">No activity yet</div></div>
                  : <div className="crm-timeline">
                      {activities.map(a => (
                        <div key={a.id} className="crm-timeline__item">
                          <div className="crm-timeline__icon" style={{ borderColor: ACTIVITY_COLORS[a.type] }}>{ACTIVITY_ICONS[a.type]}</div>
                          <div className="crm-timeline__content">
                            <div className="crm-timeline__meta"><strong style={{ color:'var(--crm-text)' }}>{a.performed_by_name ?? 'System'}</strong> · {new Date(a.created_at).toLocaleString()}</div>
                            <div className="crm-timeline__desc">{a.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </div>
            )}

            {/* Calls */}
            {activeTab === 'calls' && (
              <div className="crm-table-wrap" style={{ padding:20 }}>
                <h3 style={{ color:'var(--crm-text)', margin:'0 0 16px' }}>📞 Call Log</h3>
                {calls.length === 0
                  ? <div className="crm-empty"><div className="crm-empty__icon">📞</div><div className="crm-empty__sub">No calls logged yet</div></div>
                  : calls.map(c => (
                      <div key={c.id} className="crm-payment-item">
                        <div>
                          <div style={{ fontWeight:600, color:'var(--crm-text)' }}>{OUTCOME_LABELS[c.outcome]}</div>
                          <div className="crm-payment-item__meta">{c.called_at ? new Date(c.called_at).toLocaleString() : ''} · {c.duration_minutes}min</div>
                          {c.notes && <div style={{ fontSize:13, color:'#94a3b8', marginTop:4 }}>{c.notes}</div>}
                        </div>
                        <div style={{ color:'#94a3b8', fontSize:13 }}>{c.called_by_name ?? 'Agent'}</div>
                      </div>
                    ))
                }
              </div>
            )}

            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="crm-table-wrap" style={{ padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                  <h3 style={{ color:'var(--crm-text)', margin:0 }}>📄 Documents</h3>
                  <button className="crm-btn crm-btn--primary" onClick={() => setShowDocForm(v => !v)}><Plus size={14}/> Add</button>
                </div>
                {showDocForm && (
                  <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                    <input className="crm-input" placeholder="Document name..." value={docName} onChange={e => setDocName(e.target.value)} />
                    <button className="crm-btn crm-btn--primary" onClick={handleAddDoc}>Add</button>
                    <button className="crm-btn crm-btn--ghost" onClick={() => setShowDocForm(false)}>Cancel</button>
                  </div>
                )}
                {documents.map(d => {
                  const c = d.status==='approved'?'#34d399':d.status==='rejected'?'#f87171':'#fbbf24';
                  return (
                    <div key={d.id} className="crm-doc-item">
                      <div className="crm-doc-item__icon">📄</div>
                      <div className="crm-doc-item__info">
                        <div className="crm-doc-item__name">{d.name} <span style={{ fontSize:11, color:'#94a3b8' }}>v{d.version}</span></div>
                        <div className="crm-doc-item__meta">{d.uploaded_by_name ?? 'Agent'} · {new Date(d.created_at).toLocaleDateString()}</div>
                      </div>
                      <span className="crm-badge" style={{ background:`${c}20`, color:c, borderColor:`${c}40` }}>{d.status}</span>
                      {d.status === 'pending' && (
                        <div className="crm-doc-item__actions">
                          <button className="crm-btn crm-btn--success" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => handleDocStatus(d.id,'approved')}><Check size={12}/></button>
                          <button className="crm-btn crm-btn--danger" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => handleDocStatus(d.id,'rejected')}><XCircle size={12}/></button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {documents.length === 0 && !showDocForm && <div className="crm-empty"><div className="crm-empty__icon">📄</div><div className="crm-empty__sub">No documents yet</div></div>}
              </div>
            )}

            {/* Payments */}
            {activeTab === 'payments' && (
              <div className="crm-table-wrap" style={{ padding:20 }}>
                <h3 style={{ color:'var(--crm-text)', margin:'0 0 16px' }}>💰 Payments</h3>
                {payments.map(p => {
                  const c = p.status==='paid'?'#34d399':p.status==='failed'?'#f87171':'#fbbf24';
                  return (
                    <div key={p.id} className="crm-payment-item">
                      <div>
                        <div className="crm-payment-item__amount">AED {Number(p.amount).toLocaleString()}</div>
                        <div className="crm-payment-item__meta">{p.description ?? '—'} · {new Date(p.created_at).toLocaleDateString()}</div>
                        {p.payment_link && <a href={p.payment_link} target="_blank" rel="noreferrer" style={{ fontSize:12, color:GOLD }}>🔗 Payment Link</a>}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                        <span className="crm-badge" style={{ background:`${c}20`, color:c, borderColor:`${c}40` }}>{p.status}</span>
                        {p.status === 'pending' && (
                          <div style={{ display:'flex', gap:4 }}>
                            <button className="crm-btn crm-btn--success" style={{ padding:'4px 8px', fontSize:11 }} onClick={() => handlePaymentMark(p.id,'paid')}>✓ Mark Paid</button>
                            <button className="crm-btn crm-btn--danger" style={{ padding:'4px 8px', fontSize:11 }} onClick={() => handlePaymentMark(p.id,'failed')}>Failed</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {payments.length === 0 && <div className="crm-empty"><div className="crm-empty__icon">💳</div><div className="crm-empty__sub">No payments yet</div></div>}
              </div>
            )}

            {/* Quotations */}
            {activeTab === 'quotations' && (
              <div className="crm-table-wrap" style={{ padding:20 }}>
                <h3 style={{ color:'var(--crm-text)', margin:'0 0 16px' }}>📋 Quotations</h3>
                {quotations.map(q => {
                  const c = q.status==='accepted'?'#34d399':q.status==='rejected'?'#f87171':q.status==='sent'?GOLD:'#94a3b8';
                  return (
                    <div key={q.id} className="crm-payment-item">
                      <div>
                        <div style={{ fontWeight:700, color:'var(--crm-text)', fontSize:14 }}>{q.quotation_number}</div>
                        <div className="crm-payment-item__amount">AED {Number(q.total).toLocaleString()}</div>
                        <div className="crm-payment-item__meta">{q.service_name} · {new Date(q.created_at).toLocaleDateString()}</div>
                        <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>Valid {q.validity_days} days · Tax {q.tax_rate}%</div>
                      </div>
                      <span className="crm-badge" style={{ background:`${c}20`, color:c, borderColor:`${c}40` }}>{q.status}</span>
                    </div>
                  );
                })}
                {quotations.length === 0 && <div className="crm-empty"><div className="crm-empty__icon">📋</div><div className="crm-empty__sub">No quotations yet</div></div>}
              </div>
            )}
          </div>

          {/* Right: Info panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="crm-table-wrap" style={{ padding:20 }}>
              <h3 style={{ color:GOLD, fontSize:14, fontWeight:700, margin:'0 0 16px' }}>Client Info</h3>
              {[
                ['Name', crmCase.full_name], ['Email', crmCase.email], ['Phone', crmCase.phone],
                ['Country', crmCase.country], ['Service', crmCase.service_type], ['Source', crmCase.source],
                ['Created', new Date(crmCase.created_at).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--crm-border)' }}>
                  <span style={{ fontSize:12, color:'var(--crm-muted)', fontWeight:600 }}>{k}</span>
                  <span style={{ fontSize:13, color:'var(--crm-text)', textAlign:'right', maxWidth:180, wordBreak:'break-all' }}>{v || '—'}</span>
                </div>
              ))}
            </div>

            {/* Requirement data if gathered */}
            {crmCase.requirement_data && Object.keys(crmCase.requirement_data).length > 0 && (
              <div className="crm-table-wrap" style={{ padding:20 }}>
                <h3 style={{ color:GOLD, fontSize:14, fontWeight:700, margin:'0 0 12px' }}>📋 Requirements</h3>
                {Object.entries(crmCase.requirement_data).map(([k, v]) => v ? (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize:12, color:'#94a3b8', fontWeight:600, textTransform:'capitalize' }}>{k.replace(/_/g,' ')}</span>
                    <span style={{ fontSize:13, color:'var(--crm-text)', textAlign:'right', maxWidth:160 }}>{v}</span>
                  </div>
                ) : null)}
              </div>
            )}

            {/* Notes */}
            <div className="crm-table-wrap" style={{ padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <h3 style={{ color:GOLD, fontSize:14, fontWeight:700, margin:0 }}>Notes</h3>
                {!editingNotes
                  ? <button className="crm-btn crm-btn--ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => setEditingNotes(true)}><Edit2 size={12}/> Edit</button>
                  : <div style={{ display:'flex', gap:4 }}>
                      <button className="crm-btn crm-btn--primary" style={{ padding:'4px 10px', fontSize:12 }} onClick={handleSaveNotes} disabled={savingNotes}><Save size={12}/> {savingNotes?'...':'Save'}</button>
                      <button className="crm-btn crm-btn--ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => { setEditingNotes(false); setNotes(crmCase.notes??''); }}><X size={12}/></button>
                    </div>
                }
              </div>
              {editingNotes
                ? <textarea className="crm-textarea" rows={5} value={notes} onChange={e => setNotes(e.target.value)} />
                : <p style={{ fontSize:13, color: notes?'#e2e8f0':'#94a3b8', lineHeight:1.6, margin:0 }}>{notes || 'No notes yet.'}</p>
              }
            </div>

            {/* SLA */}
            {crmCase.sla_deadline && (
              <div className="crm-table-wrap" style={{ padding:16 }}>
                <h3 style={{ color:GOLD, fontSize:14, fontWeight:700, margin:'0 0 10px' }}>SLA Deadline</h3>
                <div style={{ fontSize:14, color:'var(--crm-text)' }}>{new Date(crmCase.sla_deadline).toLocaleDateString()}</div>
                {(() => {
                  const diff = new Date(crmCase.sla_deadline).getTime() - Date.now();
                  const hours = diff / 3600000;
                  if (hours < 0) return <div className="crm-sla crm-sla--breach" style={{ marginTop:6 }}>⚠ SLA BREACHED</div>;
                  if (hours < 24) return <div className="crm-sla crm-sla--warning" style={{ marginTop:6 }}>⏰ {Math.round(hours)}h remaining</div>;
                  return <div className="crm-sla crm-sla--ok" style={{ marginTop:6 }}>✓ {Math.floor(hours/24)}d remaining</div>;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
