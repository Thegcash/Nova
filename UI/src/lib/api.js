// @ts-nocheck
export const MOCKS_ENABLED = process.env.NODE_ENV !== 'production';

export async function apiGET(path) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = `${base}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

// Production-ready helper - no mocks in production
export async function maybeLive(path, fallbackData, useLive) {
  // In production, always use live data - no fallbacks
  if (!MOCKS_ENABLED) {
    return await apiGET(path);
  }
  
  // Development: use live data if requested, otherwise fallback
  if (useLive) {
    try {
      return await apiGET(path);
    } catch (e) {
      console.error('Live fetch failed, falling back to mocks:', e?.message);
      return fallbackData;
    }
  }
  
  return fallbackData;
}
