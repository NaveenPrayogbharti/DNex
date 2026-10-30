/**
 * frontend/src/app/admin/services/careerService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Service layer for Careers & Job Opportunities:
 *  - Public: fetchActiveJobs(), submitJobApplication()
 *  - Admin: fetchAllAdminJobs(), createJob(), updateJob(), toggleJobActive(), deleteJob()
 *  - Admin: fetchApplications(), updateApplication(), deleteApplication()
 *  - Export: exportApplicationsToExcel()
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from './supabaseClient';

export interface JobPosting {
  id: string;
  title: string;
  slug?: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range?: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  application_count?: number;
}

export type ApplicationStatus =
  | 'New'
  | 'Reviewing'
  | 'Shortlisted'
  | 'Interview'
  | 'Hired'
  | 'Rejected';

export interface JobApplication {
  id: string;
  job_id?: string | null;
  job_title: string;
  full_name: string;
  email: string;
  phone: string;
  current_location: string;
  experience_years: string;
  cover_letter?: string;
  resume_url?: string;
  resume_filename?: string;
  status: ApplicationStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationFilters {
  search?: string;
  status?: ApplicationStatus | '';
  job_id?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3006';
    }
  }
  return import.meta.env.VITE_BACKEND_API_URL || '';
}

export function resolveResumeUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = getApiBase();
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC METHODS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all active (listed) jobs for the public careers page.
 */
export async function fetchActiveJobs(): Promise<JobPosting[]> {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/careers/jobs`);
    if (res.ok) {
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        return data.jobs;
      }
    }
  } catch (err) {
    console.warn('API fetchActiveJobs fallback to Supabase:', err);
  }

  // Fallback to Supabase admin_content
  try {
    const { data } = await supabase
      .from('admin_content')
      .select('value')
      .eq('key', 'careers_job_postings')
      .single();

    if (data && data.value) {
      const parsed: JobPosting[] = JSON.parse(data.value);
      return parsed.filter(j => j.is_active);
    }
  } catch (e) {
    console.error('Supabase fallback error:', e);
  }

  return [];
}

/**
 * Submit job application with candidate details and resume.
 */
export async function submitJobApplication(payload: {
  job_id?: string | null;
  job_title: string;
  full_name: string;
  email: string;
  phone: string;
  current_location?: string;
  experience_years?: string;
  cover_letter?: string;
  resume_filename?: string;
  resume_base64?: string;
}): Promise<{ success: boolean; application?: JobApplication; error?: string }> {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/careers/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, application: data.application };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || 'Failed to submit application.' };
    }
  } catch (err: any) {
    console.error('submitJobApplication error:', err);
    return { success: false, error: err.message || 'Failed to submit application. Please try again.' };
  }
}


// ═════════════════════════════════════════════════════════════════════════════
// ADMIN JOBS METHODS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all jobs for the admin panel (both listed and unlisted).
 */
export async function fetchAllAdminJobs(): Promise<JobPosting[]> {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/admin/jobs`);
    if (res.ok) {
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        return data.jobs;
      }
    }
  } catch (err) {
    console.warn('API fetchAllAdminJobs fallback to Supabase:', err);
  }

  try {
    const { data } = await supabase
      .from('admin_content')
      .select('value')
      .eq('key', 'careers_job_postings')
      .single();

    if (data && data.value) {
      return JSON.parse(data.value) as JobPosting[];
    }
  } catch (e) {
    console.error('Supabase admin jobs fetch error:', e);
  }

  return [];
}

/**
 * Create a new job opening (with API + Supabase direct fallback).
 */
export async function createJob(jobData: Partial<JobPosting>): Promise<JobPosting> {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/admin/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.job) return data.job;
    }
  } catch (err) {
    console.warn('API createJob error, saving directly via Supabase:', err);
  }

  // Fallback to Supabase admin_content directly
  try {
    const allJobs = await fetchAllAdminJobs();
    const newJob: JobPosting = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: jobData.title || 'Untitled Opening',
      slug: jobData.slug || (jobData.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      department: jobData.department || 'Sales & Advisory',
      location: jobData.location || 'Dubai, UAE',
      employment_type: jobData.employment_type || 'Full-time',
      experience_level: jobData.experience_level || 'Mid-Senior',
      salary_range: jobData.salary_range || '',
      description: jobData.description || '',
      responsibilities: jobData.responsibilities || [],
      requirements: jobData.requirements || [],
      benefits: jobData.benefits || [],
      is_active: jobData.is_active !== undefined ? jobData.is_active : true,
      sort_order: (allJobs.length || 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      application_count: 0
    };

    const updatedJobs = [...allJobs, newJob];
    const { error: upsertErr } = await supabase
      .from('admin_content')
      .upsert({
        key: 'careers_job_postings',
        value: JSON.stringify(updatedJobs),
        updated_at: new Date().toISOString()
      });

    if (upsertErr) throw upsertErr;
    return newJob;
  } catch (supaErr: any) {
    console.error('Direct Supabase createJob error:', supaErr);
    throw new Error(supaErr.message || 'Failed to create job');
  }
}

/**
 * Update an existing job opening (with API + Supabase direct fallback).
 */
export async function updateJob(id: string, updates: Partial<JobPosting>): Promise<JobPosting> {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/admin/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.job) return data.job;
    }
  } catch (err) {
    console.warn('API updateJob error, updating directly via Supabase:', err);
  }

  // Fallback to Supabase admin_content directly
  try {
    const allJobs = await fetchAllAdminJobs();
    const index = allJobs.findIndex(j => j.id === id);

    if (index === -1) {
      throw new Error('Job not found.');
    }

    allJobs[index] = {
      ...allJobs[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { error: upsertErr } = await supabase
      .from('admin_content')
      .upsert({
        key: 'careers_job_postings',
        value: JSON.stringify(allJobs),
        updated_at: new Date().toISOString()
      });

    if (upsertErr) throw upsertErr;
    return allJobs[index];
  } catch (supaErr: any) {
    console.error('Direct Supabase updateJob error:', supaErr);
    throw new Error(supaErr.message || 'Failed to update job');
  }
}

/**
 * One-click toggle for listing or unlisting a job.
 */
export async function toggleJobActive(id: string, currentStatus: boolean): Promise<JobPosting> {
  return updateJob(id, { is_active: !currentStatus });
}

/**
 * Delete a job opening.
 */
export async function deleteJob(id: string): Promise<void> {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/admin/jobs/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) return;
  } catch (err) {
    console.warn('API deleteJob error, deleting directly via Supabase:', err);
  }

  try {
    const allJobs = await fetchAllAdminJobs();
    const filtered = allJobs.filter(j => j.id !== id);

    const { error: upsertErr } = await supabase
      .from('admin_content')
      .upsert({
        key: 'careers_job_postings',
        value: JSON.stringify(filtered),
        updated_at: new Date().toISOString()
      });

    if (upsertErr) throw upsertErr;
  } catch (supaErr: any) {
    console.error('Direct Supabase deleteJob error:', supaErr);
    throw new Error(supaErr.message || 'Failed to delete job');
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN APPLICATIONS METHODS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fetch candidate applications with optional filters.
 */
export async function fetchApplications(filters?: ApplicationFilters): Promise<JobApplication[]> {
  const apiBase = getApiBase();
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.job_id) params.set('job_id', filters.job_id);
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.set('dateTo', filters.dateTo);

  try {
    const res = await fetch(`${apiBase}/api/admin/job-applications?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.applications && Array.isArray(data.applications)) {
        return data.applications;
      }
    }
  } catch (err) {
    console.warn('API fetchApplications fallback to Supabase:', err);
  }

  // Fallback to Supabase admin_content
  try {
    const { data } = await supabase
      .from('admin_content')
      .select('value')
      .eq('key', 'careers_job_applications')
      .single();

    if (data && data.value) {
      let apps: JobApplication[] = JSON.parse(data.value);
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        apps = apps.filter(a =>
          a.full_name.toLowerCase().includes(s) ||
          a.email.toLowerCase().includes(s) ||
          a.phone.includes(s) ||
          a.job_title.toLowerCase().includes(s)
        );
      }
      if (filters?.status) {
        apps = apps.filter(a => a.status === filters.status);
      }
      if (filters?.job_id) {
        apps = apps.filter(a => a.job_id === filters.job_id);
      }
      return apps;
    }
  } catch (e) {
    console.error('Supabase fallback fetch applications error:', e);
  }

  return [];
}

/**
 * Update candidate application status or admin internal notes.
 */
export async function updateApplication(
  id: string,
  payload: { status?: ApplicationStatus; admin_notes?: string }
): Promise<JobApplication> {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/admin/job-applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.application) return data.application;
    }
  } catch (err) {
    console.warn('API updateApplication error, saving directly via Supabase:', err);
  }

  // Fallback to Supabase
  try {
    const allApps = await fetchApplications();
    const index = allApps.findIndex(a => a.id === id);

    if (index === -1) {
      throw new Error('Application not found.');
    }

    if (payload.status !== undefined) allApps[index].status = payload.status;
    if (payload.admin_notes !== undefined) allApps[index].admin_notes = payload.admin_notes;
    allApps[index].updated_at = new Date().toISOString();

    await supabase
      .from('admin_content')
      .upsert({
        key: 'careers_job_applications',
        value: JSON.stringify(allApps),
        updated_at: new Date().toISOString()
      });

    return allApps[index];
  } catch (supaErr: any) {
    console.error('Direct Supabase updateApplication error:', supaErr);
    throw new Error(supaErr.message || 'Failed to update application');
  }
}

/**
 * Delete a candidate application.
 */
export async function deleteApplication(id: string): Promise<void> {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/admin/job-applications/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) return;
  } catch (err) {
    console.warn('API deleteApplication error, deleting directly via Supabase:', err);
  }

  try {
    const allApps = await fetchApplications();
    const filtered = allApps.filter(a => a.id !== id);

    await supabase
      .from('admin_content')
      .upsert({
        key: 'careers_job_applications',
        value: JSON.stringify(filtered),
        updated_at: new Date().toISOString()
      });
  } catch (supaErr: any) {
    console.error('Direct Supabase deleteApplication error:', supaErr);
    throw new Error(supaErr.message || 'Failed to delete application');
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT TO EXCEL / CSV
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Generates and triggers browser download of an Excel-compatible CSV file
 * with full candidate details, formatted dates, status, notes, and resume links.
 */
export function exportApplicationsToExcel(applications: JobApplication[], filename?: string): void {
  const headers = [
    'Application ID',
    'Candidate Name',
    'Email Address',
    'Phone / WhatsApp',
    'Applied Position',
    'Years Experience',
    'Current Location / Visa',
    'Status',
    'Application Date',
    'Resume Link',
    'Admin Notes',
    'Candidate Query / Cover Note'
  ];

  const rows = applications.map(app => {
    const escapeCsv = (val: string | undefined | null) => {
      if (!val) return '""';
      return `"${val.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    };

    let resumeUrl = app.resume_url || '';
    if (resumeUrl && !resumeUrl.startsWith('http')) {
      resumeUrl = `https://dnex.ae${resumeUrl}`;
    }

    return [
      escapeCsv(app.id),
      escapeCsv(app.full_name),
      escapeCsv(app.email),
      escapeCsv(app.phone),
      escapeCsv(app.job_title),
      escapeCsv(app.experience_years),
      escapeCsv(app.current_location),
      escapeCsv(app.status),
      escapeCsv(new Date(app.created_at).toLocaleDateString('en-GB') + ' ' + new Date(app.created_at).toLocaleTimeString('en-GB')),
      escapeCsv(resumeUrl),
      escapeCsv(app.admin_notes),
      escapeCsv(app.cover_letter)
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `DNEX_Job_Applications_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
