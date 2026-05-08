import { useState, useEffect } from 'react';
import { CRMNavbar } from '../components/CRMNavbar';
import { useCRMNotifications } from '../context/CRMNotificationContext';
import { Bell, Check, CheckCheck } from 'lucide-react';

const TYPE_ICONS: Record<string, string> = {
  reminder: '⏰', payment: '💰', document: '📄',
  status: '🔄', sla: '⚠️', task: '✅',
};

export function NotificationsPage() {
  const { notifications, loading, markRead, markAllRead, unreadCount } = useCRMNotifications();

  return (
    <div className="crm-page">
      <CRMNavbar title="Notifications" subtitle="All system alerts and reminders" />
      <div className="crm-page__content">
        <div className="crm-table-wrap" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700, fontSize: '16px' }}>
              <Bell size={18} color="#C9963C" /> Notifications
              {unreadCount > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '1px 8px', fontSize: '12px' }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button className="crm-btn crm-btn--ghost" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={markAllRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {loading ? <div className="crm-spinner" /> : notifications.length === 0 ? (
            <div className="crm-empty">
              <div className="crm-empty__icon">🔔</div>
              <div className="crm-empty__title">No notifications</div>
              <div className="crm-empty__sub">You're all caught up!</div>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: n.read ? 'transparent' : 'rgba(201,150,60,0.05)',
                  borderLeft: n.read ? '3px solid transparent' : '3px solid #C9963C',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>
                  {TYPE_ICONS[n.type] ?? '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.read ? 500 : 700, color: n.read ? '#94a3b8' : '#fff', fontSize: '14px' }}>
                    {n.title}
                  </div>
                  {n.message && (
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{n.message}</div>
                  )}
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                {!n.read && (
                  <button
                    className="crm-btn crm-btn--ghost"
                    style={{ padding: '4px 8px', fontSize: '11px', flexShrink: 0 }}
                    onClick={e => { e.stopPropagation(); markRead(n.id); }}
                  >
                    <Check size={12} /> Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
