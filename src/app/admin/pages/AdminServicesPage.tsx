import { AdminNavbar } from '../components/AdminNavbar';
import { Briefcase } from 'lucide-react';

export function AdminServicesPage() {
  return (
    <div className="admin-page">
      <AdminNavbar title="Services" subtitle="Manage available services" />
      <div className="admin-page__content">
        <div className="admin-placeholder">
          <div className="admin-placeholder__icon">
            <Briefcase size={48} />
          </div>
          <h2>Services Management</h2>
          <p>This section will be available in the upcoming CRM portal. You'll be able to manage all service offerings from here.</p>
        </div>
      </div>
    </div>
  );
}
