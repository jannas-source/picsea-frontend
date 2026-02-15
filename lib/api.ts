// ============================================================================
// API CLIENT - Server-side operations
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.picsea.app';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ============================================================================
// VALIDATION
// ============================================================================

export async function validatePreOrder(partId: string, vesselId: string) {
  return apiFetch('/api/validations/pre-order', {
    method: 'POST',
    body: JSON.stringify({ part_id: partId, vessel_id: vesselId }),
  });
}

export async function validateBOM(items: { id: string; part_id: string }[], vesselId: string) {
  return apiFetch('/api/validations/pre-order', {
    method: 'POST',
    body: JSON.stringify({ items, vessel_id: vesselId }),
  });
}

export async function recordInstallation(data: {
  job_item_id: string;
  vessel_id: string;
  part_id?: string;
  hours_taken?: number;
  outcome?: string;
  outcome_notes?: string;
  location_notes?: string;
}) {
  return apiFetch('/api/validations/installation', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyInstallation(installationId: string, data: {
  outcome: string;
  outcome_notes?: string;
}) {
  return apiFetch(`/api/validations/installation/${installationId}/verify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function submitFeedback(data: {
  part_id?: string;
  vessel_id?: string;
  event_type: string;
  description: string;
  severity?: string;
  supplier?: string;
  supplier_rating?: number;
}) {
  return apiFetch('/api/validations/feedback', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getDashboardStats(orgId: string) {
  return apiFetch(`/api/analytics/dashboard?org_id=${orgId}`);
}

export async function getJobPerformance(orgId: string) {
  return apiFetch(`/api/analytics/job-performance?org_id=${orgId}`);
}

export async function getPartInsights(partId: string) {
  return apiFetch(`/api/analytics/part-insights/${partId}`);
}

export async function getFailurePatterns(orgId: string) {
  return apiFetch(`/api/analytics/failure-patterns?org_id=${orgId}`);
}

// ============================================================================
// TEMPLATES
// ============================================================================

export async function listTemplates(orgId: string) {
  return apiFetch(`/api/templates?org_id=${orgId}`);
}

export async function createTemplate(data: {
  org_id: string;
  name: string;
  description?: string;
  from_job_id?: string;
  default_parts?: any[];
  estimated_hours?: number;
}) {
  return apiFetch('/api/templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================================================
// MAINTENANCE
// ============================================================================

export async function getMaintenanceSchedules(params: { vessel_id?: string; org_id?: string }) {
  const qs = new URLSearchParams(params as any).toString();
  return apiFetch(`/api/maintenance?${qs}`);
}

export async function createMaintenanceSchedule(data: {
  vessel_id: string;
  part_id?: string;
  description: string;
  interval_months?: number;
  last_performed_at?: string;
}) {
  return apiFetch('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function markMaintenancePerformed(scheduleId: string) {
  return apiFetch(`/api/maintenance/${scheduleId}/performed`, { method: 'POST' });
}

export async function autoDetectSchedules(vesselId: string) {
  return apiFetch('/api/maintenance/auto-detect', {
    method: 'POST',
    body: JSON.stringify({ vessel_id: vesselId }),
  });
}
