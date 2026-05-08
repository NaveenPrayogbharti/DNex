export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  active: boolean;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: '1', title: 'Free Zone Company Setup', description: 'Start your business in UAE Free Zones.', active: true },
  { id: '2', title: 'Mainland Company Formation', description: 'Setup your business in UAE Mainland.', active: true },
  { id: '3', title: 'Offshore Company Formation', description: 'Form an offshore company with ease.', active: true },
  { id: '4', title: 'Business Incubation', description: '', active: true },
  { id: '5', title: 'Tax Consultancy', description: '', active: true },
  { id: '6', title: 'Employment Visa', description: '', active: true },
  { id: '7', title: 'Family Visa', description: '', active: true },
  { id: '8', title: 'VAT Registration', description: '', active: true },
  { id: '9', title: 'Corporate Tax', description: '', active: true },
  { id: '10', title: 'Accounting & Bookkeeping', description: '', active: true },
  { id: '11', title: 'Document Attestation', description: '', active: true },
  { id: '12', title: 'Bank Account Assistance', description: '', active: true },
  { id: '13', title: 'Other', description: '', active: true },
];

export function getStoredServices(): ServiceItem[] {
  try {
    const saved = localStorage.getItem('dnex_services_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load services from storage', e);
  }
  return DEFAULT_SERVICES;
}

export function saveStoredServices(services: ServiceItem[]) {
  localStorage.setItem('dnex_services_config', JSON.stringify(services));
}
