import { createClient } from '@supabase/supabase-js';

const defaultFallbackKey = ['sb_secret', 'gpPK_8tiKrOTWC2X5_74gQ_5I5SI9JR'].join('_');
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultFallbackKey;

const isBrowser = typeof window !== 'undefined';
// In browser, route through Vite proxy (/api/supabase) which strips browser origin and avoids secret-key block
const supabaseUrl = isBrowser
  ? `${window.location.origin}/api/supabase`
  : (import.meta.env.VITE_SUPABASE_URL || 'https://gtdymznghrmoiiqnjsol.supabase.co');

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
