import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { signOutAdmin } from '../services/authService';

const NAVY = '#0A1628';
const GOLD = '#C9963C';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Inquiries', icon: Inbox, path: '/admin/inquiries' },
  { label: 'Services', icon: Briefcase, path: '/admin/services' },
  { label: 'Admin Users', icon: Users, path: '/admin/users' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <aside
      className="admin-sidebar"
      data-collapsed={collapsed}
      style={{
        width: collapsed ? '72px' : '260px',
        backgroundColor: NAVY,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Logo Area */}
      <div className="admin-sidebar__header">
        <div className="admin-sidebar__logo">
          <div
            className="admin-sidebar__logo-icon"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #E8B85E)` }}
          >
            <span style={{ color: NAVY, fontWeight: 800, fontSize: '14px' }}>DN</span>
          </div>
          {!collapsed && (
            <div className="admin-sidebar__logo-text">
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px' }}>
                DNex
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 500 }}>
                Admin Portal
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="admin-sidebar__toggle"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar__nav">
        <div className="admin-sidebar__nav-group">
          {!collapsed && (
            <span className="admin-sidebar__nav-label">MAIN MENU</span>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && (
                <NavLink to={item.path}>
                  {({ isActive }) =>
                    isActive ? (
                      <div
                        className="admin-sidebar__active-indicator"
                        style={{ background: GOLD }}
                      />
                    ) : null
                  }
                </NavLink>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="admin-sidebar__footer">
        <button
          onClick={handleLogout}
          className="admin-sidebar__link admin-sidebar__link--logout"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
