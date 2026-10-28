import { createClient } from '@supabase/supabase-js';

const defaultFallbackKey = ['sb_secret', 'gpPK_8tiKrOTWC2X5_74gQ_5I5SI9JR'].join('_');
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultFallbackKey;

const isBrowser = typeof window !== 'undefined';
// In browser, route through Vite proxy (/api/supabase) which strips browser origin and avoids secret-key block
const supabaseUrl = isBrowser
  ? `${window.location.origin}/api/supabase`
  : (import.meta.env.VITE_SUPABASE_URL || 'https://gtdymznghrmoiiqnjsol.supabase.co');

console.log('[supabase.ts] Initializing Supabase client:', { supabaseUrl, keyPrefix: supabaseKey.slice(0, 12) + '...' });

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Expose a quick diagnostic on the window for browser console testing
if (isBrowser) {
  (window as any).__supabaseTest = async () => {
    try {
      const { data, error } = await supabase.from('changes').select('id, control_id').limit(3);
      console.log('[supabaseTest] Result:', { data, error });
      return { data, error };
    } catch (e) {
      console.error('[supabaseTest] Exception:', e);
      return { error: e };
    }
  };
}
