import { useState, useEffect } from 'react';
import { X, Mail, Phone, Globe, Briefcase, Calendar, MessageCircle, StickyNote, Save, User } from 'lucide-react';
import type { Inquiry, InquiryStatus } from '../services/inquiryService';
import { updateInquiryStatus, updateInquiryNotes } from '../services/inquiryService';

const GOLD = '#C9963C';
const NAVY = '#0A1628';
const STATUSES: InquiryStatus[] = ['New', 'Contacted', 'In Progress', 'Closed'];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'New': { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
  'Contacted': { bg: 'rgba(37, 99, 235, 0.1)', text: '#2563eb' },
  'In Progress': { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706' },
  'Closed': { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' },
};

const DEFAULT_STATUS_STYLE = STATUS_COLORS['New'];

function getStatusStyle(status: string | null | undefined) {
  return STATUS_COLORS[status ?? ''] ?? DEFAULT_STATUS_STYLE;
}

interface InquiryModalProps {
  inquiry: Inquiry | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function InquiryModal({ inquiry, onClose, onUpdate }: InquiryModalProps) {
  const [notes, setNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState<InquiryStatus>('New');
  const [saving, setSaving] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setNotes(inquiry.admin_notes ?? '');
      setCurrentStatus(inquiry.status ?? 'New');
    }
  }, [inquiry]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (inquiry) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [inquiry]);

  if (!inquiry) return null;

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    setSaving(true);
    try {
      await updateInquiryStatus(inquiry.id, newStatus);
      setCurrentStatus(newStatus);
      onUpdate();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateInquiryNotes(inquiry.id, notes);
      onUpdate();
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusStyle = getStatusStyle(currentStatus);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal__header" style={{ background: `linear-gradient(135deg, ${NAVY}, #1a2d4a)` }}>
          <div className="admin-modal__header-content">
            <div
              className="admin-modal__header-avatar"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #E8B85E)` }}
            >
              <span style={{ color: NAVY, fontWeight: 800, fontSize: '20px' }}>
                {inquiry.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div>
              <h2 className="admin-modal__header-name">{inquiry.full_name}</h2>
              <div className="admin-modal__header-meta">
                <span
                  className="admin-modal__status-badge"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                >
                  {currentStatus}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                  Submitted {formatDateTime(inquiry.created_at)}
                </span>
              </div>
            </div>
          </div>
          <button className="admin-modal__close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal__body">
          {/* Contact Info grid */}
          <div className="admin-modal__section">
            <h3 className="admin-modal__section-title">Contact Information</h3>
            <div className="admin-modal__info-grid">
              <div className="admin-modal__info-item">
                <div className="admin-modal__info-icon" style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}>
                  <User size={16} style={{ color: GOLD }} />
                </div>
                <div>
                  <label>Full Name</label>
                  <p>{inquiry.full_name}</p>
                </div>
              </div>
              <div className="admin-modal__info-item">
                <div className="admin-modal__info-icon" style={{ backgroundColor: 'rgba(37,99,235,0.1)' }}>
                  <Mail size={16} style={{ color: '#2563eb' }} />
                </div>
                <div>
                  <label>Email</label>
                  <p>{inquiry.email}</p>
                </div>
              </div>
              <div className="admin-modal__info-item">
                <div className="admin-modal__info-icon" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                  <Phone size={16} style={{ color: '#059669' }} />
                </div>
                <div>
                  <label>Phone</label>
                  <p>{inquiry.phone}</p>
                </div>
              </div>
              <div className="admin-modal__info-item">
                <div className="admin-modal__info-icon" style={{ backgroundColor: 'rgba(139,92,246,0.1)' }}>
                  <Globe size={16} style={{ color: '#7c3aed' }} />
                </div>
                <div>
                  <label>Country</label>
                  <p>{inquiry.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service & Date */}
          <div className="admin-modal__section">
            <h3 className="admin-modal__section-title">Inquiry Details</h3>
            <div className="admin-modal__info-grid">
              <div className="admin-modal__info-item">
                <div className="admin-modal__info-icon" style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}>
                  <Briefcase size={16} style={{ color: '#d97706' }} />
                </div>
                <div>
                  <label>Service Requested</label>
                  <p>{inquiry.service_needed}</p>
                </div>
              </div>
              <div className="admin-modal__info-item">
                <div className="admin-modal__info-icon" style={{ backgroundColor: 'rgba(107,114,128,0.1)' }}>
                  <Calendar size={16} style={{ color: '#6b7280' }} />
                </div>
                <div>
                  <label>Date Submitted</label>
                  <p>{formatDateTime(inquiry.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {inquiry.message && (
            <div className="admin-modal__section">
              <h3 className="admin-modal__section-title">
                <MessageCircle size={16} style={{ color: GOLD }} />
                Message
              </h3>
              <div className="admin-modal__message-box">
                {inquiry.message}
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="admin-modal__section">
            <h3 className="admin-modal__section-title">Update Status</h3>
            <div className="admin-modal__status-group">
              {STATUSES.map((s) => {
                const sc = STATUS_COLORS[s];
                const isActive = s === currentStatus;
                return (
                  <button
                    key={s}
                    className={`admin-modal__status-btn ${isActive ? 'admin-modal__status-btn--active' : ''}`}
                    disabled={saving}
                    onClick={() => handleStatusChange(s)}
                    style={
                      isActive
                        ? { backgroundColor: sc.text, color: '#fff', borderColor: sc.text }
                        : { backgroundColor: sc.bg, color: sc.text, borderColor: 'transparent' }
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="admin-modal__section">
            <h3 className="admin-modal__section-title">
              <StickyNote size={16} style={{ color: GOLD }} />
              Admin Notes
            </h3>
            <textarea
              className="admin-modal__notes-input"
              placeholder="Add notes about this inquiry..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              className="admin-modal__save-btn"
              onClick={handleSaveNotes}
              disabled={savingNotes}
              style={{ backgroundColor: GOLD }}
            >
              <Save size={16} />
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
