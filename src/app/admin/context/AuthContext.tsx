import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChange, getCurrentUser, type AdminUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';

const MOCK_AUTH_ENABLED = import.meta.env.VITE_MOCK_AUTH === 'true';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (MOCK_AUTH_ENABLED) {
      // Mock mode: use listeners
      const { data: { subscription } } = onAuthStateChange((u) => {
        setUser(u);
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    }

    let settled = false;

    // Safety timeout — never leave users stuck on loading screen
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    }, 3000);

    // Real Supabase auth: verify session on mount first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
      }
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch(() => {
      settled = true;
      clearTimeout(timeout);
      setUser(null);
      setLoading(false);
    });

    // Then listen for changes (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
      } else {
        setUser(null);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
