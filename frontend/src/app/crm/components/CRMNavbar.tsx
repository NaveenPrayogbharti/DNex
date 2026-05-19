import { useState, useRef, useEffect } from 'react';
import { Bell, Plus, Search } from 'lucide-react';
import { useCRMNotifications } from '../context/CRMNotificationContext';
import { useNavigate } from 'react-router';

const GOLD = '#C9963C';

interface CRMNavbarProps {
  title: string;
  subtitle?: string;
  onNewCase?: () => void;
}

export function CRMNavbar({ title, subtitle, onNewCase }: CRMNavbarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useCRMNotifications();
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="crm-navbar">
      <div className="crm-navbar__titles">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="crm-navbar__actions">
        {onNewCase && (
          <button className="crm-btn crm-btn--primary" onClick={onNewCase}>
            <Plus size={16} /> New Case
          </button>
        )}

        <button
          className="crm-navbar__btn crm-navbar__btn--ghost"
          onClick={() => navigate('/crm/cases')}
          style={{ padding: '8px 12px' }}
          title="Search"
        >
          <Search size={16} />
        </button>

        {/* Notification button */}
        <div style={{ position: 'relative' }} ref={panelRef}>
          <button
            className="crm-notif-btn"
            onClick={() => setShowNotif(v => !v)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="crm-notif-dot" />}
          </button>

          {showNotif && (
            <div className="crm-notif-panel">
              <div className="crm-notif-panel__header">
                <h4>Notifications {unreadCount > 0 && `(${unreadCount})`}</h4>
                {unreadCount > 0 && (
                  <button
                    style={{ background: 'none', border: 'none', color: GOLD, fontSize: '12px', cursor: 'pointer' }}
                    onClick={markAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--crm-muted)', fontSize: '13px' }}>
                    No notifications
                  </div>
                ) : notifications.slice(0, 20).map(n => (
                  <div
                    key={n.id}
                    className={`crm-notif-item ${!n.read ? 'crm-notif-item--unread' : ''}`}
                    onClick={() => { markRead(n.id); setShowNotif(false); }}
                  >
                    <div className="crm-notif-item__title">{n.title}</div>
                    {n.message && <div className="crm-notif-item__msg">{n.message}</div>}
                    <div className="crm-notif-item__time">{formatTime(n.created_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
