import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { onAuthStateChange, type AdminUser } from '../services/authService';
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
  // Track whether the initial session check has completed
  const initializedRef = useRef(false);

  useEffect(() => {
    if (MOCK_AUTH_ENABLED) {
      const { data: { subscription } } = onAuthStateChange((u) => {
        setUser(u);
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    }

    // Safety timeout — never leave users stuck on loading screen
    const timeout = setTimeout(() => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        setLoading(false);
      }
    }, 5000);

    // Step 1: Check existing session first (synchronous-ish)
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Mark as initialized BEFORE setting state so the listener below
      // won't double-fire a conflicting update
      initializedRef.current = true;
      clearTimeout(timeout);

      if (session?.user) {
        supabase.from('admin_users').select('role, name').eq('id', session.user.id).single()
          .then(({ data, error }) => {
            if (error || !data) {
              setUser({ 
                id: session.user.id, 
                email: session.user.email ?? '', 
                role: session.user.email === 'admin@dnex.ae' ? 'superadmin' : 'support',
                name: session.user.email === 'admin@dnex.ae' ? 'Admin' : undefined
              });
            } else {
              setUser({ 
                id: session.user.id, 
                email: session.user.email ?? '', 
                role: session.user.email === 'admin@dnex.ae' ? 'superadmin' : (data?.role as any || 'support'),
                name: (session.user.email === 'admin@dnex.ae' && !data?.name) ? 'Admin' : data?.name
              });
            }
            setLoading(false);
          });
      } else {
        setUser(null);
        setLoading(false);
      }
    }).catch(() => {
      initializedRef.current = true;
      clearTimeout(timeout);
      setUser(null);
      setLoading(false);
    });

    // Step 2: Listen for future auth changes (login, logout, token refresh)
    // Only act on events AFTER the initial session check completes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore the INITIAL_SESSION event — we handle that in getSession() above.
      // Only react to real changes: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED etc.
      if (event === 'INITIAL_SESSION') return;

      if (session?.user) {
        supabase.from('admin_users').select('role, name').eq('id', session.user.id).single()
          .then(({ data, error }) => {
            if (error || !data) {
              setUser({ 
                id: session.user.id, 
                email: session.user.email ?? '', 
                role: session.user.email === 'admin@dnex.ae' ? 'superadmin' : 'support',
                name: session.user.email === 'admin@dnex.ae' ? 'Admin' : undefined
              });
            } else {
              setUser({ 
                id: session.user.id, 
                email: session.user.email ?? '', 
                role: session.user.email === 'admin@dnex.ae' ? 'superadmin' : (data?.role as any || 'support'),
                name: (session.user.email === 'admin@dnex.ae' && !data?.name) ? 'Admin' : data?.name
              });
            }
            if (!initializedRef.current) {
              initializedRef.current = true;
              clearTimeout(timeout);
              setLoading(false);
            }
          });
        return; // wait for role fetch to finish loading state
      } else {
        setUser(null);
      }

      // If for any reason loading is still true, clear it now
      if (!initializedRef.current) {
        initializedRef.current = true;
        clearTimeout(timeout);
        setLoading(false);
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
