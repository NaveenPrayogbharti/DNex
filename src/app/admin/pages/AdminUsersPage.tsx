import { AdminNavbar } from '../components/AdminNavbar';
import { Users } from 'lucide-react';

export function AdminUsersPage() {
  return (
    <div className="admin-page">
      <AdminNavbar title="Admin Users" subtitle="Manage admin access" />
      <div className="admin-page__content">
        <div className="admin-placeholder">
          <div className="admin-placeholder__icon">
            <Users size={48} />
          </div>
          <h2>Admin Users Management</h2>
          <p>This section will be available in the upcoming CRM portal. You'll be able to manage admin team members and their access levels.</p>
        </div>
      </div>
    </div>
  );
}
