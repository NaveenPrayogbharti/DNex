import { Outlet, Navigate } from 'react-router';
import { useState } from 'react';
import { CRMSidebar } from '../components/CRMSidebar';
import { CRMNotificationProvider } from '../context/CRMNotificationContext';
import { useAuth } from '../../admin/context/AuthContext';
import '../../../styles/crm.css';

export function CRMLayout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#f1f5f9',
      }}>
        <div className="crm-spinner" />
      </div>
    );
  }

  if (!user) {
    // Save CRM destination so login can redirect back
    sessionStorage.setItem('crm_redirect', '1');
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  return (
    <CRMNotificationProvider>
      <div className="crm-layout">
        <CRMSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <main
          className="crm-layout__main"
          style={{ marginLeft: collapsed ? '72px' : '240px' }}
        >
          <Outlet />
        </main>
      </div>
    </CRMNotificationProvider>
  );
}
