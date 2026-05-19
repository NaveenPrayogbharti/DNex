import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Persist session in localStorage so refreshes don't log the user out
    persistSession: true,
    // Auto refresh the JWT token before it expires
    autoRefreshToken: true,
    // Detect session from URL hash after OAuth redirects
    detectSessionInUrl: true,
    // Use localStorage (default) — pkce is most secure
    flowType: 'pkce',
  },
});