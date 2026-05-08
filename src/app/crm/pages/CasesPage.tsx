import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { CRMNavbar } from '../components/CRMNavbar';
import { CaseModal } from '../components/CaseModal';
import { fetchCases, STATUS_COLORS, CASE_STATUSES } from '../services/caseService';
import type { CRMCase, CaseFilters } from '../services/caseService';
import { Search, Filter, X, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const GOLD = '#C9963C';

function SLABadge({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  const hours = diff / 3600000;
  if (hours < 0)  return <span className="crm-sla crm-sla--breach">⚠ Overdue</span>;
  if (hours < 24) return <span className="crm-sla crm-sla--warning">⏰ {Math.round(hours)}h left</span>;
  return <span className="crm-sla crm-sla--ok">✓ On track</span>;
}

export function CasesPage() {
  const [cases, setCases] = useState<CRMCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<CaseFilters>({
    search: '',
    status: searchParams.get('status') ?? '',
    service_type: '',
    priority: '',
    dateFrom: '',
    dateTo: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setCases(await fetchCases(filters)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const exportCSV = () => {
    const headers = ['Case ID', 'Name', 'Email', 'Phone', 'Country', 'Service', 'Status', 'Priority', 'Created'];
    const rows = cases.map(c => [
      c.case_id, c.full_name, c.email, c.phone, c.country,
      c.service_type, c.status, c.priority,
      new Date(c.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `cases_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const hasFilters = filters.status || filters.service_type || filters.priority || filters.dateFrom;

  return (
    <div className="crm-page">
      <CRMNavbar
        title="Cases"
        subtitle={`${cases.length} case${cases.length !== 1 ? 's' : ''} found`}
        onNewCase={() => setShowModal(true)}
      />

      <div className="crm-page__content">
        {/* Toolbar */}
        <div className="crm-toolbar">
          <div className="crm-search">
            <Search size={16} className="crm-search__icon" />
            <input
              className="crm-search__input"
              placeholder="Search by name, email, phone, case ID..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <button
            className={`crm-filter-btn ${showFilters ? 'crm-filter-btn--active' : ''}`}
            onClick={() => setShowFilters(v => !v)}
          >
            <Filter size={15} /> Filters
            {hasFilters && <span style={{ background: GOLD, borderRadius: '10px', padding: '0 6px', fontSize: '11px', color: '#0A1628', fontWeight: 700 }}>!</span>}
          </button>
          <button className="crm-filter-btn" onClick={exportCSV}>
            <Download size={15} /> Export
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="crm-filter-panel">
            <div className="crm-filter-group">
              <label>Status</label>
              <select className="crm-select" value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">All Statuses</option>
                {CASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="crm-filter-group">
              <label>Priority</label>
              <select className="crm-select" value={filters.priority}
                onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
                <option value="">All Priorities</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="crm-filter-group">
              <label>Date From</label>
              <input type="date" className="crm-input" value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
            </div>
            <div className="crm-filter-group">
              <label>Date To</label>
              <input type="date" className="crm-input" value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
            </div>
            {hasFilters && (
              <button className="crm-btn crm-btn--ghost" style={{ alignSelf: 'flex-end' }}
                onClick={() => setFilters({ search: '', status: '', service_type: '', priority: '', dateFrom: '', dateTo: '' })}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="crm-table-wrap">
          {loading ? (
            <div className="crm-spinner" />
          ) : cases.length === 0 ? (
            <div className="crm-empty">
              <div className="crm-empty__icon">📂</div>
              <div className="crm-empty__title">No cases found</div>
              <div className="crm-empty__sub">Try adjusting your filters or create a new case.</div>
            </div>
          ) : (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>SLA</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cases.map(c => {
                  const sc = STATUS_COLORS[c.status] ?? STATUS_COLORS['New Lead'];
                  return (
                    <tr key={c.id} onClick={() => navigate(`/crm/cases/${c.id}`)}>
                      <td style={{ fontFamily: 'monospace', color: GOLD, fontWeight: 700 }}>{c.case_id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{c.full_name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{c.email}</div>
                      </td>
                      <td>{c.service_type}</td>
                      <td>
                        <span className="crm-badge" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <span className={`crm-priority crm-priority--${c.priority}`}>
                          {c.priority === 'urgent' ? '🔴' : c.priority === 'high' ? '🟠' : c.priority === 'medium' ? '🟡' : '⚪'}
                          {' '}{c.priority}
                        </span>
                      </td>
                      <td><SLABadge deadline={c.sla_deadline} /></td>
                      <td style={{ color: '#94a3b8', fontSize: '13px' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="crm-btn crm-btn--ghost"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          onClick={e => { e.stopPropagation(); navigate(`/crm/cases/${c.id}`); }}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <CaseModal onClose={() => setShowModal(false)} onCreated={load} />
      )}
    </div>
  );
}
