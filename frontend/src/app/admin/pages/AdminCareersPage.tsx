import { useState, useEffect, useCallback } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import {
  Briefcase,
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  X,
  Save,
  FileCheck
} from 'lucide-react';
import {
  JobPosting,
  JobApplication,
  ApplicationStatus,
  ApplicationFilters,
  fetchAllAdminJobs,
  createJob,
  updateJob,
  toggleJobActive,
  deleteJob,
  fetchApplications,
  updateApplication,
  deleteApplication,
  exportApplicationsToExcel,
  resolveResumeUrl
} from '../services/careerService';

const GOLD = '#C9963C';
const NAVY = '#0A1628';

const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  New: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  Reviewing: { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
  Shortlisted: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Interview: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
  Hired: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  Rejected: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
};

const ALL_STATUSES: ApplicationStatus[] = [
  'New',
  'Reviewing',
  'Shortlisted',
  'Interview',
  'Hired',
  'Rejected'
];

export function AdminCareersPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');

  // ── Job Postings State ──────────────────────────────────────────────────────
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('Sales & Advisory');
  const [formLocation, setFormLocation] = useState('Dubai, UAE');
  const [formEmploymentType, setFormEmploymentType] = useState('Full-time');
  const [formExperienceLevel, setFormExperienceLevel] = useState('Mid-Senior');
  const [formSalaryRange, setFormSalaryRange] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formResponsibilities, setFormResponsibilities] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [formBenefits, setFormBenefits] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // ── Applications State ──────────────────────────────────────────────────────
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('New');

  // Filters
  const [filters, setFilters] = useState<ApplicationFilters>({
    search: '',
    status: '',
    job_id: '',
    dateFrom: '',
    dateTo: '',
  });

  // ── Load Data ───────────────────────────────────────────────────────────────
  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const data = await fetchAllAdminJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    setAppsLoading(true);
    try {
      const data = await fetchApplications(filters);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setAppsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    const timer = setTimeout(loadApplications, 250);
    return () => clearTimeout(timer);
  }, [loadApplications]);

  // ── Job Postings Handlers ───────────────────────────────────────────────────
  const openJobModal = (job?: JobPosting) => {
    if (job) {
      setEditingJob(job);
      setFormTitle(job.title);
      setFormDepartment(job.department);
      setFormLocation(job.location);
      setFormEmploymentType(job.employment_type);
      setFormExperienceLevel(job.experience_level);
      setFormSalaryRange(job.salary_range || '');
      setFormDescription(job.description);
      setFormResponsibilities((job.responsibilities || []).join('\n'));
      setFormRequirements((job.requirements || []).join('\n'));
      setFormBenefits((job.benefits || []).join('\n'));
      setFormIsActive(job.is_active);
    } else {
      setEditingJob(null);
      setFormTitle('');
      setFormDepartment('Sales & Advisory');
      setFormLocation('Dubai, UAE');
      setFormEmploymentType('Full-time');
      setFormExperienceLevel('Mid-Senior');
      setFormSalaryRange('Competitive');
      setFormDescription('');
      setFormResponsibilities('');
      setFormRequirements('');
      setFormBenefits('');
      setFormIsActive(true);
    }
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDepartment || !formDescription) {
      alert('Please fill in Title, Department, and Description.');
      return;
    }

    const payload: Partial<JobPosting> = {
      title: formTitle,
      department: formDepartment,
      location: formLocation,
      employment_type: formEmploymentType,
      experience_level: formExperienceLevel,
      salary_range: formSalaryRange,
      description: formDescription,
      responsibilities: formResponsibilities.split('\n').map(s => s.trim()).filter(Boolean),
      requirements: formRequirements.split('\n').map(s => s.trim()).filter(Boolean),
      benefits: formBenefits.split('\n').map(s => s.trim()).filter(Boolean),
      is_active: formIsActive,
    };

    try {
      if (editingJob) {
        await updateJob(editingJob.id, payload);
      } else {
        await createJob(payload);
      }
      setIsJobModalOpen(false);
      loadJobs();
    } catch (err: any) {
      alert('Error saving job opening: ' + err.message);
    }
  };

  const handleToggleActive = async (job: JobPosting) => {
    try {
      await toggleJobActive(job.id, job.is_active);
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
    } catch (err: any) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteJob(id);
        setJobs(prev => prev.filter(j => j.id !== id));
      } catch (err: any) {
        alert('Failed to delete job: ' + err.message);
      }
    }
  };

  // ── Applications Handlers ───────────────────────────────────────────────────
  const openAppDetail = (app: JobApplication) => {
    setSelectedApp(app);
    setSelectedStatus(app.status);
    setEditingNotes(app.admin_notes || '');
    setDetailModalOpen(true);
  };

  const handleSaveAppDetails = async () => {
    if (!selectedApp) return;
    try {
      const updated = await updateApplication(selectedApp.id, {
        status: selectedStatus,
        admin_notes: editingNotes,
      });
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, ...updated } : a));
      setSelectedApp(prev => prev ? { ...prev, ...updated } : null);
      setDetailModalOpen(false);
    } catch (err: any) {
      alert('Failed to update application: ' + err.message);
    }
  };

  const handleQuickStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await updateApplication(appId, { status: newStatus });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteApp = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete application from "${name}"?`)) {
      try {
        await deleteApplication(id);
        setApplications(prev => prev.filter(a => a.id !== id));
        if (selectedApp?.id === id) setDetailModalOpen(false);
      } catch (err: any) {
        alert('Failed to delete application: ' + err.message);
      }
    }
  };

  const handleExportExcel = () => {
    if (applications.length === 0) {
      alert('No applications found to export.');
      return;
    }
    exportApplicationsToExcel(applications);
  };

  return (
    <div className="admin-page">
      <AdminNavbar
        title="Careers & Job Opportunities"
        subtitle="Manage job openings, website listing status, candidate queries, and resumes"
      />

      <div className="admin-page__content" style={{ padding: '24px 32px' }}>

        {/* Tab Switcher & Stats Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#e2e8f0',
            padding: '4px',
            borderRadius: '8px',
          }}>
            <button
              onClick={() => setActiveTab('jobs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: activeTab === 'jobs' ? '#ffffff' : 'transparent',
                color: activeTab === 'jobs' ? NAVY : '#64748b',
                boxShadow: activeTab === 'jobs' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Briefcase size={16} style={{ color: activeTab === 'jobs' ? GOLD : 'inherit' }} />
              Job Openings ({jobs.length})
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: activeTab === 'applications' ? '#ffffff' : 'transparent',
                color: activeTab === 'applications' ? NAVY : '#64748b',
                boxShadow: activeTab === 'applications' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Users size={16} style={{ color: activeTab === 'applications' ? GOLD : 'inherit' }} />
              Applications & Resumes ({applications.length})
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeTab === 'jobs' ? (
              <button
                onClick={() => openJobModal()}
                style={{
                  backgroundColor: GOLD,
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(201, 150, 60, 0.25)',
                }}
              >
                <Plus size={18} />
                Post New Opening
              </button>
            ) : (
              <button
                onClick={handleExportExcel}
                style={{
                  backgroundColor: '#107c41', // Excel Green
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(16, 124, 65, 0.25)',
                }}
              >
                <Download size={18} />
                Export to Excel (.CSV)
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: JOB OPENINGS LIST & LIST/UNLIST CONTROLLER */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'jobs' && (
          <div>
            {/* Jobs Table */}
            <div className="admin-table-container" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Position / Title</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Department</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Location & Type</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Experience</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>Website Status (List / Unlist)</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>Applicants</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobsLoading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        Loading job openings...
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No job openings found. Click <strong>Post New Opening</strong> to create your first vacancy.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {/* Position / Title */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: 600, color: NAVY, fontSize: '14px' }}>{job.title}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {job.salary_range ? `Salary: ${job.salary_range}` : 'Salary not specified'}
                          </div>
                        </td>

                        {/* Department */}
                        <td style={{ padding: '16px 18px' }}>
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 500
                          }}>
                            {job.department}
                          </span>
                        </td>

                        {/* Location & Type */}
                        <td style={{ padding: '16px 18px', fontSize: '13px', color: '#334155' }}>
                          <div>{job.location}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{job.employment_type}</div>
                        </td>

                        {/* Experience */}
                        <td style={{ padding: '16px 18px', fontSize: '13px', color: '#334155' }}>
                          {job.experience_level}
                        </td>

                        {/* List / Unlist Switch */}
                        <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleToggleActive(job)}
                            title={job.is_active ? 'Click to Unlist this job from website' : 'Click to List this job on website'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '20px',
                              border: `1px solid ${job.is_active ? '#10b981' : '#cbd5e1'}`,
                              backgroundColor: job.is_active ? '#ecfdf5' : '#f8fafc',
                              color: job.is_active ? '#047857' : '#64748b',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {job.is_active ? (
                              <>
                                <CheckCircle size={14} style={{ color: '#10b981' }} />
                                Listed (Active)
                              </>
                            ) : (
                              <>
                                <XCircle size={14} style={{ color: '#94a3b8' }} />
                                Unlisted (Hidden)
                              </>
                            )}
                          </button>
                        </td>

                        {/* Applicants count */}
                        <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setFilters(f => ({ ...f, job_id: job.id }));
                              setActiveTab('applications');
                            }}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: NAVY,
                              cursor: 'pointer'
                            }}
                          >
                            {job.application_count || 0} Applicants
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => openJobModal(job)}
                              title="Edit job opening"
                              style={{
                                background: 'transparent',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                padding: '6px',
                                cursor: 'pointer',
                                color: '#475569'
                              }}
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              title="Delete job opening"
                              style={{
                                background: 'transparent',
                                border: '1px solid #fee2e2',
                                borderRadius: '4px',
                                padding: '6px',
                                cursor: 'pointer',
                                color: '#ef4444'
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: CANDIDATE APPLICATIONS & RESUMES CONTROLLER */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'applications' && (
          <div>
            {/* Filter Toolbar */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center'
            }}>
              {/* Search */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 12px',
                flex: '1 1 250px',
                backgroundColor: '#f8fafc'
              }}>
                <Search size={16} style={{ color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search candidate by name, email, phone, or job..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    width: '100%',
                    color: NAVY
                  }}
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(f => ({ ...f, search: '' }))}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value as ApplicationStatus | '' }))}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  fontSize: '13px',
                  color: NAVY,
                  backgroundColor: '#ffffff',
                  outline: 'none'
                }}
              >
                <option value="">All Statuses</option>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Job Filter */}
              <select
                value={filters.job_id}
                onChange={e => setFilters(f => ({ ...f, job_id: e.target.value }))}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  fontSize: '13px',
                  color: NAVY,
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  maxWidth: '240px'
                }}
              >
                <option value="">All Positions</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>

              {/* Clear Filters */}
              {(filters.search || filters.status || filters.job_id) && (
                <button
                  onClick={() => setFilters({ search: '', status: '', job_id: '', dateFrom: '', dateTo: '' })}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: GOLD,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Applications Table */}
            <div className="admin-table-container" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Candidate</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Position Applied</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Location & Exp</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>Resume</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appsLoading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        Loading candidate applications...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No candidate applications found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => {
                      const color = STATUS_COLORS[app.status] || STATUS_COLORS.New;
                      const hasResume = Boolean(app.resume_url);
                      return (
                        <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          {/* Candidate info */}
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ fontWeight: 600, color: NAVY, fontSize: '14px' }}>{app.full_name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              <a href={`mailto:${app.email}`} style={{ color: '#475569', textDecoration: 'none' }}>
                                {app.email}
                              </a>
                              <span>•</span>
                              <a href={`tel:${app.phone}`} style={{ color: '#475569', textDecoration: 'none' }}>
                                {app.phone}
                              </a>
                            </div>
                          </td>

                          {/* Position */}
                          <td style={{ padding: '16px 18px' }}>
                            <span style={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: NAVY,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              {app.job_title}
                            </span>
                          </td>

                          {/* Location & Exp */}
                          <td style={{ padding: '16px 18px', fontSize: '13px', color: '#334155' }}>
                            <div>{app.current_location || 'UAE'}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{app.experience_years ? `${app.experience_years} Exp` : 'Experience: —'}</div>
                          </td>

                          {/* Date */}
                          <td style={{ padding: '16px 18px', fontSize: '12px', color: '#64748b' }}>
                            {new Date(app.created_at).toLocaleDateString('en-GB')}
                          </td>

                          {/* Status Dropdown */}
                          <td style={{ padding: '16px 18px' }}>
                            <select
                              value={app.status}
                              onChange={e => handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)}
                              style={{
                                backgroundColor: color.bg,
                                color: color.text,
                                border: `1px solid ${color.border}`,
                                borderRadius: '16px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              {ALL_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>

                          {/* Resume download link */}
                          <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                            {hasResume ? (
                              <a
                                href={resolveResumeUrl(app.resume_url)}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  backgroundColor: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  color: NAVY,
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  textDecoration: 'none'
                                }}
                              >
                                <FileCheck size={14} style={{ color: GOLD }} />
                                View Resume
                              </a>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>No CV attached</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => openAppDetail(app)}
                                title="View candidate query & add notes"
                                style={{
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: NAVY,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Eye size={14} /> Details
                              </button>
                              <button
                                onClick={() => handleDeleteApp(app.id, app.full_name)}
                                title="Delete application"
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #fee2e2',
                                  borderRadius: '4px',
                                  padding: '6px',
                                  cursor: 'pointer',
                                  color: '#ef4444'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: ADD / EDIT JOB OPENING */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isJobModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 22, 40, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsJobModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ color: NAVY, fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0' }}>
              {editingJob ? 'Edit Job Opening' : 'Post New Job Opening'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>
              Define the role, responsibilities, candidate requirements, and website listing visibility.
            </p>

            <form onSubmit={handleSaveJob}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. Senior Business Setup Consultant"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                    Department *
                  </label>
                  <select
                    value={formDepartment}
                    onChange={e => setFormDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Sales & Advisory">Sales & Advisory</option>
                    <option value="Tax & Legal">Tax & Legal</option>
                    <option value="Operations">Operations</option>
                    <option value="Client Services">Client Services</option>
                    <option value="Marketing & Growth">Marketing & Growth</option>
                    <option value="Accounting & Audit">Accounting & Audit</option>
                    <option value="Technology & IT">Technology & IT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    placeholder="e.g. Dubai, UAE"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                    Job Type
                  </label>
                  <select
                    value={formEmploymentType}
                    onChange={e => setFormEmploymentType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                    Experience Level
                  </label>
                  <input
                    type="text"
                    value={formExperienceLevel}
                    onChange={e => setFormExperienceLevel(e.target.value)}
                    placeholder="e.g. 2-4 Years"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                  Salary Package / Compensation (Optional)
                </label>
                <input
                  type="text"
                  value={formSalaryRange}
                  onChange={e => setFormSalaryRange(e.target.value)}
                  placeholder="e.g. Competitive + Commission or AED 8,000 - 12,000 / month"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                  Role Overview & Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Summarize the core purpose and mission of this role..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                  Key Responsibilities (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formResponsibilities}
                  onChange={e => setFormResponsibilities(e.target.value)}
                  placeholder="Advise clients on UAE business structures&#10;Process government licensing and permits&#10;Coordinate with immigration authorities"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                  Requirements & Qualifications (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formRequirements}
                  onChange={e => setFormRequirements(e.target.value)}
                  placeholder="2+ years experience in UAE corporate consulting&#10;Excellent communication and negotiation skills&#10;Bachelor's degree or equivalent"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                  Perks & Benefits (One per line)
                </label>
                <textarea
                  rows={2}
                  value={formBenefits}
                  onChange={e => setFormBenefits(e.target.value)}
                  placeholder="UAE Employment Visa & Health Insurance&#10;Performance incentive bonuses&#10;Annual flight ticket allowance"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* List / Unlist Switch checkbox */}
              <div style={{
                backgroundColor: formIsActive ? '#ecfdf5' : '#f8fafc',
                border: `1px solid ${formIsActive ? '#a7f3d0' : '#e2e8f0'}`,
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={formIsActive}
                  onChange={e => setFormIsActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: GOLD, cursor: 'pointer' }}
                />
                <label htmlFor="activeToggle" style={{ fontSize: '13px', fontWeight: 600, color: NAVY, cursor: 'pointer' }}>
                  List this opening publicly on the website careers page
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>
                    {formIsActive ? 'Active: Candidates can view and apply for this position.' : 'Unlisted: Hidden from website visitors; only visible to admins.'}
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: GOLD,
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {editingJob ? 'Save Changes' : 'Publish Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: CANDIDATE APPLICATION DETAILS & RESUME VIEWER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {detailModalOpen && selectedApp && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 22, 40, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setDetailModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                Candidate Application
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Ref: {selectedApp.id.slice(0, 10).toUpperCase()}
              </span>
            </div>

            <h2 style={{ color: NAVY, fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>
              {selectedApp.full_name}
            </h2>
            <p style={{ color: GOLD, fontSize: '15px', fontWeight: 600, margin: '0 0 20px 0' }}>
              Applied for: {selectedApp.job_title}
            </p>

            {/* Quick Contact & Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '13px'
            }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</span>
                <div style={{ fontWeight: 600, color: NAVY, marginTop: '2px' }}>
                  <a href={`mailto:${selectedApp.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {selectedApp.email}
                  </a>
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Phone / WhatsApp</span>
                <div style={{ fontWeight: 600, color: NAVY, marginTop: '2px' }}>
                  <a href={`tel:${selectedApp.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {selectedApp.phone}
                  </a>
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Location & Visa Status</span>
                <div style={{ fontWeight: 600, color: NAVY, marginTop: '2px' }}>
                  {selectedApp.current_location || 'Not specified'}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Experience Level</span>
                <div style={{ fontWeight: 600, color: NAVY, marginTop: '2px' }}>
                  {selectedApp.experience_years ? `${selectedApp.experience_years} Experience` : 'Not specified'}
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <div style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck size={22} style={{ color: GOLD }} />
                <div>
                  <div style={{ fontWeight: 600, color: NAVY, fontSize: '13px' }}>
                    {selectedApp.resume_filename || 'Candidate Resume / CV'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {selectedApp.resume_url ? 'Uploaded document verified' : 'No document file'}
                  </div>
                </div>
              </div>

              {selectedApp.resume_url && (
                <a
                  href={resolveResumeUrl(selectedApp.resume_url)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: GOLD,
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} /> Open Resume
                </a>
              )}
            </div>

            {/* Cover Note / Query */}
            {selectedApp.cover_letter && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                  Candidate Note / Cover Letter:
                </label>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '160px',
                  overflowY: 'auto'
                }}>
                  {selectedApp.cover_letter}
                </div>
              </div>
            )}

            {/* Status Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                Application Review Status:
              </label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value as ApplicationStatus)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: NAVY,
                  fontWeight: 600,
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Internal Admin Notes */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                HR & Admin Internal Notes:
              </label>
              <textarea
                rows={3}
                value={editingNotes}
                onChange={e => setEditingNotes(e.target.value)}
                placeholder="Add private interview notes, compensation requests, or candidate evaluation..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => handleDeleteApp(selectedApp.id, selectedApp.full_name)}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} /> Delete
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  onClick={handleSaveAppDetails}
                  style={{
                    padding: '9px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: GOLD,
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={15} /> Save Review
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
