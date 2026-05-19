import { supabase } from './supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  role?: string;
}

// Mock auth configuration
const MOCK_AUTH_ENABLED = import.meta.env.VITE_MOCK_AUTH === 'true';
const MOCK_ADMIN = {
  email: 'admin@dnex.com',
  password: 'Admin@123',
};

const MOCK_USER: AdminUser = {
  id: 'mock-admin-001',
  email: MOCK_ADMIN.email,
};

// Storage key for mock session
const MOCK_SESSION_KEY = 'dnex_admin_mock_session';

function getMockSession(): AdminUser | null {
  try {
    const stored = localStorage.getItem(MOCK_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setMockSession(user: AdminUser | null) {
  if (user) {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_SESSION_KEY);
  }
}

// Auth change listeners for mock mode
type AuthCallback = (user: AdminUser | null) => void;
const mockListeners: Set<AuthCallback> = new Set();

function notifyMockListeners(user: AdminUser | null) {
  mockListeners.forEach((cb) => cb(user));
}

export async function signInAdmin(email: string, password: string) {
  if (MOCK_AUTH_ENABLED) {
    // Validate against mock credentials
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      setMockSession(MOCK_USER);
      notifyMockListeners(MOCK_USER);
      return { user: MOCK_USER };
    }
    throw new Error('Invalid email or password');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutAdmin() {
  if (MOCK_AUTH_ENABLED) {
    setMockSession(null);
    notifyMockListeners(null);
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  if (MOCK_AUTH_ENABLED) {
    return getMockSession();
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export function onAuthStateChange(callback: (user: AdminUser | null) => void) {
  if (MOCK_AUTH_ENABLED) {
    // Register mock listener
    mockListeners.add(callback);

    // Fire immediately with current mock session
    const currentUser = getMockSession();
    setTimeout(() => callback(currentUser), 0);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            mockListeners.delete(callback);
          },
        },
      },
    };
  }

  return supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({ id: session.user.id, email: session.user.email ?? '' });
    } else {
      callback(null);
    }
  });
}
