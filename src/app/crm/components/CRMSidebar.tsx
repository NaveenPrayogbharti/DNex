import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, FolderOpen, BarChart3,
  LogOut, ChevronLeft, ChevronRight, Zap, Bell, ArrowLeft,
} from 'lucide-react';
import { signOutAdmin } from '../../admin/services/authService';
import { useCRMNotifications } from '../context/CRMNotificationContext';

const NAVY = '#0A1628';
const GOLD = '#C9963C';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Dashboard',  icon: LayoutDashboard, path: '/crm/dashboard' },
  { label: 'Cases',      icon: FolderOpen,      path: '/crm/cases' },
  { label: 'Analytics',  icon: BarChart3,       path: '/crm/analytics' },
  { label: 'Automation', icon: Zap,             path: '/crm/settings' },
];

export function CRMSidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const { unreadCount } = useCRMNotifications();

  const handleLogout = async () => {
    try { await signOutAdmin(); navigate('/admin/login'); }
    catch (e) { console.error(e); }
  };

  return (
    <aside
      className="crm-sidebar"
      style={{ width: collapsed ? '72px' : '240px', backgroundColor: NAVY }}
    >
      <div className="crm-sidebar__header">
        <div className="crm-sidebar__logo">
          <div className="crm-sidebar__logo-icon">
            <span style={{ color: NAVY, fontWeight: 800, fontSize: '13px' }}>DN</span>
          </div>
          {!collapsed && (
            <div className="crm-sidebar__logo-text">
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>DNex CRM</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Pro Suite</span>
            </div>
          )}
        </div>
        <button className="crm-sidebar__toggle" onClick={onToggle}>
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      <nav className="crm-sidebar__nav">
        {!collapsed && <span className="crm-sidebar__nav-label">MAIN MENU</span>}
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `crm-sidebar__link ${isActive ? 'crm-sidebar__link--active' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* Notifications link */}
        <NavLink
          to="/crm/notifications"
          className={({ isActive }) =>
            `crm-sidebar__link ${isActive ? 'crm-sidebar__link--active' : ''}`
          }
          title={collapsed ? 'Notifications' : undefined}
        >
          <Bell size={18} />
          {!collapsed && <span>Notifications</span>}
          {unreadCount > 0 && (
            <span className="crm-sidebar__badge">{unreadCount}</span>
          )}
        </NavLink>
      </nav>

      <div className="crm-sidebar__footer">
        {/* Back to Admin Panel */}
        {!collapsed && <span className="crm-sidebar__nav-label">NAVIGATION</span>}
        <NavLink
          to="/admin/dashboard"
          className="crm-sidebar__link"
          title={collapsed ? 'Back to Admin' : undefined}
          style={{ color: `${GOLD}CC` }}
        >
          <ArrowLeft size={18} />
          {!collapsed && <span>Back to Admin</span>}
        </NavLink>

        {!collapsed && (
          <span className="crm-sidebar__nav-label" style={{ marginTop: '8px' }}>ACCOUNT</span>
        )}
        <button
          onClick={handleLogout}
          className="crm-sidebar__link"
          style={{ color: 'rgba(248,113,113,0.8)' }}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
