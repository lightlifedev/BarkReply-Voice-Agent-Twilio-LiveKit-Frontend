import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. Admin data will not load.');
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
