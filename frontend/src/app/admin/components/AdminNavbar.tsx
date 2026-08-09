import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { signOutAdmin } from '../services/authService';

const GOLD = '#C9963C';

interface AdminNavbarProps {
  title: string;
  subtitle?: string;
}

export function AdminNavbar({ title, subtitle }: AdminNavbarProps) {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="admin-navbar">
      <div className="admin-navbar__left">
        <div>
          <h1 className="admin-navbar__title">{title}</h1>
          {subtitle && <p className="admin-navbar__subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="admin-navbar__right">
        <div className="admin-navbar__search">
          <Search size={16} className="admin-navbar__search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="admin-navbar__search-input"
          />
        </div>

        <button className="admin-navbar__notification-btn" title="Notifications">
          <Bell size={18} />
          <span className="admin-navbar__notification-dot" style={{ background: GOLD }} />
        </button>

        <div className="admin-navbar__profile" ref={dropdownRef}>
          <button
            className="admin-navbar__profile-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div
              className="admin-navbar__avatar"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #E8B85E)` }}
            >
              <span style={{ color: '#0A1628', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="admin-navbar__user-info">
              <span className="admin-navbar__user-name">{user?.name || 'Admin'}</span>
              <span className="admin-navbar__user-email">{user?.email ?? 'admin'}</span>
            </div>
            <ChevronDown size={14} style={{ color: '#94a3b8', marginLeft: '4px' }} />
          </button>

          {showDropdown && (
            <div className="admin-navbar__dropdown">
              <button className="admin-navbar__dropdown-item" onClick={() => { setShowDropdown(false); navigate('/admin/settings'); }}>
                Settings
              </button>
              <button className="admin-navbar__dropdown-item admin-navbar__dropdown-item--danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
