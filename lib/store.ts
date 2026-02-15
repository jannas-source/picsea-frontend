import { Job, BOMItem, JobPhoto, IdentifiedPart, Installation, UserPreferences, JobTemplate } from './types';

const STORAGE_KEY = 'picsea_jobs';
const PREFS_KEY = 'picsea_prefs';
const TEMPLATES_KEY = 'picsea_templates';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ============================================================================
// JOBS
// ============================================================================

export function loadJobs(): Job[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const jobs = raw ? JSON.parse(raw) : [];
    // Migrate old jobs that lack new fields
    return jobs.map((j: any) => ({
      ...j,
      priority: j.priority || 'normal',
      installations: j.installations || [],
      lessonsLearned: j.lessonsLearned || '',
      bom: (j.bom || []).map((b: any) => ({
        ...b,
        status: b.status || 'pending',
        warnings: b.warnings || [],
      })),
    }));
  } catch { return []; }
}

export function saveJobs(jobs: Job[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function createJob(name: string, vessel: string, client: string, template?: JobTemplate): Job {
  const now = new Date().toISOString();
  const job: Job = {
    id: generateId(),
    name,
    vessel,
    client,
    status: 'active',
    priority: 'normal',
    templateId: template?.id,
    createdAt: now,
    updatedAt: now,
    photos: [],
    bom: [],
    installations: [],
    notes: '',
    lessonsLearned: '',
    estimatedHours: template?.avgActualHours || template?.estimatedHours,
    estimatedCostCents: template?.avgActualCostCents || template?.estimatedCostCents,
  };

  // Pre-populate BOM from template
  if (template?.defaultParts) {
    job.bom = template.defaultParts.map(p => ({
      id: generateId(),
      partId: '',
      manufacturer: p.manufacturer,
      mpn: p.mpn,
      name: p.name,
      quantity: p.quantity,
      notes: p.notes || '',
      confirmed: false,
      status: 'pending',
      warnings: [],
    }));
  }

  return job;
}

export function createPhoto(file: string, filename: string, photoType: JobPhoto['photoType'] = 'identification'): JobPhoto {
  return {
    id: generateId(),
    file,
    filename,
    uploadedAt: new Date().toISOString(),
    status: 'pending',
    identifiedParts: [],
    notes: '',
    photoType,
  };
}

export function partToBOMItem(part: IdentifiedPart, photoId?: string): BOMItem {
  return {
    id: generateId(),
    partId: part.id,
    manufacturer: part.manufacturer,
    mpn: part.mpn,
    name: part.name,
    quantity: 1,
    notes: '',
    category_name: part.category_name,
    listings: part.listings,
    photoId,
    confirmed: false,
    status: 'pending',
    confidence: part.confidence,
    intelligence: part.intelligence,
    ordering_options: part.ordering_options,
    warnings: [],
  };
}

// ============================================================================
// JOB PROGRESS CALCULATION
// ============================================================================

export function calculateJobProgress(job: Job): number {
  if (job.bom.length === 0) return 0;
  const weights: Record<string, number> = {
    pending: 0, ordered: 25, received: 50, installed: 75, verified: 100, failed: 0,
  };
  const total = job.bom.reduce((sum, item) => sum + (weights[item.status] || 0), 0);
  return Math.round(total / job.bom.length);
}

// ============================================================================
// TEMPLATES (local storage for now, will sync to server)
// ============================================================================

export function loadTemplates(): JobTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : getDefaultTemplates();
  } catch { return getDefaultTemplates(); }
}

export function saveTemplates(templates: JobTemplate[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function createTemplateFromJob(job: Job, name: string): JobTemplate {
  return {
    id: generateId(),
    name,
    description: `Created from job: ${job.name}`,
    defaultParts: job.bom.map(b => ({
      manufacturer: b.manufacturer,
      mpn: b.mpn,
      name: b.name,
      quantity: b.quantity,
      notes: b.notes,
    })),
    estimatedHours: job.actualHours || job.estimatedHours,
    estimatedCostCents: job.actualCostCents || job.estimatedCostCents,
    timesUsed: 0,
  };
}

function getDefaultTemplates(): JobTemplate[] {
  return [
    {
      id: 'tmpl_impeller',
      name: 'Raw Water Impeller Replacement',
      description: 'Standard impeller service including gasket and lubricant',
      systemPath: 'engine.cooling',
      defaultParts: [
        { manufacturer: 'Jabsco', mpn: '1210-0001', name: 'Raw Water Impeller', quantity: 1 },
        { manufacturer: 'Jabsco', mpn: '18753-0001', name: 'End Cover Gasket', quantity: 1 },
        { manufacturer: 'Jabsco', mpn: '43990-0050', name: 'Impeller Lubricant', quantity: 1 },
      ],
      estimatedHours: 1.5,
      timesUsed: 0,
    },
    {
      id: 'tmpl_zincs',
      name: 'Zinc Anode Replacement',
      description: 'Replace all hull and shaft zincs',
      systemPath: 'hull.protection',
      defaultParts: [
        { manufacturer: 'Martyr', mpn: 'CMEZ1', name: 'Engine Zinc Anode', quantity: 2 },
        { manufacturer: 'Martyr', mpn: 'CMX06', name: 'Shaft Zinc Anode', quantity: 1 },
      ],
      estimatedHours: 2.0,
      timesUsed: 0,
    },
    {
      id: 'tmpl_oil_change',
      name: 'Engine Oil & Filter Change',
      description: 'Standard engine oil service',
      systemPath: 'engine.lubrication',
      defaultParts: [
        { manufacturer: 'Yanmar', mpn: '119305-35151', name: 'Oil Filter', quantity: 1 },
        { manufacturer: 'Shell', mpn: 'ROTELLA-T6-5W40', name: 'Diesel Engine Oil 5W-40 (gallon)', quantity: 2 },
      ],
      estimatedHours: 1.0,
      timesUsed: 0,
    },
    {
      id: 'tmpl_electrical_panel',
      name: 'Electrical Panel Upgrade',
      description: 'Full panel replacement with breakers and wiring',
      systemPath: 'electrical.distribution',
      defaultParts: [
        { manufacturer: 'Blue Sea', mpn: '8064', name: 'DC Panel 12-Position', quantity: 1 },
        { manufacturer: 'Blue Sea', mpn: '7507', name: '5A Circuit Breaker', quantity: 6 },
        { manufacturer: 'Blue Sea', mpn: '7510', name: '15A Circuit Breaker', quantity: 4 },
        { manufacturer: 'Blue Sea', mpn: '7512', name: '25A Circuit Breaker', quantity: 2 },
        { manufacturer: 'Ancor', mpn: '108210', name: '10 AWG Marine Wire Red (100ft)', quantity: 1 },
        { manufacturer: 'Ancor', mpn: '108010', name: '10 AWG Marine Wire Black (100ft)', quantity: 1 },
        { manufacturer: 'Ancor', mpn: '309199', name: 'Ring Terminal Kit', quantity: 1 },
      ],
      estimatedHours: 8.0,
      timesUsed: 0,
    },
  ];
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return defaultPrefs();
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultPrefs(), ...JSON.parse(raw) } : defaultPrefs();
  } catch { return defaultPrefs(); }
}

export function savePreferences(prefs: UserPreferences) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function defaultPrefs(): UserPreferences {
  return {
    expertiseLevel: 'professional',
    showInstallVideos: false,
    showTorqueSpecs: true,
    detailLevel: 'standard',
    batchOrdering: true,
  };
}

// ============================================================================
// API CALLS (identify & search)
// ============================================================================

export async function identifyPhoto(dataUrl: string, vesselContext?: any): Promise<{ parts: IdentifiedPart[]; notes?: string; systemContext?: string; jobRecommendation?: string }> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const formData = new FormData();
  formData.append('image', blob, 'photo.jpg');
  if (vesselContext) {
    formData.append('vessel_context', JSON.stringify(vesselContext));
  }

  const apiRes = await fetch('https://api.picsea.app/api/identify', {
    method: 'POST',
    body: formData,
  });
  const data = await apiRes.json();
  if (!apiRes.ok) throw new Error(data.error || 'Identification failed');
  
  // Map API response parts to include intelligence
  const parts = (data.parts || []).map((p: any) => ({
    ...p,
    intelligence: p.intelligence || {
      context: data.analysis?.parts?.find((ap: any) => ap.model_number === p.mpn || ap.manufacturer === p.manufacturer)?.context,
      sourcing: data.analysis?.parts?.find((ap: any) => ap.model_number === p.mpn || ap.manufacturer === p.manufacturer)?.sourcing,
      confidence_reasoning: data.analysis?.parts?.find((ap: any) => ap.model_number === p.mpn || ap.manufacturer === p.manufacturer)?.confidence_reasoning,
      system_context: data.analysis?.system_context,
      job_recommendation: data.analysis?.job_recommendation,
    }
  }));
  
  return { 
    parts, 
    notes: data.analysis?.notes,
    systemContext: data.analysis?.system_context,
    jobRecommendation: data.analysis?.job_recommendation,
  };
}

export async function searchParts(query: string): Promise<IdentifiedPart[]> {
  const res = await fetch(`https://api.picsea.app/api/parts/search?q=${encodeURIComponent(query)}&limit=10`);
  const data = await res.json();
  return data.parts || [];
}
