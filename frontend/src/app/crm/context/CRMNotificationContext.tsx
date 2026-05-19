import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/analyticsService';
import type { CRMNotification } from '../services/analyticsService';
import { supabase } from '../../../lib/supabase';

interface NotificationContextType {
  notifications: CRMNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  refresh: () => {},
  markRead: () => {},
  markAllRead: () => {},
});

export function CRMNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<CRMNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Subscribe to real-time notification inserts
    const channel = supabase
      .channel('crm_notifications_rt')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'crm_notifications',
      }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const markRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllRead = async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId) await markAllNotificationsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      loading,
      refresh: load,
      markRead,
      markAllRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useCRMNotifications() {
  return useContext(NotificationContext);
}
