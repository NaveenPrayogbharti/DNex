/**
 * servicesStore.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Single source of truth for services catalog.
 *
 * Storage strategy:
 *  - Primary: Supabase `admin_services` table (persists across browsers/devices)
 *  - Fallback: localStorage (offline / before first sync)
 *
 * The CRM WorkflowSteps component reads from this store via `fetchServicesForCRM()`.
 * The Admin Panel reads/writes via `getStoredServices()` / `saveStoredServices()`.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from './supabase';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  active: boolean;
  /** Docs required for CRM workflow (optional) */
  required_docs?: string[];
}

const LS_KEY = 'dnex_services_config';

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: '1',  title: 'Company Formation',      description: 'Complete company setup in UAE mainland or free zones.', active: true, required_docs: ['Trade License Application', 'Passport Copy', 'Visa Copy', 'NOC Letter'] },
  { id: '2',  title: 'Freezone Setup',          description: 'Register your business in leading UAE free zones.', active: true, required_docs: ['Passport Copy', 'Business Plan', 'Application Form', 'Bank Reference Letter'] },
  { id: '3',  title: 'PRO Services',            description: 'Government liaison and document processing.', active: true, required_docs: ['Emirates ID', 'Passport Copy', 'Residence Visa'] },
  { id: '4',  title: 'Visa Processing',         description: 'Residence, employment, and investor visas.', active: true, required_docs: ['Passport Copy', 'Photo', 'Application Form', 'Medical Report'] },
  { id: '5',  title: 'Bank Account Opening',    description: 'Corporate bank account setup with leading banks.', active: true, required_docs: ['Trade License', 'Passport Copy', 'Business Profile', 'Last 6 Months Bank Statement'] },
  { id: '6',  title: 'Business License',        description: 'Business activity license procurement.', active: true, required_docs: ['Passport Copy', 'Application Form', 'Initial Approval'] },
  { id: '7',  title: 'Tax Consultation',        description: 'VAT registration, filing, and advisory.', active: true, required_docs: ['Financial Statements', 'Trade License', 'VAT Registration (if any)'] },
  { id: '8',  title: 'Legal Services',          description: 'Contract drafting, legal advisory.', active: true, required_docs: ['Relevant Contracts/Agreements', 'Passport Copy'] },
  { id: '9',  title: 'Document Attestation',    description: 'Ministry and embassy attestation services.', active: true, required_docs: ['Original Documents', 'Passport Copy', 'Application Form'] },
  { id: '10', title: 'Golden Visa',             description: 'Long-term UAE residency for investors and talents.', active: true, required_docs: ['Passport Copy', 'Property Deed / Investment Proof', 'Medical Report', 'Photo'] },
  { id: '11', title: 'Accounting & Bookkeeping',description: 'Professional accounting and bookkeeping services.', active: true, required_docs: ['Bank Statements', 'Trade License', 'Previous Accounts'] },
  { id: '12', title: 'Corporate Tax',           description: 'UAE corporate tax registration and filing.', active: true, required_docs: ['Trade License', 'Financial Statements'] },
  { id: '13', title: 'Other',                   description: 'Any other business setup or consultancy need.', active: true, required_docs: ['Passport Copy'] },
];

// ── localStorage fallback ─────────────────────────────────────────────────────

export function getStoredServices(): ServiceItem[] {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_SERVICES;
}

export function saveStoredServices(services: ServiceItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(services));
}

// ── Supabase-backed fetch (for CRM) ──────────────────────────────────────────

/**
 * Fetch active services from Supabase `admin_services` table.
 * Falls back to localStorage → defaults if the table doesn't exist yet.
 */
export async function fetchServicesForCRM(): Promise<ServiceItem[]> {
  try {
    const { data, error } = await supabase
      .from('admin_services')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      // Table doesn't exist or is empty — use local store
      return getStoredServices().filter(s => s.active);
    }

    return data as ServiceItem[];
  } catch {
    return getStoredServices().filter(s => s.active);
  }
}

/**
 * Save services to Supabase `admin_services` table.
 * Also updates localStorage as a cache.
 */
export async function saveServicesToSupabase(services: ServiceItem[]): Promise<void> {
  // Always save to localStorage first as a backup
  saveStoredServices(services);

  try {
    // Upsert all services
    const rows = services.map((s, idx) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      active: s.active,
      required_docs: s.required_docs ?? [],
      sort_order: idx,
    }));

    const { error } = await supabase
      .from('admin_services')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.warn('[servicesStore] Supabase upsert failed, saved to localStorage only:', error.message);
    }
  } catch (e) {
    console.warn('[servicesStore] Supabase unavailable, saved to localStorage only');
  }
}
