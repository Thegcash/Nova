import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using Service Role (RLS bypass for backend jobs)
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
  global: { headers: { 'X-Client-Info': 'nova-api' } }
});
