import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CRMNavbar } from '../components/CRMNavbar';
import {
  fetchCaseById, updateCaseStatus, updateCase, CASE_STATUSES, STATUS_COLORS,
} from '../services/caseService';
import type { CRMCase, CaseStatus } from '../services/caseService';
import { fetchActivities, ACTIVITY_ICONS, ACTIVITY_COLORS } from '../services/activityService';
import type { CRMActivity } from '../services/activityService';
import { fetchCalls } from '../services/callService';
import type { CRMCall } from '../services/callService';
import { fetchDocuments, updateDocumentStatus, addDocumentRecord, uploadDocument } from '../services/documentService';
import type { CRMDocument } from '../services/documentService';
import { fetchPayments, updatePaymentStatus } from '../services/paymentService';
import type { CRMPayment } from '../services/paymentService';
import { fetchQuotations } from '../services/quotationService';
import type { CRMQuotation } from '../services/quotationService';
import {
  ContactedStep, RequirementStep, QuotationStep, PaymentStep, ProcessingStep, PreviewStep
} from '../components/WorkflowSteps';
import { EmailComposeModal } from '../components/EmailComposeModal';
import { sendCustomEmail } from '../services/emailNotificationService';
import { ArrowLeft, Edit2, Save, X, Plus, Check, XCircle, Mail, UploadCloud, Eye, Download, Bell, CreditCard, FileText } from 'lucide-react';
import { LOGO_BASE64 } from '../utils/logoBase64';
import { getStoredServices } from '../../../lib/servicesStore';

const GOLD = '#C9963C';

// Which statuses show the workflow action panel
const WORKFLOW_STAGES: Record<CaseStatus, boolean> = {
  'New Lead': true,
  'Contacted': true,
  'Requirement Gathering': true,
  'Not Interested': false,
  'Service Assigned': true,
  'Quotation Sent': true,
  'Payment Pending': true,
  'Payment Completed': false,
  'Document Collection': true,
  'Verification': true,
  'Preview': true,
  'Processing': true,
  'Completed': true,
  'Closed': true,
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
  const [activeTab, setActiveTab] = useState<'timeline'|'documents'|'payments'|'quotations'>('timeline');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingStage, setViewingStage] = useState<CaseStatus | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null); // payment id being reminded
  const [sendingDocRequest, setSendingDocRequest] = useState(false);

  const loadAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      let c = await fetchCaseById(id);
      
      // Auto-upgrade any cases stuck in 'Payment Completed' directly to 'Document Collection'
      if (c.status === ('Payment Completed' as any)) {
        await updateCaseStatus(c.id, 'Document Collection');
        c.status = 'Document Collection';
      }

      setCrmCase(c); setNotes(c.notes ?? '');
      const [a, cl, d, p, q] = await Promise.all([
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

  const visibleTabs = useMemo((): ('timeline' | 'documents' | 'payments' | 'quotations')[] => {
    const list: ('timeline' | 'documents' | 'payments' | 'quotations')[] = ['timeline'];
    if (!crmCase) return list;

    const status = crmCase.status;
    const idx = CASE_STATUSES.indexOf(status);

    // Quotations tab visible from Quotation Sent onwards
    if (idx >= CASE_STATUSES.indexOf('Quotation Sent') && status !== 'Not Interested') {
      list.push('quotations');
    }

    // Payments tab visible from Payment Pending onwards
    if (idx >= CASE_STATUSES.indexOf('Payment Pending') && status !== 'Not Interested') {
      list.push('payments');
    }

    // Documents tab visible from Document Collection onwards
    if (idx >= CASE_STATUSES.indexOf('Document Collection') && status !== 'Not Interested') {
      list.push('documents');
    }

    return list;
  }, [crmCase]);

  // Reset activeTab if it is not in visibleTabs
  useEffect(() => {
    if (crmCase && !visibleTabs.includes(activeTab)) {
      setActiveTab('timeline');
    }
  }, [crmCase, visibleTabs, activeTab]);

  const handleSaveNotes = async () => {
    if (!crmCase) return;
    setSavingNotes(true);
    try { await updateCase(crmCase.id, { notes }); setEditingNotes(false); }
    catch (e) { console.error(e); }
    finally { setSavingNotes(false); }
  };

  const handleDocStatus = async (docId: string, status: 'approved' | 'rejected') => {
    try {
      let reason: string | null = null;
      if (status === 'rejected') {
        reason = window.prompt("Enter reason for rejection (this will be emailed to the client):");
        if (reason === null) return; // User cancelled
      }

      await updateDocumentStatus(docId, status, reason || undefined);
      
      if (status === 'approved' && crmCase) {
        // Check if all pending docs are now approved
        const otherDocs = documents.filter(d => d.id !== docId);
        const allApproved = otherDocs.every(d => d.status === 'approved' || d.status === 'rejected');
        if (allApproved) await updateCaseStatus(crmCase.id, 'Preview');
      }

      if (status === 'rejected' && crmCase) {
        const doc = documents.find(d => d.id === docId);
        const portalUrl = `${window.location.origin}/client/upload/${crmCase.id}`;
        
        await sendCustomEmail({
          to: crmCase.email,
          subject: `Action Required: Document Rejected - DNex Consulting`,
          body: `
            <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
              <p>Dear ${crmCase.full_name},</p>
              <p>We are reviewing your application documents and unfortunately, the <strong>${doc?.name}</strong> you provided has been rejected.</p>
              <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;margin:20px 0;">
                <p style="margin:0;color:#991b1b;font-weight:600;">Reason for Rejection:</p>
                <p style="margin:8px 0 0;color:#7f1d1d;">${reason || 'Not specified'}</p>
              </div>
              <p>Please use our secure Client Upload Portal to submit a new copy of this document.</p>
              <a href="${portalUrl}" style="background:#C9963C;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:20px 0;font-weight:bold;">Re-Upload Document</a>
              <p>If you have any questions, please reply to this email.</p>
              <p>Best regards,<br><strong>DNex Consulting Team</strong></p>
            </div>
          `
        });
      }

      await loadAll();
    } catch (e) { console.error(e); }
  };

  const handleViewDocument = (url: string) => {
    if (url.startsWith('data:')) {
      try {
        const parts = url.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        // Note: URL.revokeObjectURL(blobUrl) should ideally be called later, but it's fine for short-lived sessions
        return;
      } catch (e) {
        console.error('Failed to parse data URL', e);
      }
    }
    // Fallback for normal URLs or if parsing fails
    window.open(url, '_blank');
  };

  const handleAddDoc = async () => {
    if (!crmCase || !docName) return;
    setIsUploading(true);
    try { 
      if (docFile) {
        await uploadDocument(crmCase.id, docFile, docName, 'Agent');
      } else {
        await addDocumentRecord(crmCase.id, docName, 'Agent');
      }
      setShowDocForm(false); 
      setDocName(''); 
      setDocFile(null);
      await loadAll(); 
    }
    catch (e) { console.error(e); }
    finally { setIsUploading(false); }
  };

  const handlePaymentMark = async (pid: string, status: 'paid' | 'failed') => {
    try {
      await updatePaymentStatus(pid, status);
      if (status === 'paid' && crmCase) await updateCaseStatus(crmCase.id, 'Document Collection');
      await loadAll();
    } catch (e) { console.error(e); }
  };

  const handleRazorpayPayment = async (p: CRMPayment) => {
    if (!crmCase) return;
    
    if (!p.razorpay_id) {
        alert("No Razorpay order ID found for this payment.");
        return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TKMzRZ167Z70fw',
      amount: p.amount * 100,
      currency: p.currency,
      description: p.description || 'Service Payment',
      order_id: p.razorpay_id, 
      handler: async function (response: any) {
        try {
          const verifyData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            payment_record_id: p.id,
            case_id: crmCase.id,
            amount: p.amount,
            currency: p.currency
          };
          
          const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3006';
          const verifyRes = await fetch(`${API_URL}/api/payments/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verifyData)
          });
          
          if (verifyRes.ok) {
            alert('Payment Successful!');
            await loadAll();
          } else {
            alert('Payment verification failed.');
          }
        } catch (error) {
          console.error(error);
          alert('Error verifying payment.');
        }
      },
      prefill: {
        name: crmCase.full_name,
        email: crmCase.email,
        contact: crmCase.phone
      }
    };
    const rzp1 = new (window as any).Razorpay(options);
    rzp1.on('payment.failed', function (response: any){
      alert(response.error.description);
    });
    rzp1.open();
  };

  // ── Document Collection Request Email ─────────────────────────────────────
  const handleSendDocumentRequest = async () => {
    if (!crmCase) return;
    setSendingDocRequest(true);
    try {
      const services = getStoredServices();
      const assignedService = services.find(s => s.title === crmCase.service_type);
      let requiredDocsHtml = '<ul><li>Passport Copy</li><li>Visa Copy</li></ul>'; // Fallback
      if (assignedService && assignedService.required_docs) {
        requiredDocsHtml = '<ul>' + assignedService.required_docs.map(doc => `<li>${doc}</li>`).join('') + '</ul>';
      }

      const uploadLink = `${window.location.origin}/client/upload/${crmCase.id}`;

      const emailBody = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
          <h2 style="color: #0A1628;">Document Request for ${crmCase.service_type || 'your service'}</h2>
          <p>Dear ${crmCase.full_name},</p>
          <p>We are ready to proceed with your application. To move forward, we require the following documents from you:</p>
          ${requiredDocsHtml}
          <p>Please use our secure Client Upload Portal to submit these documents. You can upload PDFs or image files directly.</p>
          <div style="margin: 30px 0;">
            <a href="${uploadLink}" style="background-color: #C9963C; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Access Secure Upload Portal
            </a>
          </div>
          <p>If you have any questions or face any issues uploading, please reply to this email.</p>
          <p>Best regards,<br/><strong>DNex Consulting Team</strong></p>
        </div>
      `;

      await sendCustomEmail({
        to: crmCase.email,
        subject: 'Required Documents for Your Application - DNex Consulting',
        body: emailBody,
        replyTo: 'consultant@dnex.ae'
      });

      alert('Document request email sent successfully to the client!');
    } catch (error) {
      console.error(error);
      alert('Failed to send document request email.');
    } finally {
      setSendingDocRequest(false);
    }
  };

  // ── Download Invoice (from Backend) ─────────────────────────────────────────
  const downloadPaymentInvoice = async (p: CRMPayment) => {
    try {
      const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3006';
      const res = await fetch(`${API_URL}/api/payments/${p.id}/invoice`);
      if (!res.ok) throw new Error('Failed to download invoice');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${p.id.split('-')[0].toUpperCase()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Error downloading invoice');
    }
  };

  // ── Generate and download a payment receipt as HTML ───────────────────────
  const downloadPaymentReceipt = (p: CRMPayment) => {
    if (!crmCase) return;
    const paidDate = p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date(p.created_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'long', year: 'numeric' });
    const receiptNumber = `RCP-${new Date(p.created_at).getFullYear()}-${p.id.slice(0, 6).toUpperCase()}`;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payment Receipt — ${receiptNumber}</title>
<style>body{font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:0}
.wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0}
.hdr{background:linear-gradient(135deg,#0A1628,#1a2a48);padding:28px 32px;text-align:center}
.hdr h1{color:#C9963C;margin:0 0 4px;font-size:22px}.hdr p{color:rgba(255,255,255,.5);font-size:12px;margin:0}
.body{padding:28px 32px}.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e2e8f0}
.label{color:#94a3b8;font-size:13px}.value{color:#1e293b;font-size:13px;font-weight:600}
.total{background:#f0fdf4;border-radius:8px;padding:14px 20px;display:flex;justify-content:space-between;margin-top:16px}
.total .label{color:#166534;font-size:15px;font-weight:700}.total .value{color:#15803d;font-size:18px;font-weight:800}
.stamp{text-align:center;margin:20px 0;color:#15803d;font-size:14px;font-weight:700;letter-spacing:1px;border:2px solid #15803d;border-radius:8px;padding:8px 0}
.footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;font-size:11px;color:#94a3b8}
</style></head><body><div class="wrap">
<div class="hdr"><img src="${LOGO_BASE64}" alt="DNex Logo" style="height: 48px; object-fit: contain; margin-bottom: 8px;" /><p>Official Payment Receipt</p></div>
<div class="body">
<div class="stamp">✓ PAYMENT CONFIRMED</div>
<div class="row"><span class="label">Receipt No.</span><span class="value">${receiptNumber}</span></div>
<div class="row"><span class="label">Client Name</span><span class="value">${crmCase.full_name}</span></div>
<div class="row"><span class="label">Email</span><span class="value">${crmCase.email}</span></div>
<div class="row"><span class="label">Case ID</span><span class="value">${crmCase.case_id}</span></div>
<div class="row"><span class="label">Description</span><span class="value">${p.description ?? 'Business Setup Service'}</span></div>
<div class="row"><span class="label">Payment Date</span><span class="value">${paidDate}</span></div>
<div class="total"><span class="label">Amount Paid</span><span class="value">AED ${Number(p.amount).toLocaleString()}</span></div>
</div>
<div class="footer">DNex Business Setup Consulting · Dubai, UAE<br/>📞 +971 551251185 · consultant@dnex.ae · www.dnex.ae</div>
</div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${receiptNumber}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Send a pending payment reminder email ─────────────────────────────────
  const handleSendPaymentReminder = async (p: CRMPayment) => {
    if (!crmCase) return;
    setSendingReminder(p.id);
    try {
      await sendCustomEmail({
        to: crmCase.email,
        subject: `Payment Reminder — Your Case ${crmCase.case_id} · DNex Consulting`,
        body: `<p>Dear <strong>${crmCase.full_name}</strong>,</p><p>This is a friendly reminder that a payment of <strong>AED ${Number(p.amount).toLocaleString()}</strong> is currently pending for your case <strong>${crmCase.case_id}</strong>${p.description ? ` (${p.description})` : ''}.</p><p>Please complete the payment at the earliest to avoid any delays in processing your application.${p.payment_link ? `</p><p>👉 <a href="${p.payment_link}">Click here to make payment</a>` : ''}</p><p>If you have already made the payment, please disregard this message or contact us to confirm.</p><p>Best regards,<br/><strong>DNex Consulting Team</strong><br/>+971 551251185</p>`,
        replyTo: 'consultant@dnex.ae',
      });
      alert('✅ Payment reminder sent to ' + crmCase.email);
    } catch (e) {
      console.error(e);
      alert('❌ Failed to send reminder. Please try again.');
    } finally {
      setSendingReminder(null);
    }
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
  const isCaseLocked = crmCase.status === 'Completed' || crmCase.status === 'Closed';

  // What workflow panel to show
  const renderWorkflowPanel = () => {
    const effectiveStage = viewingStage || crmCase.status;
    const isViewOnly = effectiveStage !== crmCase.status;

    if (!WORKFLOW_STAGES[effectiveStage]) return null;

    // View previous stage without modifying DB
    const goBack = (prevStatus: CaseStatus) => {
      setViewingStage(prevStatus);
    };

    switch (effectiveStage) {
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
          onBack={() => goBack('New Lead')} isViewOnly={isViewOnly} isCaseLocked={isCaseLocked} />;
      case 'Requirement Gathering':
        return <RequirementStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Contacted')} isViewOnly={isViewOnly} isCaseLocked={isCaseLocked} onReturnToCurrent={() => setViewingStage(null)} />;
      case 'Service Assigned':
        return <QuotationStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Requirement Gathering')} isViewOnly={isViewOnly} isCaseLocked={isCaseLocked} onReturnToCurrent={() => setViewingStage(null)} />;
      case 'Quotation Sent':
        return <PaymentStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Service Assigned')} isViewOnly={isViewOnly} isCaseLocked={isCaseLocked} effectiveStage={effectiveStage} />;
      case 'Payment Pending':
        return <PaymentStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Quotation Sent')} isViewOnly={isViewOnly} isCaseLocked={isCaseLocked} effectiveStage={effectiveStage} />;
      case 'Document Collection':
      case 'Verification':
        return (
          <div style={{ padding:20, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12 }}>
            <div style={{ fontWeight:700, color:'#a5b4fc', marginBottom:8 }}>
              {crmCase.status === 'Verification' ? '🔍 Verify Documents' : '📁 Document Collection'}
            </div>
            <div style={{ fontSize:13, color:'var(--crm-text)', marginBottom:12 }}>
              Request and collect all required documents. Once all are approved, case moves to Preview automatically.
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="crm-btn crm-btn--ghost" onClick={() => setActiveTab('documents')}>
                📄 Go to Documents Tab
              </button>
              {!isViewOnly && (
                <>
                  <button 
                    className="crm-btn crm-btn--ghost" 
                    style={{ borderColor: '#6366f1', color: '#6366f1' }}
                    onClick={handleSendDocumentRequest}
                    disabled={sendingDocRequest}
                  >
                    <Mail size={14} style={{ marginRight: 6 }} /> 
                    {sendingDocRequest ? 'Sending Email...' : 'Email Client for Documents'}
                  </button>
                  <button 
                    className="crm-btn crm-btn--primary" 
                    onClick={() => { updateCaseStatus(crmCase.id, 'Preview').then(() => { setViewingStage(null); loadAll(); }); }}
                  >
                    Proceed to Preview ➔
                  </button>
                </>
              )}
            </div>
          </div>
        );
      case 'Preview':
        return <PreviewStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Verification')} isViewOnly={isViewOnly} isCaseLocked={isCaseLocked} onReturnToCurrent={() => setViewingStage(null)} />;
      case 'Processing':
        return <ProcessingStep crmCase={crmCase} onRefresh={loadAll}
          onBack={() => goBack('Preview')} isViewOnly={isViewOnly} isCaseLocked={isCaseLocked} onReturnToCurrent={() => setViewingStage(null)} />;
      case 'Completed':
        return <ProcessingStep crmCase={crmCase} onRefresh={loadAll} isCompletedStage={true}
          onBack={() => goBack('Processing')} isViewOnly={isViewOnly} isCaseLocked={isCaseLocked} onReturnToCurrent={() => setViewingStage(null)} />;
      case 'Closed':
        return (
          <div style={{ padding: 24, background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.25)', borderRadius: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b', marginBottom: 12 }}>🔒 Case Closed</div>
            <div style={{ fontSize: 14, color: 'var(--crm-text)', marginBottom: 20 }}>
              This case is archived and fully closed.
            </div>
            <button className="crm-btn crm-btn--ghost" onClick={() => goBack('Completed')}>
              <ArrowLeft size={16} /> Back to Completed
            </button>
          </div>
        );
      default:
        return null;
    }
  };



  const tabIcons: Record<string, string> = { timeline:'🕐', documents:'📄', payments:'💰', quotations:'📋' };

  return (
    <div className="crm-page">
      <CRMNavbar title={`Case: ${crmCase.case_id}`} subtitle={crmCase.full_name} />
      <div className="crm-page__content">

        {/* Back + badges + Send Email button */}
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <button className="crm-btn crm-btn--ghost" onClick={() => navigate('/crm/cases')}>
            <ArrowLeft size={16} /> Back
          </button>
          <span className="crm-badge" style={{ background:sc.bg, color:sc.text, borderColor:sc.border, fontSize:13, padding:'4px 12px' }}>
            {crmCase.status}
          </span>
          <span className={`crm-priority crm-priority--${crmCase.priority}`}>{crmCase.priority}</span>

          {/* ── Send Email to Client ── */}
          {!isCaseLocked && (
            <button
              className="crm-btn"
              onClick={() => setShowEmailModal(true)}
              style={{
                marginLeft:'auto',
                background:`linear-gradient(135deg, ${GOLD}, #e8b85e)`,
                color:'#0A1628', fontWeight:700, fontSize:13,
                display:'flex', alignItems:'center', gap:6,
                boxShadow:'0 4px 14px rgba(201,150,60,0.3)',
                border:'none',
              }}
            >
              <Mail size={15} /> Send Email to Client
            </button>
          )}
        </div>

        {/* Pipeline stepper */}
        <div className="crm-pipeline">
          {CASE_STATUSES.filter(s => s !== 'Not Interested').map((s, i) => {
            const scc = STATUS_COLORS[s];
            const adjustedIdx = (CASE_STATUSES.filter(x => x !== 'Not Interested') as CaseStatus[]).indexOf(crmCase.status);
            const isDone = i < adjustedIdx;
            const isActive = i === adjustedIdx && viewingStage === null;
            const isViewing = viewingStage === s;
            
            return (
              <div key={s} 
                className={`crm-pipeline__step ${isActive || isViewing ?'crm-pipeline__step--active':''} ${isDone?'crm-pipeline__step--done':''}`}
                style={{ 
                  background: (isActive || isViewing)?scc.bg:isDone?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.02)',
                  color: (isActive || isViewing)?scc.text:isDone?'#64748b':'#475569', 
                  borderColor: (isActive || isViewing)?scc.border:'transparent',
                  cursor: (isDone || isActive) ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (isDone || isActive) {
                    setViewingStage(s === crmCase.status ? null : s);
                  }
                }}
                title={s === 'Payment Pending' ? 'Payment' : s}>
                {isDone && '✓ '}{s === 'Payment Pending' ? 'Payment' : s}
              </div>
            );
          })}
        </div>

        {/* Return to Current Stage Banner */}
        {viewingStage !== null && (
          <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#065f46', fontWeight: 600 }}>
              You are viewing a historical stage ({viewingStage}). Actions are disabled.
            </span>
            <button className="crm-btn crm-btn--success" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setViewingStage(null)}>
              Return to Current Stage
            </button>
          </div>
        )}

        {/* Workflow Action Panel */}
        {renderWorkflowPanel() && (
          <div style={{ background:'var(--crm-panel)', border:'1px solid var(--crm-border)', borderRadius:12, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'1px', color:'var(--crm-muted)', textTransform:'uppercase' }}>
                Current Stage Action Required
              </div>
              {!isCaseLocked && (
                <button
                  className="crm-btn"
                  onClick={() => setShowEmailModal(true)}
                  style={{
                    fontSize:12, padding:'6px 14px',
                    background:'rgba(201,150,60,0.12)',
                    border:'1px solid rgba(201,150,60,0.35)',
                    color: GOLD, fontWeight:700,
                    display:'flex', alignItems:'center', gap:6,
                  }}
                >
                  <Mail size={13} /> Email Client
                </button>
              )}
            </div>
            {renderWorkflowPanel()}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16 }}>
          {/* Left: Tabs */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', gap:4, background:'rgba(0,0,0,0.04)', padding:4, borderRadius:10, flexWrap:'wrap' }}>
              {visibleTabs.map(tab => (
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



            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="crm-table-wrap" style={{ padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                  <h3 style={{ color:'var(--crm-text)', margin:0 }}>📄 Documents</h3>
                  {!isCaseLocked && <button className="crm-btn crm-btn--primary" onClick={() => setShowDocForm(v => !v)}><Plus size={14}/> Add</button>}
                </div>
                {showDocForm && !isCaseLocked && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16, padding:12, background:'rgba(255,255,255,0.03)', borderRadius:8, border:'1px solid var(--crm-border)' }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <select
                        className="crm-select"
                        style={{ flex: 1 }}
                        value={docName === '' || ['Passport Copy', 'Visa Copy', 'Emirates ID Copy', 'Trade License Copy', 'Memorandum of Association (MOA)', 'Board Resolution', 'No Objection Certificate (NOC)'].includes(docName) ? docName : '__custom__'}
                        onChange={e => {
                          if (e.target.value !== '__custom__') {
                            setDocName(e.target.value);
                          } else {
                            setDocName('');
                          }
                        }}
                      >
                        <option value="">-- Choose Document Type --</option>
                        <option value="Passport Copy">Passport Copy</option>
                        <option value="Visa Copy">Visa Copy</option>
                        <option value="Emirates ID Copy">Emirates ID Copy</option>
                        <option value="Trade License Copy">Trade License Copy</option>
                        <option value="Memorandum of Association (MOA)">Memorandum of Association (MOA)</option>
                        <option value="Board Resolution">Board Resolution</option>
                        <option value="No Objection Certificate (NOC)">No Objection Certificate (NOC)</option>
                        <option value="__custom__">Other / Custom Name...</option>
                      </select>
                      <button className="crm-btn crm-btn--primary" onClick={handleAddDoc} disabled={!docName || isUploading}>
                        {isUploading ? 'Uploading...' : 'Add'}
                      </button>
                      <button className="crm-btn crm-btn--ghost" onClick={() => { setShowDocForm(false); setDocFile(null); }}>Cancel</button>
                    </div>
                    {(!['Passport Copy', 'Visa Copy', 'Emirates ID Copy', 'Trade License Copy', 'Memorandum of Association (MOA)', 'Board Resolution', 'No Objection Certificate (NOC)', ''].includes(docName) || docName === '') && (
                      <input
                        className="crm-input"
                        placeholder="Enter custom document name..."
                        value={docName}
                        onChange={e => setDocName(e.target.value)}
                      />
                    )}
                    <div>
                      <input 
                        id="doc-upload"
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={e => setDocFile(e.target.files?.[0] || null)}
                        style={{ display: 'none' }}
                      />
                      <label 
                        htmlFor="doc-upload" 
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, 
                          padding: '12px 16px', background: docFile ? 'rgba(52,211,153,0.1)' : 'rgba(201,150,60,0.08)', 
                          border: `1px dashed ${docFile ? 'rgba(52,211,153,0.4)' : 'rgba(201,150,60,0.4)'}`, 
                          borderRadius: 8, cursor: 'pointer', 
                          color: docFile ? '#059669' : '#C9963C', 
                          fontSize: 13, fontWeight: 600, transition: 'all 0.2s', marginTop: 4
                        }}
                      >
                        <UploadCloud size={18} />
                        {docFile ? `Selected: ${docFile.name}` : 'Click to Upload Picture / PDF (Optional)'}
                      </label>
                    </div>
                  </div>
                )}
                {documents.map(d => {
                  const c = d.status==='approved'?'#34d399':d.status==='rejected'?'#f87171':'#fbbf24';
                  return (
                    <div key={d.id} className="crm-doc-item">
                      <div className="crm-doc-item__icon">📄</div>
                      <div className="crm-doc-item__info">
                        <div className="crm-doc-item__name">
                          {d.name} <span style={{ fontSize:11, color:'#94a3b8' }}>v{d.version}</span>
                        </div>
                        <div className="crm-doc-item__meta">{d.uploaded_by_name ?? 'Agent'} · {new Date(d.created_at).toLocaleDateString()}</div>
                      </div>
                      <span className="crm-badge" style={{ background:`${c}20`, color:c, borderColor:`${c}40` }}>{d.status}</span>
                      
                      <div className="crm-doc-item__actions" style={{ display: 'flex', gap: 6 }}>
                        {d.url && (
                          <button 
                            className="crm-btn" 
                            style={{ padding: '4px 10px', fontSize: 12, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
                            onClick={() => handleViewDocument(d.url!)}
                            title="View Document"
                          >
                            <Eye size={12}/>
                          </button>
                        )}
                        {d.status === 'pending' && !isCaseLocked && (
                          <>
                            <button className="crm-btn crm-btn--success" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => handleDocStatus(d.id,'approved')} title="Approve"><Check size={12}/></button>
                            <button className="crm-btn crm-btn--danger" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => handleDocStatus(d.id,'rejected')} title="Reject"><XCircle size={12}/></button>
                          </>
                        )}
                      </div>
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
                  const isPaid = p.status === 'paid';
                  const isFailed = p.status === 'failed';
                  const c = isPaid ? '#34d399' : isFailed ? '#f87171' : '#fbbf24';
                  return (
                    <div key={p.id} className="crm-payment-item" style={{ flexDirection: 'column', gap: 12, alignItems: 'stretch' }}>
                      {/* Top row: amount + status badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div className="crm-payment-item__amount">AED {Number(p.amount).toLocaleString()}</div>
                          <div className="crm-payment-item__meta">{p.description ?? '—'} · {new Date(p.created_at).toLocaleDateString()}</div>
                          {p.payment_link && <a href={p.payment_link} target="_blank" rel="noreferrer" style={{ fontSize:12, color:GOLD }}>🔗 Payment Link</a>}
                          {isPaid && p.paid_at && (
                            <div style={{ fontSize:11, color:'#34d399', marginTop:4 }}>✓ Paid on {new Date(p.paid_at).toLocaleDateString('en-AE', { day:'2-digit', month:'long', year:'numeric' })}</div>
                          )}
                        </div>
                        <span className="crm-badge" style={{ background:`${c}20`, color:c, borderColor:`${c}40` }}>{p.status}</span>
                      </div>

                      {/* Action buttons row */}
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:10 }}>
                        {/* Mark paid / failed (pending only, not locked) */}
                        {p.status === 'pending' && !isCaseLocked && (
                          <>
                            <button className="crm-btn crm-btn--primary" style={{ padding:'5px 10px', fontSize:11, background: '#3b82f6' }} onClick={() => handleRazorpayPayment(p)}>
                              <CreditCard size={11} style={{ marginRight:4 }} />Pay via Razorpay
                            </button>
                            <button className="crm-btn crm-btn--success" style={{ padding:'5px 10px', fontSize:11 }} onClick={() => handlePaymentMark(p.id,'paid')}>
                              <Check size={11} style={{ marginRight:4 }} />Mark Paid
                            </button>
                            <button className="crm-btn crm-btn--danger" style={{ padding:'5px 10px', fontSize:11 }} onClick={() => handlePaymentMark(p.id,'failed')}>
                              <XCircle size={11} style={{ marginRight:4 }} />Mark Failed
                            </button>
                          </>
                        )}

                        {/* Send pending payment reminder email */}
                        {p.status === 'pending' && !isCaseLocked && (
                          <button
                            className="crm-btn crm-btn--ghost"
                            style={{ padding:'5px 10px', fontSize:11, borderColor: '#fbbf24', color: '#fbbf24' }}
                            onClick={() => handleSendPaymentReminder(p)}
                            disabled={sendingReminder === p.id}
                          >
                            <Bell size={11} style={{ marginRight:4 }} />
                            {sendingReminder === p.id ? 'Sending...' : 'Send Reminder Email'}
                          </button>
                        )}

                        {/* Download receipt (paid only) */}
                        {isPaid && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="crm-btn crm-btn--ghost"
                              style={{ padding:'5px 10px', fontSize:11, borderColor:'#34d399', color:'#34d399' }}
                              onClick={() => downloadPaymentReceipt(p)}
                            >
                              <Download size={11} style={{ marginRight:4 }} />Download Receipt
                            </button>
                            <button
                              className="crm-btn crm-btn--ghost"
                              style={{ padding:'5px 10px', fontSize:11, borderColor:'#6366f1', color:'#6366f1' }}
                              onClick={() => downloadPaymentInvoice(p)}
                            >
                              <FileText size={11} style={{ marginRight:4 }} />Download Invoice
                            </button>
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
                {!isCaseLocked && (
                  !editingNotes
                    ? <button className="crm-btn crm-btn--ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => setEditingNotes(true)}><Edit2 size={12}/> Edit</button>
                    : <div style={{ display:'flex', gap:4 }}>
                        <button className="crm-btn crm-btn--primary" style={{ padding:'4px 10px', fontSize:12 }} onClick={handleSaveNotes} disabled={savingNotes}><Save size={12}/> {savingNotes?'...':'Save'}</button>
                        <button className="crm-btn crm-btn--ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => { setEditingNotes(false); setNotes(crmCase.notes??''); }}><X size={12}/></button>
                      </div>
                )}
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

      {/* Email Compose Modal */}
      {showEmailModal && crmCase && (
        <EmailComposeModal
          crmCase={crmCase}
          stageLabel={crmCase.status}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}
