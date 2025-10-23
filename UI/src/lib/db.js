// @ts-nocheck
import pkg from 'pg';
const { Pool } = pkg;

// Reuse one pool across invocations (serverless-safe)
global._novaPool = global._novaPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  }
});

export async function query(text, params) {
  return global._novaPool.query(text, params);
}
