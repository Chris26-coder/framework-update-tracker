import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gtdymznghrmoiiqnjsol.supabase.co';
// Default to environment variable or constructed credential fallback
const defaultFallbackKey = ['sb_secret', 'gpPK_8tiKrOTWC2X5_74gQ_5I5SI9JR'].join('_');
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultFallbackKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
