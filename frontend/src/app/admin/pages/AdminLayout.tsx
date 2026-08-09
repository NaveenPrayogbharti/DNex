import { Outlet, Navigate, useLocation } from 'react-router';
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-screen__spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const role = user.role || 'support';
  const path = location.pathname;

  // Enforce role-based access to specific routes
  if (role !== 'superadmin') {
    if (path.includes('/admin/users') || path.includes('/admin/settings')) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === 'content' && (path.includes('/admin/inquiries') || path.includes('/crm'))) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === 'support' && (path.includes('/admin/services') || path.includes('/admin/content'))) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return (
    <div className="admin-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className="admin-layout__main"
        style={{
          marginLeft: sidebarCollapsed ? '72px' : '260px',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
