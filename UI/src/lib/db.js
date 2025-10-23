// @ts-nocheck
import pkg from 'pg';
const { Pool } = pkg;

// Reuse one pool across invocations (serverless safe)
global._novaPool = global._novaPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL; rejectUnauthorized=false avoids cert chain issues on serverless
  ssl: { rejectUnauthorized: false }
});

export async function query(text, params) {
  return global._novaPool.query(text, params);
}