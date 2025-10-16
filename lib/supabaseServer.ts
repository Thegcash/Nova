/**
 * Server-only Supabase client
 * DO NOT import this in client components - use only in Server Components and API Routes
 */

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing environment variable: SUPABASE_URL');
}

if (!process.env.SUPABASE_SERVICE_ROLE) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE');
}

/**
 * Server-side Supabase client with service role access
 * Use only in server-side code (API routes, Server Components, Server Actions)
 */
export const supabaseServer = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);


