import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. '
    + 'Admin/CRM features will not work. Set these in Netlify → Site settings → Environment variables.',
  );
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder-key',
  {
    auth: {
      // Persist session only for the current tab (clears when tab/browser closes)
      // but survives page refreshes.
      storage: window.sessionStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  },
);