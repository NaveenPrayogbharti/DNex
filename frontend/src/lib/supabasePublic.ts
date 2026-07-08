import { createClient } from '@supabase/supabase-js';

/**
 * Public Supabase client — for unauthenticated operations only.
 * Used by the public lead capture form so it sends a clean anonymous
 * request without any auth token from sessionStorage interfering.
 *
 * DO NOT use this client inside the Admin or CRM portals.
 * Use the shared `supabase` client from `./supabase.ts` there.
 */
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL     ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabasePublic] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. '
    + 'Lead-capture form will not work. Set these in Netlify → Site settings → Environment variables.',
  );
}

export const supabasePublic = createClient(
  supabaseUrl     || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,   // Never store any session
      autoRefreshToken: false, // No token refresh needed
      detectSessionInUrl: false,
    },
  },
);
