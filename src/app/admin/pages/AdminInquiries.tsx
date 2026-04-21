import { useState, useEffect, useCallback } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { InquiryTable } from '../components/InquiryTable';
import { InquiryModal } from '../components/InquiryModal';
import { fetchInquiries } from '../services/inquiryService';
import type { Inquiry, InquiryStatus, InquiryFilters } from '../services/inquiryService';
import { Search, Filter, X, Download } from 'lucide-react';

const GOLD = '#C9963C';

const SERVICES = [
  'Free Zone Company Setup',
  'Mainland Company Formation',
  'Offshore Company Formation',
  'Business Incubation',
  'Tax Consultancy',
  'Employment Visa',
  'Family Visa',
  'VAT Registration',
  'Corporate Tax',
  'Accounting & Bookkeeping',
  'Document Attestation',
  'Bank Account Assistance',
  'Other',
];

const STATUSES: InquiryStatus[] = ['New', 'Contacted', 'In Progress', 'Closed'];

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<InquiryFilters>({
    search: '',
    status: '',
    service: '',
    dateFrom: '',
    dateTo: '',
  });

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInquiries(filters);
      setInquiries(data);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(loadInquiries, 300);
    return () => clearTimeout(debounce);
  }, [loadInquiries]);

  const clearFilters = () => {
    setFilters({ search: '', status: '', service: '', dateFrom: '', dateTo: '' });
  };

  const hasActiveFilters =
    filters.status || filters.service || filters.dateFrom || filters.dateTo;

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Country', 'Service', 'Message', 'Status', 'Date'];
    const rows = inquiries.map((i) => [
      i.full_name,
      i.email,
      i.phone,
      i.country,
      i.service_needed,
      `"${(i.message ?? '').replace(/"/g, '""')}"`,
      i.status ?? 'New',
      new Date(i.created_at).toLocaleDateString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page">
      <AdminNavbar title="Inquiries" subtitle="Manage all website inquiries" />

      <div className="admin-page__content">
        {/* Search and Filter Bar */}
        <div className="admin-inquiries__toolbar">
          <div className="admin-inquiries__search">
            <Search size={18} className="admin-inquiries__search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="admin-inquiries__search-input"
            />
            {filters.search && (
              <button
                className="admin-inquiries__search-clear"
                onClick={() => setFilters((f) => ({ ...f, search: '' }))}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="admin-inquiries__actions">
            <button
              className={`admin-inquiries__filter-toggle ${showFilters ? 'admin-inquiries__filter-toggle--active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && (
                <span className="admin-inquiries__filter-badge" style={{ background: GOLD }}>
                  !
                </span>
              )}
            </button>

            <button className="admin-inquiries__export-btn" onClick={exportCSV}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="admin-inquiries__filters">
            <div className="admin-inquiries__filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as InquiryStatus | '' }))}
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-inquiries__filter-group">
              <label>Service</label>
              <select
                value={filters.service}
                onChange={(e) => setFilters((f) => ({ ...f, service: e.target.value }))}
              >
                <option value="">All Services</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-inquiries__filter-group">
              <label>Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              />
            </div>

            <div className="admin-inquiries__filter-group">
              <label>Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              />
            </div>

            {hasActiveFilters && (
              <button className="admin-inquiries__clear-btn" onClick={clearFilters}>
                <X size={14} /> Clear All
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <InquiryTable
          inquiries={inquiries}
          onViewDetail={setSelectedInquiry}
          onStatusChange={loadInquiries}
          loading={loading}
        />
      </div>

      {/* Detail Modal */}
      <InquiryModal
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        onUpdate={loadInquiries}
      />
    </div>
  );
}
