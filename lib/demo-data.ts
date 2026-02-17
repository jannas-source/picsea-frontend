import { Job, BOMItem, JobPhoto } from './types';

/**
 * Demo data for PicSea shop demos.
 * Pre-populated jobs that showcase the full workflow.
 */

function demoId(prefix: string, n: number): string {
  return `${prefix}_demo_${n}`;
}

const FEB_17 = '2026-02-17T07:30:00.000Z';
const FEB_17_LATE = '2026-02-17T11:45:00.000Z';
const FEB_10 = '2026-02-10T08:00:00.000Z';
const FEB_10_LATE = '2026-02-10T16:30:00.000Z';
const NOW = new Date().toISOString();

// ============================================================================
// ACTIVE JOB: Black Bear — Feb 17
// ============================================================================

const blackBearPhotos: JobPhoto[] = [
  {
    id: demoId('photo', 1),
    file: '',
    filename: 'electrical_panel.jpg',
    uploadedAt: FEB_17,
    status: 'identified',
    identifiedParts: [],
    notes: 'Main DC panel — corroded bus bar, breakers failing',
    photoType: 'identification',
  },
  {
    id: demoId('photo', 2),
    file: '',
    filename: 'raw_water_pump.jpg',
    uploadedAt: FEB_17,
    status: 'identified',
    identifiedParts: [],
    notes: 'Raw water pump — impeller vanes cracked',
    photoType: 'identification',
  },
  {
    id: demoId('photo', 3),
    file: '',
    filename: 'gps_display.jpg',
    uploadedAt: FEB_17_LATE,
    status: 'identified',
    identifiedParts: [],
    notes: 'Helm GPS — screen delaminating, customer wants upgrade',
    photoType: 'identification',
  },
];

const blackBearBOM: BOMItem[] = [
  // === ELECTRICAL ===
  {
    id: demoId('bom', 1),
    partId: 'bs-8064',
    manufacturer: 'Blue Sea Systems',
    mpn: '8064',
    name: 'DC Panel 12-Position',
    quantity: 1,
    notes: 'Main cabin panel replacement',
    category_name: 'Electrical',
    listings: [
      { supplier: 'West Marine', sku: 'WM-8064', price_cents: 28999, list_price_cents: 31999, in_stock: true, stock_qty: 8 },
      { supplier: 'Defender', sku: 'DEF-8064', price_cents: 27499, list_price_cents: 31999, in_stock: true, stock_qty: 15 },
    ],
    photoId: demoId('photo', 1),
    confirmed: false,
    status: 'pending',
    confidence: 0.96,
    intelligence: {
      context: {
        installation_notes: 'Kill main breaker before removal. Label all circuits. Torque bus bar connections to spec.',
        installation_time_pro: '3–4 hours',
        installation_time_diy: '6–8 hours',
        companion_parts: ['7507 (5A breakers)', '7510 (15A breakers)', '7512 (25A breakers)', 'Ring terminals'],
        common_mistakes: 'Forgetting to label wires before disconnecting old panel',
      },
      sourcing: { estimated_price_range: '$275–$320' },
      system_context: 'Main DC electrical distribution',
    },
    warnings: [],
  },
  {
    id: demoId('bom', 2),
    partId: 'bs-7507',
    manufacturer: 'Blue Sea Systems',
    mpn: '7507',
    name: '5A Circuit Breaker',
    quantity: 6,
    notes: 'Lights and instrument circuits',
    category_name: 'Electrical',
    listings: [
      { supplier: 'West Marine', sku: 'WM-7507', price_cents: 1249, list_price_cents: 1499, in_stock: true, stock_qty: 45 },
      { supplier: 'Defender', sku: 'DEF-7507', price_cents: 1149, list_price_cents: 1499, in_stock: true, stock_qty: 60 },
    ],
    photoId: demoId('photo', 1),
    confirmed: true,
    status: 'ordered',
    confidence: 0.94,
    intelligence: {
      context: {
        installation_notes: 'Snap-in fit for Blue Sea panels. No tools required.',
        installation_time_pro: '2 min each',
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 3),
    partId: 'bs-7510',
    manufacturer: 'Blue Sea Systems',
    mpn: '7510',
    name: '15A Circuit Breaker',
    quantity: 4,
    notes: 'Pumps and accessories',
    category_name: 'Electrical',
    listings: [
      { supplier: 'West Marine', sku: 'WM-7510', price_cents: 1349, list_price_cents: 1599, in_stock: true, stock_qty: 30 },
    ],
    photoId: demoId('photo', 1),
    confirmed: true,
    status: 'ordered',
    confidence: 0.94,
    warnings: [],
  },
  {
    id: demoId('bom', 4),
    partId: 'ancor-108210',
    manufacturer: 'Ancor',
    mpn: '108210',
    name: '10 AWG Marine Wire Red (100ft)',
    quantity: 1,
    notes: 'Panel rewire',
    category_name: 'Electrical',
    listings: [
      { supplier: 'West Marine', sku: 'WM-108210', price_cents: 8999, list_price_cents: 10499, in_stock: true, stock_qty: 12 },
    ],
    photoId: demoId('photo', 1),
    confirmed: false,
    status: 'pending',
    confidence: 0.91,
    intelligence: {
      context: {
        installation_notes: 'ABYC-compliant tinned copper. Use proper marine-grade crimps.',
        companion_parts: ['108010 (Black, 100ft)', '309199 (Ring Terminal Kit)'],
      },
    },
    warnings: [],
  },
  // === COOLING ===
  {
    id: demoId('bom', 5),
    partId: 'jab-1210',
    manufacturer: 'Jabsco',
    mpn: '1210-0001',
    name: 'Raw Water Impeller',
    quantity: 1,
    notes: 'Vanes cracked — replace immediately',
    category_name: 'Cooling',
    listings: [
      { supplier: 'West Marine', sku: 'WM-1210', price_cents: 3499, list_price_cents: 3999, in_stock: true, stock_qty: 22 },
      { supplier: 'Defender', sku: 'DEF-1210', price_cents: 3299, list_price_cents: 3999, in_stock: true, stock_qty: 30 },
    ],
    photoId: demoId('photo', 2),
    confirmed: true,
    status: 'received',
    confidence: 0.98,
    intelligence: {
      context: {
        failure_mode: 'Cracked/missing vanes cause overheating',
        failure_consequence: 'Engine overheat, possible head gasket damage',
        installation_notes: 'Lubricate with dish soap or impeller lube. Never run dry.',
        installation_time_pro: '20–30 min',
        companion_parts: ['18753-0001 (End cover gasket)', '43990-0050 (Impeller lube)'],
      },
      sourcing: { estimated_price_range: '$32–$40' },
      system_context: 'Engine raw water cooling',
    },
    warnings: [],
  },
  {
    id: demoId('bom', 6),
    partId: 'jab-18753',
    manufacturer: 'Jabsco',
    mpn: '18753-0001',
    name: 'End Cover Gasket',
    quantity: 1,
    notes: 'Always replace with impeller',
    category_name: 'Cooling',
    listings: [
      { supplier: 'West Marine', sku: 'WM-18753', price_cents: 899, list_price_cents: 1099, in_stock: true, stock_qty: 40 },
    ],
    photoId: demoId('photo', 2),
    confirmed: true,
    status: 'received',
    confidence: 0.95,
    warnings: [],
  },
  // === NAVIGATION ===
  {
    id: demoId('bom', 7),
    partId: 'gar-1243',
    manufacturer: 'Garmin',
    mpn: '010-02741-00',
    name: 'GPSMAP 1243xsv',
    quantity: 1,
    notes: 'Helm upgrade — customer approved',
    category_name: 'Navigation',
    listings: [
      { supplier: 'West Marine', sku: 'WM-GAR1243', price_cents: 249999, list_price_cents: 269999, in_stock: true, stock_qty: 3 },
      { supplier: 'Defender', sku: 'DEF-GAR1243', price_cents: 244999, list_price_cents: 269999, in_stock: true, stock_qty: 5 },
    ],
    photoId: demoId('photo', 3),
    confirmed: false,
    status: 'pending',
    confidence: 0.89,
    intelligence: {
      context: {
        installation_notes: 'Flush mount or bail mount. Requires NMEA 2000 backbone. Check transducer compatibility.',
        installation_time_pro: '2–3 hours',
        upgrade_recommendation: 'Consider GT56UHD transducer for best sonar performance',
        compatibility_warning: 'Verify helm cutout dimensions match existing hole',
      },
      sourcing: { estimated_price_range: '$2,400–$2,700' },
      system_context: 'Helm navigation electronics',
    },
    warnings: [
      {
        type: 'price_check',
        severity: 'info',
        message: 'High-value item — confirm customer approval before ordering',
      },
    ],
  },
];

const activeJob: Job = {
  id: 'demo_blackbear',
  name: 'Black Bear — Feb 17',
  vessel: 'Black Bear',
  vesselId: 'vessel_bb',
  vesselContext: {
    name: 'Black Bear',
    make: 'Boston Whaler',
    model: '270 Dauntless',
    year: 2015,
    voltage: 12,
    engine: 'Mercury Verado 300',
    fuel_type: 'Gasoline',
    hull_material: 'Fiberglass',
  },
  client: 'Tim — Marine Electric',
  status: 'active',
  priority: 'normal',
  createdAt: FEB_17,
  updatedAt: NOW,
  startedAt: FEB_17,
  photos: blackBearPhotos,
  bom: blackBearBOM,
  installations: [],
  notes: 'Full electrical panel upgrade + raw water service + nav upgrade. Customer approved Garmin verbally — get written OK before ordering.',
  lessonsLearned: '',
  estimatedHours: 12,
  estimatedCostCents: 320000,
};

// ============================================================================
// COMPLETED JOB: Sea Spray — Feb 10
// ============================================================================

const completedJob: Job = {
  id: 'demo_seaspray',
  name: 'Sea Spray — Feb 10',
  vessel: 'Sea Spray',
  vesselId: 'vessel_ss',
  vesselContext: {
    name: 'Sea Spray',
    make: 'Grady-White',
    model: '236 Fisherman',
    year: 2018,
    voltage: 12,
    engine: 'Yamaha F250',
    fuel_type: 'Gasoline',
    hull_material: 'Fiberglass',
  },
  client: 'Harbor View Marina',
  status: 'complete',
  priority: 'normal',
  createdAt: FEB_10,
  updatedAt: FEB_10_LATE,
  startedAt: FEB_10,
  completedAt: FEB_10_LATE,
  photos: [
    {
      id: demoId('photo', 10),
      file: '',
      filename: 'zinc_anodes.jpg',
      uploadedAt: FEB_10,
      status: 'identified',
      identifiedParts: [],
      notes: 'Hull zincs — 80% depleted',
      photoType: 'identification',
    },
  ],
  bom: [
    {
      id: demoId('bom', 10),
      partId: 'mart-cmez1',
      manufacturer: 'Martyr',
      mpn: 'CMEZ1',
      name: 'Engine Zinc Anode',
      quantity: 2,
      notes: '',
      category_name: 'Hull Protection',
      listings: [
        { supplier: 'West Marine', sku: 'WM-CMEZ1', price_cents: 1899, list_price_cents: 2199, in_stock: true, stock_qty: 50 },
      ],
      confirmed: true,
      status: 'installed',
      confidence: 0.97,
      warnings: [],
    },
    {
      id: demoId('bom', 11),
      partId: 'mart-cmx06',
      manufacturer: 'Martyr',
      mpn: 'CMX06',
      name: 'Shaft Zinc Anode',
      quantity: 1,
      notes: '',
      category_name: 'Hull Protection',
      listings: [
        { supplier: 'West Marine', sku: 'WM-CMX06', price_cents: 2499, list_price_cents: 2899, in_stock: true, stock_qty: 25 },
      ],
      confirmed: true,
      status: 'installed',
      confidence: 0.96,
      warnings: [],
    },
    {
      id: demoId('bom', 12),
      partId: 'yam-oil',
      manufacturer: 'Yanmar',
      mpn: '119305-35151',
      name: 'Oil Filter',
      quantity: 1,
      notes: '',
      category_name: 'Engine',
      listings: [
        { supplier: 'Defender', sku: 'DEF-YM119305', price_cents: 1299, list_price_cents: 1599, in_stock: true, stock_qty: 20 },
      ],
      confirmed: true,
      status: 'installed',
      confidence: 0.99,
      warnings: [],
    },
  ],
  installations: [
    {
      id: demoId('inst', 1),
      jobItemId: demoId('bom', 10),
      vesselId: 'vessel_ss',
      installedAt: FEB_10_LATE,
      hoursTaken: 0.5,
      outcome: 'success',
      outcomeNotes: 'Both engine zincs replaced',
      verified: true,
      verifiedAt: FEB_10_LATE,
    },
    {
      id: demoId('inst', 2),
      jobItemId: demoId('bom', 11),
      vesselId: 'vessel_ss',
      installedAt: FEB_10_LATE,
      hoursTaken: 1,
      outcome: 'success',
      outcomeNotes: 'Shaft zinc — tight fit but good contact',
      verified: true,
      verifiedAt: FEB_10_LATE,
    },
  ],
  notes: 'Annual zinc service + oil change. Quick turnaround.',
  lessonsLearned: 'Grady-White 236 shaft zinc is tight — bring extra wrenches.',
  estimatedHours: 3,
  actualHours: 2.5,
  estimatedCostCents: 8500,
  actualCostCents: 7895,
  progress: 100,
};

// ============================================================================
// EXPORTS
// ============================================================================

export function getDemoJobs(): Job[] {
  return [activeJob, completedJob];
}

/**
 * Load jobs from localStorage, or seed with demo data if empty.
 */
export function ensureDemoData(existingJobs: Job[]): Job[] {
  if (existingJobs.length > 0) return existingJobs;
  return getDemoJobs();
}
