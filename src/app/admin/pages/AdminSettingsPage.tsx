import { AdminNavbar } from '../components/AdminNavbar';
import { Settings } from 'lucide-react';

export function AdminSettingsPage() {
  return (
    <div className="admin-page">
      <AdminNavbar title="Settings" subtitle="Configure admin portal" />
      <div className="admin-page__content">
        <div className="admin-placeholder">
          <div className="admin-placeholder__icon">
            <Settings size={48} />
          </div>
          <h2>Settings</h2>
          <p>Settings and configuration options will be available in the upcoming CRM portal.</p>
        </div>
      </div>
    </div>
  );
}
