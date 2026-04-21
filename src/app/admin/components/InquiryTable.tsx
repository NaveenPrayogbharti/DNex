import { useState } from 'react';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Inquiry, InquiryStatus } from '../services/inquiryService';
import { updateInquiryStatus } from '../services/inquiryService';

const GOLD = '#C9963C';

interface InquiryTableProps {
  inquiries: Inquiry[];
  onViewDetail: (inquiry: Inquiry) => void;
  onStatusChange: () => void;
  loading?: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'New': { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', dot: '#10b981' },
  'Contacted': { bg: 'rgba(37, 99, 235, 0.1)', text: '#2563eb', dot: '#3b82f6' },
  'In Progress': { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706', dot: '#f59e0b' },
  'Closed': { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', dot: '#9ca3af' },
};

const DEFAULT_STATUS_STYLE = STATUS_COLORS['New'];

function getStatusStyle(status: string | null | undefined) {
  return STATUS_COLORS[status ?? ''] ?? DEFAULT_STATUS_STYLE;
}

const STATUSES: InquiryStatus[] = ['New', 'Contacted', 'In Progress', 'Closed'];
const PAGE_SIZE = 10;

export function InquiryTable({ inquiries, onViewDetail, onStatusChange, loading }: InquiryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const totalPages = Math.ceil(inquiries.length / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageInquiries = inquiries.slice(startIdx, startIdx + PAGE_SIZE);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    setUpdatingId(id);
    try {
      await updateInquiryStatus(id, newStatus);
      onStatusChange();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="admin-table-container">
        <div className="admin-table-loading">
          <div className="admin-table-loading__spinner" />
          <p>Loading inquiries...</p>
        </div>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="admin-table-container">
        <div className="admin-table-empty">
          <div className="admin-table-empty__icon">📭</div>
          <h3>No inquiries found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pageInquiries.map((inquiry) => {
              const statusStyle = getStatusStyle(inquiry.status);
              return (
                <tr
                  key={inquiry.id}
                  className="admin-table__row"
                  onClick={() => onViewDetail(inquiry)}
                >
                  <td>
                    <div className="admin-table__name">
                      <div
                        className="admin-table__avatar"
                        style={{ background: `linear-gradient(135deg, ${GOLD}, #E8B85E)` }}
                      >
                        {inquiry.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <div className="admin-table__name-text">{inquiry.full_name}</div>
                        <div className="admin-table__country">{inquiry.country}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-table__email">{inquiry.email}</span>
                  </td>
                  <td>
                    <span className="admin-table__phone">{inquiry.phone}</span>
                  </td>
                  <td>
                    <span className="admin-table__service">{inquiry.service_needed}</span>
                  </td>
                  <td>
                    <div className="admin-table__date">
                      <span>{formatDate(inquiry.created_at)}</span>
                      <span className="admin-table__time">{formatTime(inquiry.created_at)}</span>
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="admin-table__status-wrapper">
                      <select
                        className="admin-table__status-select"
                        value={inquiry.status ?? 'New'}
                        disabled={updatingId === inquiry.id}
                        onChange={(e) =>
                          handleStatusChange(inquiry.id, e.target.value as InquiryStatus)
                        }
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          borderColor: statusStyle.bg,
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="admin-table__action-btn"
                      onClick={() => onViewDetail(inquiry)}
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-table__pagination">
          <span className="admin-table__pagination-info">
            Showing {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, inquiries.length)} of{' '}
            {inquiries.length} inquiries
          </span>
          <div className="admin-table__pagination-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="admin-table__pagination-btn"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`admin-table__pagination-btn ${
                  page === currentPage ? 'admin-table__pagination-btn--active' : ''
                }`}
                style={
                  page === currentPage
                    ? { backgroundColor: GOLD, color: '#fff', borderColor: GOLD }
                    : {}
                }
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="admin-table__pagination-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
