import { lazy, Suspense } from 'react';
import { createBrowserRouter, redirect } from 'react-router';

// ─── Build-time flag ──────────────────────────────────────────────────────────
const PUBLIC_ONLY = false; // Permanently enabled for CRM and Admin access

// ─── Spinner shown while lazy chunks load ─────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid #C9963C',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function wrap(Component: React.ComponentType<any>) {
  return function Wrapped(props: any) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// ─── Public pages — always lazy-loaded for code splitting ─────────────────────
const Root          = wrap(lazy(() => import('./pages/Root').then(m => ({ default: m.Root }))));
const Home          = wrap(lazy(() => import('./pages/Home').then(m => ({ default: m.Home }))));
const FreeZone      = wrap(lazy(() => import('./pages/FreeZone').then(m => ({ default: m.FreeZone }))));
const NotFound      = wrap(lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound }))));
const LeadForm      = wrap(lazy(() => import('./components/home/LeadForm').then(m => ({ default: m.LeadForm }))));
const Contact       = wrap(lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact }))));
const About         = wrap(lazy(() => import('./pages/About').then(m => ({ default: m.About }))));
const OurServices   = wrap(lazy(() => import('./pages/OurServices').then(m => ({ default: m.OurServices }))));
const IndiaServices = wrap(lazy(() => import('./pages/IndiaServices').then(m => ({ default: m.IndiaServices }))));
const ClientPayment = wrap(lazy(() => import('./pages/ClientPayment').then(m => ({ default: m.ClientPayment }))));
const ClientUploadPortal = wrap(lazy(() => import('./pages/ClientUploadPortal').then(m => ({ default: m.ClientUploadPortal }))));
const PrivacyPolicy = wrap(lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy }))));

const publicRoutes = [
  {
    path: '/',
    Component: Root,
    children: [
      { index: true,            Component: Home },
      { path: 'free-zone',      Component: FreeZone },
      { path: 'our-services',   Component: OurServices },
      { path: 'india-services', Component: IndiaServices },
      { path: 'leadform',       Component: LeadForm },
      { path: 'contact',        Component: Contact },
      { path: 'about',          Component: About },
      { path: 'pay/:id',        Component: ClientPayment },
      { path: 'client/upload/:caseId', Component: ClientUploadPortal },
      { path: 'privacy',        Component: PrivacyPolicy },
      { path: '*',              Component: NotFound },
    ],
  },
];

// ─── Admin + CRM pages — only imported when PUBLIC_ONLY is false ──────────────
// Vite will tree-shake these entire import() calls when PUBLIC_ONLY === true
// because the condition is a compile-time constant (import.meta.env.*).
const AdminLogin        = !PUBLIC_ONLY ? wrap(lazy(() => import('./admin/pages/AdminLogin').then(m => ({ default: m.AdminLogin })))) : null!;
const AdminLayout       = !PUBLIC_ONLY ? wrap(lazy(() => import('./admin/pages/AdminLayout').then(m => ({ default: m.AdminLayout })))) : null!;
const AdminDashboard    = !PUBLIC_ONLY ? wrap(lazy(() => import('./admin/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })))) : null!;
const AdminInquiries    = !PUBLIC_ONLY ? wrap(lazy(() => import('./admin/pages/AdminInquiries').then(m => ({ default: m.AdminInquiries })))) : null!;
const AdminServicesPage = !PUBLIC_ONLY ? wrap(lazy(() => import('./admin/pages/AdminServicesPage').then(m => ({ default: m.AdminServicesPage })))) : null!;
const AdminUsersPage    = !PUBLIC_ONLY ? wrap(lazy(() => import('./admin/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))) : null!;
const AdminSettingsPage = !PUBLIC_ONLY ? wrap(lazy(() => import('./admin/pages/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })))) : null!;
const AdminContentPage  = !PUBLIC_ONLY ? wrap(lazy(() => import('./admin/pages/AdminContentPage').then(m => ({ default: m.AdminContentPage })))) : null!;
const AdminRedirect     = !PUBLIC_ONLY ? wrap(lazy(() => import('./admin/pages/AdminRedirect').then(m => ({ default: m.AdminRedirect })))) : null!;
const CRMLayout         = !PUBLIC_ONLY ? wrap(lazy(() => import('./crm/pages/CRMLayout').then(m => ({ default: m.CRMLayout })))) : null!;
const CRMDashboard      = !PUBLIC_ONLY ? wrap(lazy(() => import('./crm/pages/CRMDashboard').then(m => ({ default: m.CRMDashboard })))) : null!;
const CasesPage         = !PUBLIC_ONLY ? wrap(lazy(() => import('./crm/pages/CasesPage').then(m => ({ default: m.CasesPage })))) : null!;
const CaseDetailPage    = !PUBLIC_ONLY ? wrap(lazy(() => import('./crm/pages/CaseDetailPage').then(m => ({ default: m.CaseDetailPage })))) : null!;
const TasksPage         = !PUBLIC_ONLY ? wrap(lazy(() => import('./crm/pages/TasksPage').then(m => ({ default: m.TasksPage })))) : null!;
const AnalyticsPage     = !PUBLIC_ONLY ? wrap(lazy(() => import('./crm/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))) : null!;
const CRMSettingsPage   = !PUBLIC_ONLY ? wrap(lazy(() => import('./crm/pages/CRMSettingsPage').then(m => ({ default: m.CRMSettingsPage })))) : null!;
const NotificationsPage = !PUBLIC_ONLY ? wrap(lazy(() => import('./crm/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))) : null!;

// ─── Auth middleware (only used in full router) ────────────────────────────────
async function getCurrentUser() {
  if (PUBLIC_ONLY) return null;
  const { getCurrentUser: getUser } = await import('./admin/services/authService');
  return getUser();
}

const requireAuth = async ({ request }: { request: Request }) => {
  const user = await getCurrentUser();
  if (!user) {
    const url = new URL(request.url);
    return redirect(`/admin/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return null;
};

const requireGuest = async ({ request }: { request: Request }) => {
  const user = await getCurrentUser();
  if (user) {
    const url   = new URL(request.url);
    const redirectTo = url.searchParams.get('redirect') || '';
    return redirect(redirectTo.startsWith('/crm') ? redirectTo : '/admin/dashboard');
  }
  return null;
};

// ─── Router export ─────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  ...publicRoutes,

  // Admin + CRM routes — omitted from Netlify (PUBLIC_ONLY=true) builds
  ...(PUBLIC_ONLY ? [] : [
    { path: '/admin/login', Component: AdminLogin, loader: requireGuest },
    {
      path: '/admin',
      Component: AdminLayout,
      loader: requireAuth,
      children: [
        { index: true,       Component: AdminRedirect },
        { path: 'dashboard', Component: AdminDashboard },
        { path: 'inquiries', Component: AdminInquiries },
        { path: 'services',  Component: AdminServicesPage },
        { path: 'content',   Component: AdminContentPage },
        { path: 'users',     Component: AdminUsersPage },
        { path: 'settings',  Component: AdminSettingsPage },
      ],
    },
    {
      path: '/crm',
      Component: CRMLayout,
      loader: requireAuth,
      children: [
        { index: true,          Component: CRMDashboard },
        { path: 'dashboard',    Component: CRMDashboard },
        { path: 'cases',        Component: CasesPage },
        { path: 'cases/:id',    Component: CaseDetailPage },
        { path: 'tasks',        Component: TasksPage },
        { path: 'analytics',    Component: AnalyticsPage },
        { path: 'settings',     Component: CRMSettingsPage },
        { path: 'notifications',Component: NotificationsPage },
      ],
    },
  ]),
]);
