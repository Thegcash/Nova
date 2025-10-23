// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

export function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE');
  }
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { 'x-nova-role': 'server' } },
  });
}

