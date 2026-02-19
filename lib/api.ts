/**
 * PicSea API client — thin wrapper over fetch
 * Auth token loaded from localStorage (set by AuthProvider)
 */

import { Job } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.picsea.app';
const TOKEN_KEY = 'picsea_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function safeJson(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(res.ok ? 'Unexpected response' : `Server error (${res.status})`);
  }
  return res.json();
}

// ============================================================================
// JOBS
// ============================================================================

/** Fetch all jobs for the authenticated user */
export async function apiFetchJobs(): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/api/jobs`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch jobs (${res.status})`);
  const data = await safeJson(res);
  return data.jobs || [];
}

/** Upsert an array of localStorage jobs to the server */
export async function apiBulkSync(jobs: Job[]): Promise<{ synced: number; results: { clientId: string; serverId: string }[] }> {
  // Sanitize photos out (data URLs are too large to sync)
  const sanitized = jobs.map((j) => ({
    ...j,
    photos: j.photos.map((p) => ({ ...p, file: '' })), // strip data URLs
  }));

  const res = await fetch(`${API_BASE}/api/jobs/bulk-sync`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ jobs: sanitized }),
  });

  if (!res.ok) {
    const data = await safeJson(res).catch(() => ({}));
    throw new Error(data.error || `Sync failed (${res.status})`);
  }
  return safeJson(res);
}

/** Fetch CSV export for a server job (by server UUID) */
export async function apiFetchBOMExport(serverId: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/jobs/${serverId}/export`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  return res.blob();
}

/** Generate a CSV blob from a BOM in localStorage format */
export function generateLocalBOMCsv(job: Job): Blob {
  const lines: string[] = [];
  lines.push('Part Number,Manufacturer,Part Name,Quantity,Unit Price,Total,In Stock,Supplier,Supplier SKU');

  for (const item of job.bom) {
    const bestListing = item.listings?.filter((l) => l.in_stock)?.[0] || item.listings?.[0];
    const unitPrice = bestListing?.price_cents != null
      ? (bestListing.price_cents / 100).toFixed(2)
      : '';
    const total = bestListing?.price_cents != null
      ? ((bestListing.price_cents * item.quantity) / 100).toFixed(2)
      : '';

    const esc = (v: string | number) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };

    lines.push([
      esc(item.mpn),
      esc(item.manufacturer),
      esc(item.name),
      esc(item.quantity),
      esc(unitPrice),
      esc(total),
      esc(bestListing?.in_stock ? 'Yes' : 'No'),
      esc(bestListing?.supplier || ''),
      esc(bestListing?.sku || ''),
    ].join(','));
  }

  return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
}

/** Trigger a browser download from a Blob */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
