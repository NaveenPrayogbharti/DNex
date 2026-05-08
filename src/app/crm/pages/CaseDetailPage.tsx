import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CRMNavbar } from '../components/CRMNavbar';
import { fetchCaseById, updateCaseStatus, updateCase, CASE_STATUSES, STATUS_COLORS } from '../services/caseService';
import type { CRMCase, CaseStatus } from '../services/caseService';
import { fetchActivities, ACTIVITY_ICONS, ACTIVITY_COLORS } from '../services/activityService';
import type { CRMActivity } from '../services/activityService';
import { fetchCalls, logCall, OUTCOME_LABELS } from '../services/callService';
import type { CRMCall } from '../services/callService';
import { fetchDocuments, updateDocumentStatus, addDocumentRecord } from '../services/documentService';
import type { CRMDocument } from '../services/documentService';
import { fetchPayments, createPayment, updatePaymentStatus } from '../services/paymentService';
import type { CRMPayment } from '../services/paymentService';
import { processAutomations } from '../services/automationService';
import { ArrowLeft, Phone, FileText, CreditCard, Edit2, Save, X, Plus, Check, XCircle } from 'lucide-react';

const GOLD = '#C9963C';

type TabType = 'timeline' | 'calls' | 'documents' | 'payments';

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [crmCase, setCrmCase] = useState<CRMCase | null>(null);
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [calls, setCalls] = useState<CRMCall[]>([]);
  const [documents, setDocuments] = useState<CRMDocument[]>([]);
  const [payments, setPayments] = useState<CRMPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  // Edit mode
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Call log form
  const [showCallForm, setShowCallForm] = useState(false);
  const [callForm, setCallForm] = useState({ duration_minutes: 5, outcome: 'answered' as CRMCall['outcome'], notes: '' });

  // Payment form
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', description: '' });

  // Doc form
  const [showDocForm, setShowDocForm] = useState(false);
  const [docName, setDocName] = useState('');

  const loadAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [c, a, cl, d, p] = await Promise.all([
        fetchCaseById(id),
        fetchActivities(id),
        fetchCalls(id),
        fetchDocuments(id),
        fetchPayments(id),
      ]);
      setCrmCase(c);
      setNotes(c.notes ?? '');
      setActivities(a);
      setCalls(cl);
      setDocuments(d);
      setPayments(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleStatusChange = async (status: CaseStatus) => {
    if (!crmCase) return;
    setUpdatingStatus(true);
    try {
      await updateCaseStatus(crmCase.id, status);
      setCrmCase(c => c ? { ...c, status } : c);
      await loadAll();
    } catch (e) { console.error(e); }
    finally { setUpdatingStatus(false); }
  };

  const handleSaveNotes = async () => {
    if (!crmCase) return;
    setSavingNotes(true);
    try {
      await updateCase(crmCase.id, { notes });
      setEditingNotes(false);
    } catch (e) { console.error(e); }
    finally { setSavingNotes(false); }
  };

  const handleLogCall = async () => {
    if (!crmCase) return;
    try {
      await logCall(crmCase.id, callForm);
      setShowCallForm(false);
      setCallForm({ duration_minutes: 5, outcome: 'answered', notes: '' });
      await loadAll();
    } catch (e) { console.error(e); }
  };

  const handleAddPayment = async () => {
    if (!crmCase || !paymentForm.amount) return;
    try {
      await createPayment(crmCase.id, parseFloat(paymentForm.amount), paymentForm.description);
      setShowPaymentForm(false);
      setPaymentForm({ amount: '', description: '' });
      await loadAll();
    } catch (e) { console.error(e); }
  };

  const handlePaymentStatusChange = async (paymentId: string, status: 'paid' | 'failed') => {
    if (!crmCase) return;
    try {
      await updatePaymentStatus(paymentId, status);
      if (status === 'paid') {
        await processAutomations('payment_success', { caseId: crmCase.id });
      }
      await loadAll();
    } catch (e) { console.error(e); }
  };

  const handleAddDoc = async () => {
    if (!crmCase || !docName) return;
    try {
      await addDocumentRecord(crmCase.id, docName, 'Agent');
      await processAutomations('document_upload', { caseId: crmCase.id });
      setShowDocForm(false);
      setDocName('');
      await loadAll();
    } catch (e) { console.error(e); }
  };

  const handleDocStatus = async (docId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDocumentStatus(docId, status);
      await loadAll();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="crm-page"><CRMNavbar title="Loading..." /><div className="crm-spinner" /></div>;
  if (!crmCase) return <div className="crm-page"><CRMNavbar title="Not found" /><div className="crm-empty"><div className="crm-empty__title">Case not found</div></div></div>;

  const sc = STATUS_COLORS[crmCase.status] ?? STATUS_COLORS['New Lead'];
  const currentIdx = CASE_STATUSES.indexOf(crmCase.status);

  return (
    <div className="crm-page">
      <CRMNavbar title={`Case: ${crmCase.case_id}`} subtitle={crmCase.full_name} />
      <div className="crm-page__content">

        {/* Back + header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="crm-btn crm-btn--ghost" onClick={() => navigate('/crm/cases')}>
            <ArrowLeft size={16} /> Back
          </button>
          <span className="crm-badge" style={{ background: sc.bg, color: sc.text, borderColor: sc.border, fontSize: '13px', padding: '4px 12px' }}>
            {crmCase.status}
          </span>
          <span className={`crm-priority crm-priority--${crmCase.priority}`}>{crmCase.priority}</span>
        </div>

        {/* Stage pipeline */}
        <div className="crm-pipeline">
          {CASE_STATUSES.map((s, i) => {
            const scc = STATUS_COLORS[s];
            const isActive = i === currentIdx;
            const isDone = i < currentIdx;
            return (
              <div
                key={s}
                className={`crm-pipeline__step ${isActive ? 'crm-pipeline__step--active' : ''} ${isDone ? 'crm-pipeline__step--done' : ''}`}
                style={{
                  background: isActive ? scc.bg : isDone ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
                  color: isActive ? scc.text : isDone ? '#64748b' : '#475569',
                  borderColor: isActive ? scc.border : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => handleStatusChange(s)}
                title={`Move to: ${s}`}
              >
                {isDone && '✓ '}{s}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
          {/* Left: Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tab nav */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
              {(['timeline', 'calls', 'documents', 'payments'] as TabType[]).map(tab => (
                <button
                  key={tab}
                  className="crm-btn"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '7px 16px', fontSize: '13px',
                    background: activeTab === tab ? GOLD : 'transparent',
                    color: activeTab === tab ? '#0A1628' : '#94a3b8',
                  }}
                >
                  {tab === 'timeline' && '🕐'} {tab === 'calls' && '📞'} {tab === 'documents' && '📄'} {tab === 'payments' && '💰'}
                  {' '}{tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Timeline */}
            {activeTab === 'timeline' && (
              <div className="crm-table-wrap" style={{ padding: '20px' }}>
                {activities.length === 0 ? (
                  <div className="crm-empty"><div className="crm-empty__icon">📋</div><div className="crm-empty__sub">No activity yet</div></div>
                ) : (
                  <div className="crm-timeline">
                    {activities.map(a => (
                      <div key={a.id} className="crm-timeline__item">
                        <div className="crm-timeline__icon" style={{ borderColor: ACTIVITY_COLORS[a.type] }}>
                          {ACTIVITY_ICONS[a.type]}
                        </div>
                        <div className="crm-timeline__content">
                          <div className="crm-timeline__meta">
                            <strong style={{ color: '#fff' }}>{a.performed_by_name ?? 'System'}</strong>
                            {' · '}{new Date(a.created_at).toLocaleString()}
                          </div>
                          <div className="crm-timeline__desc">{a.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Calls */}
            {activeTab === 'calls' && (
              <div className="crm-table-wrap" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ color: '#fff', margin: 0 }}>Call Log</h3>
                  <button className="crm-btn crm-btn--primary" onClick={() => setShowCallForm(v => !v)}>
                    <Phone size={14} /> Log Call
                  </button>
                </div>
                {showCallForm && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="crm-form-row">
                      <div className="crm-form-group">
                        <label>Duration (mins)</label>
                        <input className="crm-input" type="number" value={callForm.duration_minutes}
                          onChange={e => setCallForm(f => ({ ...f, duration_minutes: +e.target.value }))} />
                      </div>
                      <div className="crm-form-group">
                        <label>Outcome</label>
                        <select className="crm-select" value={callForm.outcome}
                          onChange={e => setCallForm(f => ({ ...f, outcome: e.target.value as any }))}>
                          <option value="answered">Answered</option>
                          <option value="voicemail">Voicemail</option>
                          <option value="no_answer">No Answer</option>
                          <option value="busy">Busy</option>
                        </select>
                      </div>
                    </div>
                    <div className="crm-form-group">
                      <label>Notes</label>
                      <textarea className="crm-textarea" rows={2} value={callForm.notes}
                        onChange={e => setCallForm(f => ({ ...f, notes: e.target.value }))} placeholder="Call notes..." />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="crm-btn crm-btn--primary" onClick={handleLogCall}>Save Call</button>
                      <button className="crm-btn crm-btn--ghost" onClick={() => setShowCallForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
                {calls.map(c => (
                  <div key={c.id} className="crm-payment-item">
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{OUTCOME_LABELS[c.outcome]}</div>
                      <div className="crm-payment-item__meta">{c.called_at ? new Date(c.called_at).toLocaleString() : ''} · {c.duration_minutes}min</div>
                      {c.notes && <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{c.notes}</div>}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>{c.called_by_name ?? 'Agent'}</div>
                  </div>
                ))}
                {calls.length === 0 && !showCallForm && <div className="crm-empty"><div className="crm-empty__icon">📞</div><div className="crm-empty__sub">No calls logged yet</div></div>}
              </div>
            )}

            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="crm-table-wrap" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ color: '#fff', margin: 0 }}>Documents</h3>
                  <button className="crm-btn crm-btn--primary" onClick={() => setShowDocForm(v => !v)}>
                    <Plus size={14} /> Add Document
                  </button>
                </div>
                {showDocForm && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input className="crm-input" placeholder="Document name..." value={docName}
                      onChange={e => setDocName(e.target.value)} />
                    <button className="crm-btn crm-btn--primary" onClick={handleAddDoc}>Add</button>
                    <button className="crm-btn crm-btn--ghost" onClick={() => setShowDocForm(false)}>Cancel</button>
                  </div>
                )}
                {documents.map(d => {
                  const statusColor = d.status === 'approved' ? '#34d399' : d.status === 'rejected' ? '#f87171' : '#fbbf24';
                  return (
                    <div key={d.id} className="crm-doc-item">
                      <div className="crm-doc-item__icon">📄</div>
                      <div className="crm-doc-item__info">
                        <div className="crm-doc-item__name">{d.name} <span style={{ fontSize: '11px', color: '#94a3b8' }}>v{d.version}</span></div>
                        <div className="crm-doc-item__meta">{d.uploaded_by_name ?? 'Agent'} · {new Date(d.created_at).toLocaleDateString()}</div>
                      </div>
                      <span className="crm-badge" style={{ background: `${statusColor}20`, color: statusColor, borderColor: `${statusColor}40` }}>
                        {d.status}
                      </span>
                      {d.status === 'pending' && (
                        <div className="crm-doc-item__actions">
                          <button className="crm-btn crm-btn--success" style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => handleDocStatus(d.id, 'approved')}><Check size={12} /></button>
                          <button className="crm-btn crm-btn--danger" style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => handleDocStatus(d.id, 'rejected')}><XCircle size={12} /></button>
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
              <div className="crm-table-wrap" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ color: '#fff', margin: 0 }}>Payments</h3>
                  <button className="crm-btn crm-btn--primary" onClick={() => setShowPaymentForm(v => !v)}>
                    <CreditCard size={14} /> New Payment
                  </button>
                </div>
                {showPaymentForm && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="crm-form-row">
                      <div className="crm-form-group">
                        <label>Amount (₹)</label>
                        <input className="crm-input" type="number" value={paymentForm.amount}
                          onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                      </div>
                      <div className="crm-form-group">
                        <label>Description</label>
                        <input className="crm-input" value={paymentForm.description}
                          onChange={e => setPaymentForm(f => ({ ...f, description: e.target.value }))} placeholder="Service fee..." />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="crm-btn crm-btn--primary" onClick={handleAddPayment}>Create Payment Link</button>
                      <button className="crm-btn crm-btn--ghost" onClick={() => setShowPaymentForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
                {payments.map(p => {
                  const statusColor = p.status === 'paid' ? '#34d399' : p.status === 'failed' ? '#f87171' : '#fbbf24';
                  return (
                    <div key={p.id} className="crm-payment-item">
                      <div>
                        <div className="crm-payment-item__amount">₹{Number(p.amount).toLocaleString()}</div>
                        <div className="crm-payment-item__meta">{p.description ?? '—'} · {new Date(p.created_at).toLocaleDateString()}</div>
                        {p.payment_link && (
                          <a href={p.payment_link} target="_blank" rel="noreferrer"
                            style={{ fontSize: '12px', color: GOLD }}>🔗 Payment Link</a>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                        <span className="crm-badge" style={{ background: `${statusColor}20`, color: statusColor, borderColor: `${statusColor}40` }}>
                          {p.status}
                        </span>
                        {p.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="crm-btn crm-btn--success" style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handlePaymentStatusChange(p.id, 'paid')}>Mark Paid</button>
                            <button className="crm-btn crm-btn--danger" style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handlePaymentStatusChange(p.id, 'failed')}>Failed</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {payments.length === 0 && !showPaymentForm && <div className="crm-empty"><div className="crm-empty__icon">💳</div><div className="crm-empty__sub">No payments yet</div></div>}
              </div>
            )}
          </div>

          {/* Right: Case info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="crm-table-wrap" style={{ padding: '20px' }}>
              <h3 style={{ color: GOLD, fontSize: '14px', fontWeight: 700, marginBottom: '16px', margin: '0 0 16px' }}>Client Info</h3>
              {[
                ['Name',    crmCase.full_name],
                ['Email',   crmCase.email],
                ['Phone',   crmCase.phone],
                ['Country', crmCase.country],
                ['Service', crmCase.service_type],
                ['Source',  crmCase.source],
                ['Created', new Date(crmCase.created_at).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: '13px', color: '#e2e8f0', textAlign: 'right', maxWidth: '180px', wordBreak: 'break-all' }}>{v || '—'}</span>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="crm-table-wrap" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ color: GOLD, fontSize: '14px', fontWeight: 700, margin: 0 }}>Notes</h3>
                {!editingNotes
                  ? <button className="crm-btn crm-btn--ghost" style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => setEditingNotes(true)}><Edit2 size={12} /> Edit</button>
                  : <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="crm-btn crm-btn--primary" style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={handleSaveNotes} disabled={savingNotes}><Save size={12} /> {savingNotes ? '...' : 'Save'}</button>
                      <button className="crm-btn crm-btn--ghost" style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => { setEditingNotes(false); setNotes(crmCase.notes ?? ''); }}><X size={12} /></button>
                    </div>
                }
              </div>
              {editingNotes
                ? <textarea className="crm-textarea" rows={5} value={notes} onChange={e => setNotes(e.target.value)} />
                : <p style={{ fontSize: '13px', color: notes ? '#e2e8f0' : '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                    {notes || 'No notes yet. Click Edit to add.'}
                  </p>
              }
            </div>

            {/* SLA */}
            {crmCase.sla_deadline && (
              <div className="crm-table-wrap" style={{ padding: '16px' }}>
                <h3 style={{ color: GOLD, fontSize: '14px', fontWeight: 700, margin: '0 0 10px' }}>SLA Deadline</h3>
                <div style={{ fontSize: '14px', color: '#fff' }}>{new Date(crmCase.sla_deadline).toLocaleDateString()}</div>
                {(() => {
                  const diff = new Date(crmCase.sla_deadline).getTime() - Date.now();
                  const hours = diff / 3600000;
                  if (hours < 0)  return <div className="crm-sla crm-sla--breach" style={{ marginTop: '6px' }}>⚠ SLA BREACHED</div>;
                  if (hours < 24) return <div className="crm-sla crm-sla--warning" style={{ marginTop: '6px' }}>⏰ {Math.round(hours)}h remaining</div>;
                  return <div className="crm-sla crm-sla--ok" style={{ marginTop: '6px' }}>✓ {Math.floor(hours / 24)}d remaining</div>;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
