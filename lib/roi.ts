/**
 * Server-side ROI helpers
 * Use only in Server Components or API Routes
 */

// Server-side: use localhost to call own API routes (bypasses Vercel auth)
// Client-side: use relative URLs
const BASE_URL = typeof window === 'undefined' 
  ? 'http://localhost:3000'
  : '';

export interface PolicySummary {
  policy_id: string;
  alerts: number;
  loss_prevented: number;
}

export interface PolicyTrend {
  day: string;
  alert_count: number;
  loss_prevented_est_sum: number;
}

export interface TopUnit {
  unit_id: string;
  alerts_7d: number;
  loss_prevented_7d: number;
}

/**
 * Fetch ROI summary for all policies or a specific policy
 */
export async function fetchSummary(options?: {
  from?: string;
  to?: string;
  policyId?: string;
}): Promise<{ data: PolicySummary[] }> {
  const params = new URLSearchParams();
  if (options?.from) params.set('from', options.from);
  if (options?.to) params.set('to', options.to);
  if (options?.policyId) params.set('policy_id', options.policyId);

  const url = `${BASE_URL}/api/roi/summary?${params}`;
  const res = await fetch(url, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch summary: ${res.statusText}`);
  }
  
  return res.json();
}

/**
 * Fetch 30-day trends for a specific policy
 */
export async function fetchTrends(policyId: string): Promise<{ data: PolicyTrend[] }> {
  const url = `${BASE_URL}/api/roi/policy/${policyId}/trends`;
  const res = await fetch(url, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch trends: ${res.statusText}`);
  }
  
  return res.json();
}

/**
 * Fetch top units for a specific policy
 */
export async function fetchTopUnits(policyId: string): Promise<{ data: TopUnit[] }> {
  const url = `${BASE_URL}/api/roi/policy/${policyId}/top-units`;
  const res = await fetch(url, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch top units: ${res.statusText}`);
  }
  
  return res.json();
}

/**
 * Format number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}


