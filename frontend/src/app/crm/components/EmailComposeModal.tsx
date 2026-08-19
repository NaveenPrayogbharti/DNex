/**
 * EmailComposeModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable email compose popup for the DNex CRM.
 * Appears when agent clicks "Send Email to Client" at any case stage.
 * Uses the backend /api/notify/email endpoint via sendCustomEmail().
 */

import { useState, useRef, useEffect } from 'react';
import { X, Send, Mail, ChevronDown, Paperclip, FileText, Image, File } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { sendCustomEmail } from '../services/emailNotificationService';
import type { CRMCase } from '../services/caseService';
import { LOGO_BASE64 } from '../utils/logoBase64';

const GOLD = '#C9963C';

// ── Unified Email Templates (Fills both Subject & Body) ───────────────────────
// Dynamic templates are fetched from Supabase

// ── Attachment type ──────────────────────────────────────────────────────────
interface AttachmentFile {
  filename: string;
  content: string;      // base64 string
  contentType: string;  // MIME type
  encoding: 'base64';
  sizeKb: number;       // display only
}

const MAX_FILE_SIZE_MB = 5;

function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) return <Image size={14} color='#94a3b8' />;
  if (contentType === 'application/pdf' || contentType.includes('text')) return <FileText size={14} color='#94a3b8' />;
  return <File size={14} color='#94a3b8' />;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  crmCase: CRMCase;
  onClose: () => void;
  /** Optional stage label shown in the modal header, e.g. "Document Collection" */
  stageLabel?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function EmailComposeModal({ crmCase, onClose, stageLabel }: Props) {
  const [to, setTo]           = useState(crmCase.email ?? '');
  const [cc, setCc]           = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody]       = useState('');
  const [showCC, setShowCC]   = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [showTemplatesDrop, setShowTemplatesDrop] = useState(false);
  const [attachments, setAttachments]             = useState<AttachmentFile[]>([]);
  const [isDragOver, setIsDragOver]               = useState(false);
  const [attachError, setAttachError]             = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dynamic templates state
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('system_templates').select('*').eq('type', 'email')
      .then(({ data }) => setTemplates(data || []));
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setAttachError('');
    const toAdd: AttachmentFile[] = [];
    Array.from(files).forEach(file => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setAttachError(`"${file.name}" exceeds ${MAX_FILE_SIZE_MB} MB limit and was skipped.`);
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
    return toAdd;
  };

  const removeAttachment = (idx: number) =>
    setAttachments(prev => prev.filter((_, i) => i !== idx));

  const applyTemplate = (t: any) => {
    let finalSubject = t.subject || '';
    let finalBody = t.body || '';

    // Replace common variables
    const vars: Record<string, string> = {
      'client_name': crmCase.full_name || '',
      'full_name': crmCase.full_name || '',
      'case_id': crmCase.case_id || '',
      'email': crmCase.email || '',
      'phone': crmCase.phone || '',
    };

    for (const [key, val] of Object.entries(vars)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      finalSubject = finalSubject.replace(regex, val);
      finalBody = finalBody.replace(regex, val);
    }

    setSubject(finalSubject);
    setBody(finalBody);
    setShowTemplatesDrop(false);
  };

  const handleSend = async () => {
    if (!to || !subject || !body) {
      setError('To, Subject and Body are required.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const recipients: string[] = [to];
      if (cc.trim()) cc.split(',').map(e => e.trim()).filter(Boolean).forEach(e => recipients.push(e));

      const result = await sendCustomEmail({
        to: recipients.length === 1 ? recipients[0] : recipients,
        subject,
        body: wrapHtml(subject, body),
        replyTo: 'consultant@dnex.ae',
        attachments: attachments.map(a => ({ filename: a.filename, content: a.content, encoding: a.encoding, contentType: a.contentType })),
      });

      if (result.success) {
        setSent(true);
        setTimeout(onClose, 2000);
      } else {
        setError(result.error ?? 'Failed to send. Please try again.');
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: 'min(680px, 96vw)',
        background: 'linear-gradient(135deg, #0f1c2e, #1a2a48)',
        border: '1px solid rgba(201,150,60,0.3)',
        borderRadius: 16,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '90vh', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(201,150,60,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={18} color={GOLD} />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
                Email to Client
              </div>
              {stageLabel && (
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                  Stage: {stageLabel} · Case {crmCase.case_id}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Sent success banner */}
          {sent && (
            <div style={{
              padding: '14px 18px', background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10,
              color: '#34d399', fontWeight: 700, textAlign: 'center', fontSize: 14,
            }}>
              ✅ Email sent successfully! Closing...
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={{
              padding: '12px 16px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
              color: '#f87171', fontSize: 13,
            }}>
              ✗ {error}
            </div>
          )}

          {/* To */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>TO *</label>
              <button
                onClick={() => setShowCC(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: GOLD, fontWeight: 600 }}
              >
                {showCC ? '− Remove CC' : '+ Add CC'}
              </button>
            </div>
            <input
              className="crm-input"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="client@email.com"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.12)' }}
            />
          </div>

          {/* CC */}
          {showCC && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>CC (comma separated)</label>
              <input
                className="crm-input"
                value={cc}
                onChange={e => setCc(e.target.value)}
                placeholder="manager@dnex.ae, other@email.com"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.12)' }}
              />
            </div>
          )}

          {/* Subject */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>SUBJECT *</label>
              <button
                onClick={() => setShowTemplatesDrop(v => !v)}
                style={{
                  background: 'rgba(201,150,60,0.15)', border: '1px solid rgba(201,150,60,0.6)',
                  borderRadius: 6, cursor: 'pointer', fontSize: 11, color: GOLD,
                  fontWeight: 700, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                ⚡ Select Template <ChevronDown size={12} />
              </button>
            </div>
            {showTemplatesDrop && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, zIndex: 50,
                background: '#1e2d45', border: '1px solid rgba(201,150,60,0.4)',
                borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                minWidth: 300, maxHeight: 260, overflowY: 'auto',
              }}>
                {templates.map(t => (
                  <div
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#e2e8f0',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,150,60,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ fontWeight: 700, fontSize: 12, color: GOLD }}>{t.name}</div>
                    {t.subject && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</div>}
                  </div>
                ))}
                {templates.length === 0 && <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13 }}>No templates found</div>}
              </div>
            )}
            <input
              className="crm-input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Email subject..."
              style={{ background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.12)' }}
            />
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>MESSAGE BODY *</label>
            <textarea
              className="crm-textarea"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
              placeholder={`Dear ${crmCase.full_name},\n\nType your message here...\n\nBest regards,\nDNex Consulting Team`}
              style={{
                background: 'rgba(255,255,255,0.05)', color: '#e2e8f0',
                borderColor: 'rgba(255,255,255,0.12)', fontFamily: 'monospace',
                fontSize: 13, lineHeight: 1.7, resize: 'vertical',
              }}
            />
            <div style={{ fontSize: 11, color: '#64748b' }}>
              💡 You can use HTML tags like &lt;b&gt;, &lt;p&gt;, &lt;br/&gt;, &lt;ul&gt;, &lt;li&gt; in the body.
            </div>
          </div>

          {/* Attachments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>
                <Paperclip size={12} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                ATTACHMENTS <span style={{ fontWeight: 400, color: '#475569' }}>(optional · max {MAX_FILE_SIZE_MB} MB each)</span>
              </label>
              {attachments.length > 0 && (
                <span style={{ fontSize: 11, color: '#64748b' }}>{attachments.length} file{attachments.length > 1 ? 's' : ''} selected</span>
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
                borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
                background: isDragOver ? 'rgba(201,150,60,0.08)' : 'rgba(255,255,255,0.02)',
                textAlign: 'center', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Paperclip size={15} color={isDragOver ? GOLD : '#475569'} />
              <span style={{ fontSize: 12, color: isDragOver ? GOLD : '#475569' }}>
                Drag & drop files here, or <span style={{ color: GOLD, fontWeight: 600 }}>click to browse</span>
              </span>
            </div>
            <input
              ref={fileInputRef}
              type='file'
              multiple
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />

            {/* Attach error */}
            {attachError && (
              <div style={{ fontSize: 11, color: '#f87171' }}>⚠ {attachError}</div>
            )}

            {/* File list */}
            {attachments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {attachments.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 12px', borderRadius: 8,
                    background: 'rgba(201,150,60,0.07)', border: '1px solid rgba(201,150,60,0.2)',
                  }}>
                    {getFileIcon(f.contentType)}
                    <span style={{ flex: 1, fontSize: 12, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.filename}</span>
                    <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{f.sizeKb} KB</span>
                    <button
                      onClick={() => removeAttachment(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2, display: 'flex', alignItems: 'center' }}
                      title='Remove'
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview strip */}
          <div style={{
            padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
            borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)',
            fontSize: 12, color: '#94a3b8',
          }}>
            <span style={{ fontWeight: 700, color: '#64748b' }}>FROM: </span>
            <span>DNex Business Setup &lt;consultant@dnex.ae&gt;</span>
            <span style={{ margin: '0 10px', color: '#334155' }}>|</span>
            <span style={{ fontWeight: 700, color: '#64748b' }}>TO: </span>
            <span style={{ color: GOLD }}>{to || '—'}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10,
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '9px 18px', cursor: 'pointer',
              color: '#94a3b8', fontSize: 13, fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || sent || !to || !subject || !body}
            style={{
              background: sending || sent ? 'rgba(201,150,60,0.4)' : `linear-gradient(135deg, ${GOLD}, #e8b85e)`,
              border: 'none', borderRadius: 8, padding: '10px 24px',
              cursor: sending || sent ? 'not-allowed' : 'pointer',
              color: '#0A1628', fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(201,150,60,0.35)',
              transition: 'all 0.2s',
            }}
          >
            <Send size={15} />
            {sent ? '✓ Sent!' : sending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </>
  );
}

// ── HTML wrapper ──────────────────────────────────────────────────────────────
function wrapHtml(subject: string, rawBody: string): string {
  // If body looks like plain text (no HTML tags), convert newlines to <br/>
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(rawBody);
  const htmlBody = hasHtmlTags
    ? rawBody
    : rawBody.split('\n').map(line => `<p style="margin:6px 0;color:#475569;font-size:14px;line-height:1.7;">${line || '&nbsp;'}</p>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .wrapper { max-width: 620px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #ffffff; padding: 28px 32px; border-bottom: 1px solid #e2e8f0; }
    .header h1 { color: #C9963C; margin: 0 0 4px; font-size: 20px; letter-spacing: -0.5px; }
    .header p { color: #64748b; font-size: 12px; margin: 0; }
    .body { padding: 28px 32px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 12px; color: #94a3b8; text-align: center; }
    b, strong { color: #1e293b; }
    ul { color: #475569; padding-left: 20px; }
    li { margin: 4px 0; }
    a { color: #C9963C; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="cid:dnex-logo" alt="DNex Logo" style="height: 48px; object-fit: contain; margin-bottom: 8px;" />
      <p>Official Communication — ${subject}</p>
    </div>
    <div class="body">${htmlBody}</div>
    <div class="footer">
      DNex Business Setup Consulting &bull; Dubai, UAE<br/>
      📞 +971 551251185 &bull; consultant@dnex.ae
    </div>
  </div>
</body>
</html>`;
}
