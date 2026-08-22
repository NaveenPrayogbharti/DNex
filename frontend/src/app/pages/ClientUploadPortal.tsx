import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { CRMDocument } from '../crm/services/documentService';
import { CRMCase } from '../crm/services/caseService';
import { getStoredServices } from '../../lib/servicesStore';
import { UploadCloud, CheckCircle, FileText, Loader2, AlertCircle } from 'lucide-react';

export function ClientUploadPortal() {
  const { caseId } = useParams<{ caseId: string }>();
  const [crmCase, setCrmCase] = useState<CRMCase | null>(null);
  const [documents, setDocuments] = useState<CRMDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadName, setActiveUploadName] = useState<string | null>(null);

  const loadData = async () => {
    if (!caseId) {
      setError('Invalid Link');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Fetch case using public endpoint to bypass RLS
      const caseRes = await fetch(`/api/public/cases/${caseId}`);
      if (!caseRes.ok) {
        setError('Case not found');
        return;
      }
      const fetchedCase = await caseRes.json();
      setCrmCase(fetchedCase);
      
      // Fetch documents using public endpoint
      const docsRes = await fetch(`/api/public/documents/${caseId}`);
      if (docsRes.ok) {
        setDocuments(await docsRes.json());
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  const services = getStoredServices();
  const assignedService = crmCase ? services.find(s => s.title === crmCase.service_type) : null;
  const requiredDocs = assignedService?.required_docs || ['Passport Copy', 'Visa Copy'];

  const triggerUpload = (docName: string) => {
    setActiveUploadName(docName);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadName || !caseId || !crmCase) return;

    setUploadingDoc(activeUploadName);
    try {
      // Convert file to base64 for public API
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const uploadRes = await fetch('/api/public/documents/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              caseId,
              docName: activeUploadName,
              fileName: file.name,
              fileBase64: base64,
              uploadedByName: crmCase.full_name
            })
          });

          if (!uploadRes.ok) {
            throw new Error('Upload failed');
          }

          await loadData();
          alert(`${activeUploadName} uploaded successfully!`);
        } catch (err) {
          console.error(err);
          alert(`Failed to upload ${activeUploadName}`);
        } finally {
          setUploadingDoc(null);
          setActiveUploadName(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${activeUploadName}`);
      setUploadingDoc(null);
      setActiveUploadName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <Loader2 size={32} className="animate-spin" color="#C9963C" />
      </div>
    );
  }

  if (error || !crmCase) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, color: '#1e293b', marginBottom: 8 }}>Portal Access Error</h2>
          <p style={{ color: '#64748b' }}>{error}</p>
        </div>
      </div>
    );
  }

  const allApproved = requiredDocs.every(reqDoc => {
    const doc = documents.find(d => d.name === reqDoc);
    return doc && doc.status === 'approved';
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,image/*" onChange={handleFileSelected} />

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ background: '#0A1628', display: 'inline-block', padding: '15px 30px', borderRadius: 12, marginBottom: 24 }}>
             <h1 style={{ color: '#C9963C', margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: 1 }}>DNEX<span style={{ color: '#fff', fontSize: 14, fontWeight: 400, marginLeft: 8 }}>Consulting</span></h1>
          </div>
          <h2 style={{ fontSize: 28, color: '#1e293b', fontWeight: 700, marginBottom: 8 }}>Secure Document Upload</h2>
          <p style={{ fontSize: 15, color: '#64748b' }}>Welcome back, <strong>{crmCase.full_name}</strong>. Please provide the required documents for your <strong>{crmCase.service_type}</strong> application.</p>
        </div>

        {/* Status Alert */}
        {allApproved ? (
          <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: 20, borderRadius: 12, marginBottom: 30, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <CheckCircle size={24} color="#10b981" />
            <div>
              <div style={{ fontWeight: 600, color: '#065f46', fontSize: 16, marginBottom: 4 }}>All Documents Received</div>
              <div style={{ color: '#047857', fontSize: 14 }}>Thank you! All your documents have been submitted and approved. We are now processing your application.</div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 18, color: '#1e293b', marginBottom: 20, fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>Required Documents</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {requiredDocs.map(reqDoc => {
                const existingDoc = documents.find(d => d.name === reqDoc);
                const isUploading = uploadingDoc === reqDoc;
                
                let statusColor = '#94a3b8';
                let statusText = 'Pending Upload';
                let bgColor = '#f8fafc';
                let borderColor = '#e2e8f0';

                if (existingDoc) {
                  if (existingDoc.status === 'approved') {
                    statusColor = '#10b981';
                    statusText = 'Approved';
                    bgColor = '#ecfdf5';
                    borderColor = '#a7f3d0';
                  } else if (existingDoc.status === 'rejected') {
                    statusColor = '#ef4444';
                    statusText = 'Rejected - Please Re-upload';
                    bgColor = '#fef2f2';
                    borderColor = '#fecaca';
                  } else {
                    statusColor = '#f59e0b';
                    statusText = 'Under Review';
                    bgColor = '#fffbeb';
                    borderColor = '#fde68a';
                  }
                }

                return (
                  <div key={reqDoc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, border: `1px solid ${borderColor}`, background: bgColor, transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                        <FileText size={20} color={statusColor} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{reqDoc}</div>
                        <div style={{ fontSize: 12, color: statusColor, fontWeight: 500, marginTop: 2 }}>{statusText} {existingDoc?.rejection_reason ? `- ${existingDoc.rejection_reason}` : ''}</div>
                      </div>
                    </div>
                    
                    <div>
                      {(!existingDoc || existingDoc.status === 'rejected') ? (
                        <button 
                          onClick={() => triggerUpload(reqDoc)}
                          disabled={isUploading}
                          style={{ 
                            background: '#0A1628', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: isUploading ? 0.7 : 1
                          }}
                        >
                          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                          {isUploading ? 'Uploading...' : 'Upload File'}
                        </button>
                      ) : (
                        existingDoc.status === 'approved' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600, fontSize: 14 }}>
                            <CheckCircle size={18} /> Verified
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 24, fontSize: 13, color: '#64748b', textAlign: 'center' }}>
              Supported formats: PDF, JPG, PNG. Maximum file size: 10MB per document.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
