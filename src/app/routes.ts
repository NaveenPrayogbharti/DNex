import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { Home } from './pages/Home';
import { FreeZone } from './pages/FreeZone';
import { NotFound } from './pages/NotFound';
import { LeadForm } from './components/home/LeadForm';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { OurServices } from './pages/OurServices';
import { IndiaServices } from './pages/IndiaServices';

// Admin imports
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminLayout } from './admin/pages/AdminLayout';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminInquiries } from './admin/pages/AdminInquiries';
import { AdminServicesPage } from './admin/pages/AdminServicesPage';
import { AdminUsersPage } from './admin/pages/AdminUsersPage';
import { AdminSettingsPage } from './admin/pages/AdminSettingsPage';
import { AdminRedirect } from './admin/pages/AdminRedirect';

// CRM imports
import { CRMLayout } from './crm/pages/CRMLayout';
import { CRMDashboard } from './crm/pages/CRMDashboard';
import { CasesPage } from './crm/pages/CasesPage';
import { CaseDetailPage } from './crm/pages/CaseDetailPage';
import { TasksPage } from './crm/pages/TasksPage';
import { AnalyticsPage } from './crm/pages/AnalyticsPage';
import { CRMSettingsPage } from './crm/pages/CRMSettingsPage';
import { NotificationsPage } from './crm/pages/NotificationsPage';

export const router = createBrowserRouter([
  // Public website routes
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'free-zone', Component: FreeZone },
      { path: 'our-services', Component: OurServices },
      { path: 'india-services', Component: IndiaServices },
      { path: 'leadform', Component: LeadForm },
      { path: 'contact', Component: Contact },
      { path: 'about', Component: About },
      { path: '*', Component: NotFound },
    ],
  },

  // Admin portal routes (unchanged)
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminRedirect },
      { path: 'dashboard', Component: AdminDashboard },
      { path: 'inquiries', Component: AdminInquiries },
      { path: 'services', Component: AdminServicesPage },
      { path: 'users', Component: AdminUsersPage },
      { path: 'settings', Component: AdminSettingsPage },
    ],
  },

  // CRM routes — separate from admin
  {
    path: '/crm',
    Component: CRMLayout,
    children: [
      { index: true, Component: CRMDashboard },
      { path: 'dashboard', Component: CRMDashboard },
      { path: 'cases', Component: CasesPage },
      { path: 'cases/:id', Component: CaseDetailPage },
      { path: 'tasks', Component: TasksPage },
      { path: 'analytics', Component: AnalyticsPage },
      { path: 'settings', Component: CRMSettingsPage },
      { path: 'notifications', Component: NotificationsPage },
    ],
  },
]);
