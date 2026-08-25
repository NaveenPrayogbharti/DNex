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
  BarChart3,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { signOutAdmin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import logo from '@/assets/images/crm_ogo.png';

const NAVY = '#0A1628';
const GOLD = '#C9963C';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Inquiries',   icon: Inbox,            path: '/admin/inquiries' },
  { label: 'Services',    icon: Briefcase,        path: '/admin/services' },
  { label: 'Content',     icon: FileText,         path: '/admin/content' },
  { label: 'Admin Users', icon: Users,            path: '/admin/users' },
  { label: 'Settings',    icon: Settings,         path: '/admin/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'support';

  const filteredNavItems = navItems.filter(item => {
    if (role === 'superadmin') return true;
    if (role === 'content') return ['Dashboard', 'Services', 'Content'].includes(item.label);
    if (role === 'support') return ['Dashboard', 'Inquiries'].includes(item.label);
    return false;
  });

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
          {collapsed ? (
            <img src={logo} alt="DNEX" style={{ height: '34px', width: '34px', objectFit: 'contain', borderRadius: 6 }} />
          ) : (
            <img src={logo} alt="DNEX Admin" style={{ height: '40px', width: 'auto', objectFit: 'contain', maxWidth: '160px' }} />
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
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && (
                <NavLink to={item.path}>
                  {({ isActive }: { isActive: boolean }) =>
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

      {/* CRM Portal Link (Hidden for Content team) */}
      {(role === 'superadmin' || role === 'support') && (
        <div style={{ padding: '0 8px 8px' }}>
          {!collapsed && (
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.25)', padding: '8px 8px 4px' }}>CRM SUITE</div>
          )}
          <NavLink
            to="/crm/dashboard"
            className={({ isActive }: { isActive: boolean }) =>
              `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
            }
            title={collapsed ? 'CRM Portal' : undefined}
            style={{ background: 'rgba(201,150,60,0.08)', border: '1px solid rgba(201,150,60,0.2)', borderRadius: '8px' }}
          >
            <BarChart3 size={20} style={{ color: GOLD }} />
            {!collapsed && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                CRM Portal
                <ExternalLink size={12} style={{ color: 'rgba(201,150,60,0.6)', marginLeft: 'auto' }} />
              </span>
            )}
          </NavLink>
        </div>
      )}

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
