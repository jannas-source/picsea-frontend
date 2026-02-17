import { Job, BOMItem, JobPhoto } from './types';

/**
 * Demo data for PicSea shop demos.
 * Pre-populated jobs that showcase the full workflow.
 * Real marine part numbers and realistic prices where possible.
 */

function demoId(prefix: string, n: number): string {
  return `${prefix}_demo_${n}`;
}

const FEB_17 = '2026-02-17T07:30:00.000Z';
const FEB_17_LATE = '2026-02-17T11:45:00.000Z';
const FEB_15 = '2026-02-15T09:00:00.000Z';
const FEB_15_LATE = '2026-02-15T14:30:00.000Z';
const FEB_14 = '2026-02-14T08:00:00.000Z';
const FEB_14_LATE = '2026-02-14T16:00:00.000Z';
const FEB_12 = '2026-02-12T10:00:00.000Z';
const FEB_12_LATE = '2026-02-12T17:00:00.000Z';
const FEB_10 = '2026-02-10T08:00:00.000Z';
const FEB_10_LATE = '2026-02-10T16:30:00.000Z';
const FEB_8 = '2026-02-08T07:00:00.000Z';
const FEB_8_LATE = '2026-02-08T15:00:00.000Z';
const NOW = new Date().toISOString();

// ============================================================================
// ACTIVE JOB 1: Black Bear — Feb 17
// Boston Whaler 270 Dauntless — Electrical/Nav/Cooling
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
        installation_notes: 'Kill main breaker before removal. Label all circuits with masking tape and marker. Torque bus bar connections to 35 in-lbs. Take a photo of old wiring before disconnect.',
        installation_time_pro: '3–4 hours',
        installation_time_diy: '6–8 hours',
        companion_parts: ['7507 (5A breakers)', '7510 (15A breakers)', '7512 (25A breakers)', 'Ring terminals'],
        common_mistakes: 'Forgetting to label wires before disconnecting old panel. Double-check polarity — Blue Sea labels positive feeds from the left.',
      },
      sourcing: { estimated_price_range: '$275–$320', preferred_supplier_type: 'Marine chandlery' },
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
        installation_notes: 'Snap-in fit for Blue Sea panels. No tools required. Verify amp rating matches circuit load.',
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
    notes: 'Panel rewire — ABYC-compliant tinned copper',
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
        installation_notes: 'Use proper marine-grade heat-shrink crimps. Do NOT use hardware-store butt connectors. Strip 3/8" of insulation for ring terminals.',
        companion_parts: ['108010 (Black, 100ft)', '309199 (Ring Terminal Kit)', 'Heat-shrink tubing, adhesive-lined'],
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
        installation_notes: 'Lubricate with dish soap or impeller lube. Never run dry. Note impeller rotation direction before removal — new one goes in same way.',
        installation_time_pro: '20–30 min',
        companion_parts: ['18753-0001 (End cover gasket)', '43990-0050 (Impeller lube)'],
        common_mistakes: 'Installing impeller backwards. Count vanes on old impeller — any missing pieces lodged in cooling system need to be flushed out.',
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
    intelligence: {
      context: {
        installation_notes: 'Apply thin film of waterproof grease to gasket before seating. Torque end cover bolts evenly in star pattern.',
      },
    },
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
        installation_notes: 'Flush mount or bail mount. Requires NMEA 2000 backbone. Check transducer compatibility before ordering. Measure helm cutout — this unit is 14.7" x 8.9".',
        installation_time_pro: '2–3 hours',
        upgrade_recommendation: 'Consider GT56UHD transducer for best sonar performance with this unit',
        compatibility_warning: 'Verify helm cutout dimensions match existing hole — may need adapter plate',
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

const blackBearJob: Job = {
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
// ACTIVE JOB 2: Lady Grace — Feb 15
// Grady-White Canyon 376 — Engine room refit
// ============================================================================

const ladyGraceBOM: BOMItem[] = [
  // === FUEL ===
  {
    id: demoId('bom', 20),
    partId: 'rac-r12t',
    manufacturer: 'Racor',
    mpn: 'R12T',
    name: 'Fuel Filter / Water Separator',
    quantity: 2,
    notes: 'Replace both engine filters — annual service',
    category_name: 'Fuel',
    listings: [
      { supplier: 'West Marine', sku: 'WM-R12T', price_cents: 1299, list_price_cents: 1599, in_stock: true, stock_qty: 35 },
      { supplier: 'Defender', sku: 'DEF-R12T', price_cents: 1199, list_price_cents: 1599, in_stock: true, stock_qty: 50 },
    ],
    confirmed: true,
    status: 'ordered',
    confidence: 0.97,
    intelligence: {
      context: {
        installation_notes: 'Close fuel valve before removing filter bowl. Have rags ready — fuel will spill. Prime system after install by cycling key 3-4 times before cranking.',
        installation_time_pro: '15 min each',
        companion_parts: ['Racor RK 11-1404 (Bowl gasket)', 'Fuel stabilizer'],
        common_mistakes: 'Forgetting to close the fuel shutoff valve before removal. Not priming — engine cranks but won\'t start.',
      },
      sourcing: { estimated_price_range: '$12–$16 each' },
      system_context: 'Primary fuel filtration',
    },
    warnings: [],
  },
  {
    id: demoId('bom', 21),
    partId: 'rac-500fg',
    manufacturer: 'Racor',
    mpn: '500FG',
    name: 'Turbine Fuel Filter/Separator Assembly',
    quantity: 1,
    notes: 'Upgrade from 200 series — higher flow for twins',
    category_name: 'Fuel',
    listings: [
      { supplier: 'West Marine', sku: 'WM-500FG', price_cents: 42999, list_price_cents: 47999, in_stock: true, stock_qty: 4 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.88,
    intelligence: {
      context: {
        installation_notes: 'Mount vertically with drain at bottom. Use Racor mounting bracket #RK 21069. Ensure 2" clearance below bowl for drain valve access.',
        installation_time_pro: '1–1.5 hours',
        upgrade_recommendation: 'Consider adding a vacuum gauge to monitor filter condition',
      },
      sourcing: { estimated_price_range: '$400–$480' },
      system_context: 'Primary fuel filtration — engine room',
    },
    warnings: [],
  },
  // === ELECTRICAL ===
  {
    id: demoId('bom', 22),
    partId: 'bs-6011',
    manufacturer: 'Blue Sea Systems',
    mpn: '6011',
    name: 'Battery Switch Dual Circuit Plus',
    quantity: 1,
    notes: 'Replace corroded switch — port engine bank',
    category_name: 'Electrical',
    listings: [
      { supplier: 'West Marine', sku: 'WM-6011', price_cents: 13999, list_price_cents: 15999, in_stock: true, stock_qty: 7 },
      { supplier: 'Defender', sku: 'DEF-6011', price_cents: 13499, list_price_cents: 15999, in_stock: true, stock_qty: 12 },
    ],
    confirmed: true,
    status: 'ordered',
    confidence: 0.93,
    intelligence: {
      context: {
        installation_notes: 'Disconnect all battery cables before removal. Clean cable terminals with wire brush. Apply Boeshield T-9 to new connections. Torque 3/8" studs to 100 in-lbs.',
        installation_time_pro: '45 min',
        companion_parts: ['Boeshield T-9 corrosion inhibitor', '2 AWG battery cable (if corroded)'],
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 23),
    partId: 'pro-ps3',
    manufacturer: 'ProMariner',
    mpn: 'ProSport 20 Plus',
    name: '20A 3-Bank Battery Charger',
    quantity: 1,
    notes: 'Old charger fried — customer smelled smoke last week',
    category_name: 'Electrical',
    listings: [
      { supplier: 'West Marine', sku: 'WM-PS20+', price_cents: 32999, list_price_cents: 37999, in_stock: true, stock_qty: 6 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.91,
    intelligence: {
      context: {
        installation_notes: 'Mount in ventilated area — charger generates heat. Run AC feed from 15A dedicated breaker. Use #10 AWG wire for battery leads over 10ft.',
        installation_time_pro: '1.5–2 hours',
        compatibility_warning: 'Verify battery type setting — AGM, Flooded, or Gel. Wrong setting will damage batteries.',
      },
      sourcing: { estimated_price_range: '$300–$380' },
    },
    warnings: [
      {
        type: 'compatibility',
        severity: 'warning',
        message: 'Verify battery chemistry type before configuring charger — wrong profile damages batteries',
      },
    ],
  },
  // === EXHAUST ===
  {
    id: demoId('bom', 24),
    partId: 'osco-ya-er',
    manufacturer: 'OSCO',
    mpn: 'YA-ER-Y4',
    name: 'Exhaust Riser — Yamaha 4-Stroke',
    quantity: 2,
    notes: 'Significant corrosion on starboard riser — replace both',
    category_name: 'Exhaust',
    listings: [
      { supplier: 'Wholesale Marine', sku: 'WSM-YAER', price_cents: 39999, list_price_cents: 44999, in_stock: true, stock_qty: 3 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.87,
    intelligence: {
      context: {
        failure_mode: 'Internal corrosion causes water intrusion into cylinders',
        failure_consequence: 'Hydro-lock — catastrophic engine damage',
        installation_notes: 'Apply Permatex Ultra Copper to gasket surfaces. Torque bolts to 25 ft-lbs in sequence. Inspect elbows while you\'re in there.',
        installation_time_pro: '3–4 hours per side',
        companion_parts: ['Exhaust elbow gaskets (2)', 'Stainless hose clamps, 4"', 'Exhaust hose, 4" (3ft)'],
        common_mistakes: 'Reusing old gaskets. Under-torquing riser bolts — they WILL leak.',
      },
      sourcing: { estimated_price_range: '$380–$450 each' },
      system_context: 'Wet exhaust system',
    },
    warnings: [
      {
        type: 'failure_risk',
        severity: 'warning',
        message: 'Corroded risers risk hydro-lock — prioritize this repair',
      },
    ],
  },
  {
    id: demoId('bom', 25),
    partId: 'osco-ya-elb',
    manufacturer: 'OSCO',
    mpn: 'YA-EL-Y4',
    name: 'Exhaust Elbow — Yamaha 4-Stroke',
    quantity: 2,
    notes: 'Inspect and replace if corroded — usually are if risers are bad',
    category_name: 'Exhaust',
    listings: [
      { supplier: 'Wholesale Marine', sku: 'WSM-YAEL', price_cents: 29999, list_price_cents: 34999, in_stock: false, stock_qty: 0 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.85,
    intelligence: {
      context: {
        installation_notes: 'Replace gasket between riser and elbow. Check for cracks around the water injection point. Apply anti-seize to stainless bolts.',
        installation_time_pro: 'Included with riser replacement',
      },
    },
    warnings: [
      {
        type: 'stock',
        severity: 'warning',
        message: 'Out of stock at primary supplier — check lead time (typically 5–7 business days)',
      },
    ],
  },
  {
    id: demoId('bom', 26),
    partId: 'ancor-310199',
    manufacturer: 'Ancor',
    mpn: '309199',
    name: 'Ring Terminal Assortment Kit',
    quantity: 1,
    notes: 'For panel rewire and battery switch install',
    category_name: 'Electrical',
    listings: [
      { supplier: 'West Marine', sku: 'WM-309199', price_cents: 2999, list_price_cents: 3499, in_stock: true, stock_qty: 18 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.92,
    intelligence: {
      context: {
        installation_notes: 'Use ratcheting crimper only — never squeeze-type pliers. Heat-shrink adhesive-lined preferred for marine environment.',
      },
    },
    warnings: [],
  },
  // Additional fuel system parts
  {
    id: demoId('bom', 27),
    partId: 'rac-rk11',
    manufacturer: 'Racor',
    mpn: 'RK 11-1404',
    name: 'Filter Bowl Gasket Kit',
    quantity: 2,
    notes: 'Companion part for R12T filter replacement',
    category_name: 'Fuel',
    listings: [
      { supplier: 'Defender', sku: 'DEF-RK11', price_cents: 799, list_price_cents: 999, in_stock: true, stock_qty: 25 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.90,
    intelligence: {
      context: {
        installation_notes: 'Lightly oil gasket before seating. Hand-tighten bowl only — over-torquing cracks plastic.',
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 28),
    partId: 'permatex-uc',
    manufacturer: 'Permatex',
    mpn: '81878',
    name: 'Ultra Copper Maximum Temp RTV Gasket Maker',
    quantity: 1,
    notes: 'For exhaust riser gasket surfaces',
    category_name: 'Exhaust',
    listings: [
      { supplier: 'West Marine', sku: 'WM-81878', price_cents: 1299, list_price_cents: 1499, in_stock: true, stock_qty: 15 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.95,
    warnings: [],
  },
  {
    id: demoId('bom', 29),
    partId: 'boeshield-t9',
    manufacturer: 'Boeshield',
    mpn: 'T-9',
    name: 'T-9 Corrosion Inhibitor (12oz)',
    quantity: 1,
    notes: 'Spray on all electrical connections after install',
    category_name: 'Electrical',
    listings: [
      { supplier: 'West Marine', sku: 'WM-T9', price_cents: 1699, list_price_cents: 1899, in_stock: true, stock_qty: 20 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.96,
    warnings: [],
  },
];

const ladyGraceJob: Job = {
  id: 'demo_ladygrace',
  name: 'Lady Grace — Feb 15',
  vessel: 'Lady Grace',
  vesselId: 'vessel_lg',
  vesselContext: {
    name: 'Lady Grace',
    make: 'Grady-White',
    model: 'Canyon 376',
    year: 2020,
    voltage: 12,
    engine: 'Triple Yamaha F300',
    fuel_type: 'Gasoline',
    hull_material: 'Fiberglass',
  },
  client: 'Cape Cod Marine Services',
  status: 'active',
  priority: 'critical',
  createdAt: FEB_15,
  updatedAt: NOW,
  startedAt: FEB_15,
  photos: [
    {
      id: demoId('photo', 20),
      file: '',
      filename: 'engine_room_port.jpg',
      uploadedAt: FEB_15,
      status: 'identified',
      identifiedParts: [],
      notes: 'Port engine — exhaust riser showing heavy scale',
      photoType: 'identification',
    },
    {
      id: demoId('photo', 21),
      file: '',
      filename: 'fuel_filter_assembly.jpg',
      uploadedAt: FEB_15,
      status: 'identified',
      identifiedParts: [],
      notes: 'Fuel filter rack — both filters overdue, water in bowls',
      photoType: 'identification',
    },
  ],
  bom: ladyGraceBOM,
  installations: [],
  notes: 'Big refit job. Exhaust risers are priority — owner reporting reduced power and sulfur smell. Fuel system annual service while access panels are off. Battery switch corroded from bilge moisture.',
  lessonsLearned: '',
  estimatedHours: 24,
  estimatedCostCents: 185000,
};

// ============================================================================
// ACTIVE JOB 3: Tenacious — Feb 14
// Maine Cat 30 — Navigation upgrade (sailboat)
// ============================================================================

const tenaciousBOM: BOMItem[] = [
  // === NAVIGATION ===
  {
    id: demoId('bom', 30),
    partId: 'gar-9x3sv',
    manufacturer: 'Garmin',
    mpn: '010-02366-61',
    name: 'ECHOMAP UHD2 93sv',
    quantity: 1,
    notes: 'Replace ancient Raymarine C80 — customer wants touchscreen',
    category_name: 'Navigation',
    listings: [
      { supplier: 'West Marine', sku: 'WM-E93SV', price_cents: 149999, list_price_cents: 169999, in_stock: true, stock_qty: 6 },
      { supplier: 'Defender', sku: 'DEF-E93SV', price_cents: 144999, list_price_cents: 169999, in_stock: true, stock_qty: 8 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.92,
    intelligence: {
      context: {
        installation_notes: 'Flush mount requires 8.7" x 5.3" cutout. Existing Raymarine hole is 7.5" x 5" — need adapter plate or fiberglass work. Power from instrument bus (2A fuse).',
        installation_time_pro: '2–3 hours (with cutout modification)',
        companion_parts: ['010-12441-00 (Power/data cable)', 'Flush mount gasket kit'],
        common_mistakes: 'Cutting helm cutout too large. Measure twice. Use a template.',
      },
      sourcing: { estimated_price_range: '$1,400–$1,700' },
      system_context: 'Helm navigation — sailboat',
    },
    warnings: [
      {
        type: 'compatibility',
        severity: 'info',
        message: 'Existing Raymarine transducer may work with adaptor — verify before ordering new one',
      },
    ],
  },
  {
    id: demoId('bom', 31),
    partId: 'air-gt54',
    manufacturer: 'Airmar',
    mpn: 'GT54UHD-TM',
    name: 'CHIRP Transducer (transom mount)',
    quantity: 1,
    notes: 'Sailboat — transom mount preferred, no thru-hull',
    category_name: 'Navigation',
    listings: [
      { supplier: 'West Marine', sku: 'WM-GT54', price_cents: 64999, list_price_cents: 74999, in_stock: true, stock_qty: 4 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.88,
    intelligence: {
      context: {
        installation_notes: 'Mount on flat section of transom, below waterline. Angle slightly aft (5°). Use 3M 5200 for permanent bond or 4200 if you might need to remove it. Route cable through existing conduit if available.',
        installation_time_pro: '1–1.5 hours',
        common_mistakes: 'Mounting too close to prop wash — bubbles kill sonar signal. Keep minimum 12" offset from prop.',
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 32),
    partId: 'std-gx1700',
    manufacturer: 'Standard Horizon',
    mpn: 'GX1700',
    name: 'VHF Radio with GPS',
    quantity: 1,
    notes: 'Replace ICOM that quit receiving — internal GPS is a bonus',
    category_name: 'Navigation',
    listings: [
      { supplier: 'West Marine', sku: 'WM-GX1700', price_cents: 19999, list_price_cents: 24999, in_stock: true, stock_qty: 10 },
      { supplier: 'Defender', sku: 'DEF-GX1700', price_cents: 18999, list_price_cents: 24999, in_stock: true, stock_qty: 14 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.94,
    intelligence: {
      context: {
        installation_notes: 'Reuse existing antenna cable if RG-8X and less than 30ft. Program MMSI and vessel name during setup. Register DSC with USCG.',
        installation_time_pro: '45 min–1 hour',
        companion_parts: ['Shakespeare 5215 VHF antenna (if replacing)'],
      },
    },
    warnings: [],
  },
  // === ELECTRICAL (LED conversion) ===
  {
    id: demoId('bom', 33),
    partId: 'dr-led-nv',
    manufacturer: 'Dr. LED',
    mpn: '8001102',
    name: 'LED Nav Light Bulb — Red/Green (BAY15d)',
    quantity: 2,
    notes: 'Bicolor bow light + stern light conversion',
    category_name: 'Electrical',
    listings: [
      { supplier: 'Defender', sku: 'DEF-8001102', price_cents: 3999, list_price_cents: 4499, in_stock: true, stock_qty: 20 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.90,
    intelligence: {
      context: {
        installation_notes: 'Direct bayonet replacement. Check polarity — LEDs are polarity-sensitive unlike incandescent. If light doesn\'t work, flip the bulb 180°.',
        installation_time_pro: '5 min each',
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 34),
    partId: 'dr-led-cab',
    manufacturer: 'Dr. LED',
    mpn: '8001082',
    name: 'LED Cabin Dome Light (warm white)',
    quantity: 4,
    notes: 'Replace all cabin lights — customer tired of changing bulbs',
    category_name: 'Electrical',
    listings: [
      { supplier: 'Defender', sku: 'DEF-8001082', price_cents: 2999, list_price_cents: 3499, in_stock: true, stock_qty: 30 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.91,
    intelligence: {
      context: {
        installation_notes: 'G4 bi-pin base — slide out old, slide in new. Warm white (3000K) for cabin, cool white (5000K) for engine room.',
        installation_time_pro: '2 min each',
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 35),
    partId: 'nmea-bkbn',
    manufacturer: 'Garmin',
    mpn: '010-11425-02',
    name: 'NMEA 2000 Backbone Kit',
    quantity: 1,
    notes: 'Need backbone for new chartplotter — boat has no N2K network',
    category_name: 'Navigation',
    listings: [
      { supplier: 'West Marine', sku: 'WM-N2K-KIT', price_cents: 11999, list_price_cents: 13999, in_stock: true, stock_qty: 8 },
    ],
    confirmed: false,
    status: 'pending',
    confidence: 0.93,
    intelligence: {
      context: {
        installation_notes: 'Run backbone along port gunwale — shortest path from helm to engine. Use proper marine cable ties. Terminate both ends with NMEA 2000 terminators.',
        installation_time_pro: '1.5–2 hours',
      },
    },
    warnings: [],
  },
];

const tenaciousJob: Job = {
  id: 'demo_tenacious',
  name: 'Tenacious — Feb 14',
  vessel: 'Tenacious',
  vesselId: 'vessel_tn',
  vesselContext: {
    name: 'Tenacious',
    make: 'Maine Cat',
    model: 'MC 30',
    year: 1998,
    voltage: 12,
    engine: 'Yanmar 3GM30F',
    fuel_type: 'Diesel',
    hull_material: 'Fiberglass',
    systems: 'Sailboat — limited electrical capacity',
  },
  client: 'Portland Yacht Services',
  status: 'active',
  priority: 'normal',
  createdAt: FEB_14,
  updatedAt: NOW,
  startedAt: FEB_14,
  photos: [
    {
      id: demoId('photo', 30),
      file: '',
      filename: 'old_raymarine_helm.jpg',
      uploadedAt: FEB_14,
      status: 'identified',
      identifiedParts: [],
      notes: 'Existing Raymarine C80 — screen barely readable, buttons sticking',
      photoType: 'identification',
    },
  ],
  bom: tenaciousBOM,
  installations: [],
  notes: 'Full nav electronics upgrade for 1998 sailboat. No existing NMEA 2000 network — need to run backbone. Customer on a budget but wants reliability. LED conversion is low-hanging fruit for power savings.',
  lessonsLearned: '',
  estimatedHours: 8,
  estimatedCostCents: 95000,
};

// ============================================================================
// ACTIVE JOB 4: Dock Holiday — Feb 12
// Sea Hunt Ultra 255 — Routine maintenance (mix of statuses)
// ============================================================================

const dockHolidayBOM: BOMItem[] = [
  // === COOLING ===
  {
    id: demoId('bom', 40),
    partId: 'jab-17937',
    manufacturer: 'Jabsco',
    mpn: '17937-0001',
    name: 'Raw Water Pump Impeller (Yamaha)',
    quantity: 1,
    notes: 'Annual impeller service — 450 hours on current one',
    category_name: 'Cooling',
    listings: [
      { supplier: 'West Marine', sku: 'WM-17937', price_cents: 4299, list_price_cents: 4999, in_stock: true, stock_qty: 15 },
      { supplier: 'Defender', sku: 'DEF-17937', price_cents: 3999, list_price_cents: 4999, in_stock: true, stock_qty: 20 },
    ],
    confirmed: true,
    status: 'installed',
    confidence: 0.97,
    intelligence: {
      context: {
        installation_notes: 'Remove 4 bolts from pump housing cover. Pull old impeller — may need impeller puller if stuck. Insert new impeller with vanes curving in direction of rotation. Lubricate with dish soap.',
        installation_time_pro: '25 min',
        companion_parts: ['Impeller cover gasket', 'Impeller lube'],
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 41),
    partId: 'sie-18-3549',
    manufacturer: 'Sierra',
    mpn: '18-3549',
    name: 'Thermostat 160°F (Yamaha)',
    quantity: 1,
    notes: 'Running hot last season — thermostat sticking',
    category_name: 'Cooling',
    listings: [
      { supplier: 'West Marine', sku: 'WM-183549', price_cents: 1999, list_price_cents: 2299, in_stock: true, stock_qty: 25 },
    ],
    confirmed: true,
    status: 'installed',
    confidence: 0.95,
    intelligence: {
      context: {
        installation_notes: 'Drain coolant first. Replace thermostat gasket. Use OEM gasket — aftermarket ones often leak. Fill with 50/50 coolant mix, burp air from system.',
        installation_time_pro: '30–45 min',
        companion_parts: ['Thermostat gasket', 'Engine coolant (1 gal)'],
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 42),
    partId: 'mart-cm1',
    manufacturer: 'Martyr',
    mpn: 'CM-1',
    name: 'Engine Block Zinc Anode',
    quantity: 2,
    notes: 'Both engine zincs 70% depleted',
    category_name: 'Cooling',
    listings: [
      { supplier: 'West Marine', sku: 'WM-CM1', price_cents: 899, list_price_cents: 1099, in_stock: true, stock_qty: 60 },
    ],
    confirmed: true,
    status: 'received',
    confidence: 0.96,
    intelligence: {
      context: {
        installation_notes: 'Remove old zinc — if bolt is seized, use PB Blaster overnight. Clean mounting surface of scale. New zinc should have bare metal contact. Check zinc condition while access panel is open.',
        installation_time_pro: '10 min each (if bolts cooperate)',
        common_mistakes: 'Painting over zincs — paint insulates them. Zincs must have direct metal contact.',
      },
    },
    warnings: [],
  },
  // === HULL ===
  {
    id: demoId('bom', 43),
    partId: 'groco-th500',
    manufacturer: 'Groco',
    mpn: 'TH-500-W',
    name: 'Bronze Thru-Hull 1/2" NPT',
    quantity: 2,
    notes: 'Livewell intake and scupper — pitting observed on haul-out',
    category_name: 'Hull',
    listings: [
      { supplier: 'West Marine', sku: 'WM-TH500', price_cents: 3499, list_price_cents: 3999, in_stock: true, stock_qty: 12 },
    ],
    confirmed: true,
    status: 'ordered',
    confidence: 0.93,
    intelligence: {
      context: {
        installation_notes: 'Bed with 3M 5200 permanent sealant. Internal and external backing nut. Use bronze ball valve — never gate valve below waterline. Torque to hand-tight plus 1/4 turn with channel locks.',
        installation_time_pro: '45 min each (boat on jack stands)',
        common_mistakes: 'Using silicone instead of 5200. Silicone won\'t hold below waterline.',
      },
      sourcing: { estimated_price_range: '$32–$40 each' },
      system_context: 'Below-waterline hull penetrations',
    },
    warnings: [],
  },
  {
    id: demoId('bom', 44),
    partId: 'groco-bv500',
    manufacturer: 'Groco',
    mpn: 'BV-500',
    name: 'Bronze Ball Valve 1/2"',
    quantity: 2,
    notes: 'Replace seacocks — companion to thru-hulls',
    category_name: 'Hull',
    listings: [
      { supplier: 'West Marine', sku: 'WM-BV500', price_cents: 4999, list_price_cents: 5799, in_stock: true, stock_qty: 8 },
    ],
    confirmed: true,
    status: 'ordered',
    confidence: 0.94,
    intelligence: {
      context: {
        installation_notes: 'Thread onto thru-hull with Teflon tape (3 wraps). Exercise valve yearly to prevent seizing. Mark open/closed position clearly.',
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 45),
    partId: 'interlux-mb',
    manufacturer: 'Interlux',
    mpn: 'YBB379/1',
    name: 'Micron CSC Bottom Paint (gallon, blue)',
    quantity: 2,
    notes: 'Two coats on bottom — haul-out scheduled March 1',
    category_name: 'Hull',
    listings: [
      { supplier: 'West Marine', sku: 'WM-YBB379', price_cents: 22999, list_price_cents: 25999, in_stock: true, stock_qty: 18 },
    ],
    confirmed: true,
    status: 'received',
    confidence: 0.98,
    intelligence: {
      context: {
        installation_notes: 'Sand existing bottom with 80-grit. Two coats minimum, 3 hours between coats. Apply heavier at waterline. Launch within 90 days of painting.',
        installation_time_pro: '4–6 hours total (both coats)',
        common_mistakes: 'Not sanding between coats. Applying too thin — two thin coats is worse than one proper coat.',
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 46),
    partId: 'interlux-primer',
    manufacturer: 'Interlux',
    mpn: 'YBA068/QT',
    name: 'Interprotect 2000E Barrier Coat (quart)',
    quantity: 1,
    notes: 'Spot-prime any sanded areas — prevent osmotic blistering',
    category_name: 'Hull',
    listings: [
      { supplier: 'West Marine', sku: 'WM-YBA068', price_cents: 5499, list_price_cents: 6299, in_stock: true, stock_qty: 10 },
    ],
    confirmed: true,
    status: 'received',
    confidence: 0.94,
    warnings: [],
  },
  {
    id: demoId('bom', 47),
    partId: 'sierra-fuel',
    manufacturer: 'Sierra',
    mpn: '18-7948',
    name: 'Fuel Filter (Yamaha F250)',
    quantity: 1,
    notes: 'Annual fuel filter while doing other service',
    category_name: 'Cooling',
    listings: [
      { supplier: 'West Marine', sku: 'WM-187948', price_cents: 1599, list_price_cents: 1899, in_stock: true, stock_qty: 22 },
    ],
    confirmed: true,
    status: 'installed',
    confidence: 0.96,
    warnings: [],
  },
];

const dockHolidayJob: Job = {
  id: 'demo_dockholiday',
  name: 'Dock Holiday — Feb 12',
  vessel: 'Dock Holiday',
  vesselId: 'vessel_dh',
  vesselContext: {
    name: 'Dock Holiday',
    make: 'Sea Hunt',
    model: 'Ultra 255',
    year: 2018,
    voltage: 12,
    engine: 'Yamaha F250',
    fuel_type: 'Gasoline',
    hull_material: 'Fiberglass',
  },
  client: 'South Shore Boatyard',
  status: 'active',
  priority: 'normal',
  createdAt: FEB_12,
  updatedAt: NOW,
  startedAt: FEB_12,
  photos: [
    {
      id: demoId('photo', 40),
      file: '',
      filename: 'hull_bottom_pitting.jpg',
      uploadedAt: FEB_12,
      status: 'identified',
      identifiedParts: [],
      notes: 'Thru-hull pitting — visible on port side',
      photoType: 'identification',
    },
    {
      id: demoId('photo', 41),
      file: '',
      filename: 'engine_zincs_depleted.jpg',
      uploadedAt: FEB_12,
      status: 'identified',
      identifiedParts: [],
      notes: 'Engine block zincs — 70% gone',
      photoType: 'identification',
    },
  ],
  bom: dockHolidayBOM,
  installations: [
    {
      id: demoId('inst', 40),
      jobItemId: demoId('bom', 40),
      vesselId: 'vessel_dh',
      installedAt: FEB_12_LATE,
      hoursTaken: 0.4,
      outcome: 'success',
      outcomeNotes: 'Impeller swapped — old one had 2 cracked vanes. No debris in cooling passages.',
      verified: true,
      verifiedAt: FEB_12_LATE,
    },
    {
      id: demoId('inst', 41),
      jobItemId: demoId('bom', 41),
      vesselId: 'vessel_dh',
      installedAt: FEB_12_LATE,
      hoursTaken: 0.5,
      outcome: 'success',
      outcomeNotes: 'Thermostat replaced. Engine now holds 160°F steady.',
      verified: true,
      verifiedAt: FEB_12_LATE,
    },
    {
      id: demoId('inst', 42),
      jobItemId: demoId('bom', 47),
      vesselId: 'vessel_dh',
      installedAt: FEB_12_LATE,
      hoursTaken: 0.15,
      outcome: 'success',
      outcomeNotes: 'Fuel filter swapped. Old one was discolored but not clogged.',
      verified: true,
      verifiedAt: FEB_12_LATE,
    },
  ],
  notes: 'Spring commissioning package. Impeller, thermostat, zincs, fuel filter done. Thru-hulls and bottom paint pending haul-out March 1. Paint and primer received and stored at yard.',
  lessonsLearned: 'Sea Hunt 255 has tight access to port thru-hull — approach from under console, not from cockpit.',
  estimatedHours: 16,
  actualHours: 3,
  estimatedCostCents: 95000,
};

// ============================================================================
// COMPLETED JOB 1: Sea Spray — Feb 10
// Grady-White 236 Fisherman — Zincs + oil change
// ============================================================================

const seaSprayJob: Job = {
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
      intelligence: {
        context: {
          installation_notes: 'Clean mounting surface. Ensure bare metal contact. Torque bolt to 15 ft-lbs. Do not paint.',
        },
      },
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
      manufacturer: 'Yamaha',
      mpn: '5GH-13440-61',
      name: 'Oil Filter Element',
      quantity: 1,
      notes: '',
      category_name: 'Engine',
      listings: [
        { supplier: 'Defender', sku: 'DEF-5GH', price_cents: 1299, list_price_cents: 1599, in_stock: true, stock_qty: 20 },
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
  lessonsLearned: 'Grady-White 236 shaft zinc is tight — bring extra wrenches. 15/16" box-end works best.',
  estimatedHours: 3,
  actualHours: 2.5,
  estimatedCostCents: 8500,
  actualCostCents: 7895,
  progress: 100,
};

// ============================================================================
// COMPLETED JOB 2: Viking Spirit — Feb 8
// Viking 52 Convertible — Generator service (high-value vessel)
// ============================================================================

const vikingSpiritBOM: BOMItem[] = [
  // === GENERATOR ===
  {
    id: demoId('bom', 50),
    partId: 'onan-149-2457',
    manufacturer: 'Onan/Cummins',
    mpn: '149-2457',
    name: 'Generator Oil Filter',
    quantity: 1,
    notes: '500-hour generator service',
    category_name: 'Generator',
    listings: [
      { supplier: 'Defender', sku: 'DEF-1492457', price_cents: 1899, list_price_cents: 2199, in_stock: true, stock_qty: 15 },
    ],
    confirmed: true,
    status: 'installed',
    confidence: 0.98,
    intelligence: {
      context: {
        installation_notes: 'Pre-fill new filter with oil before installing. Use strap wrench — don\'t dent the filter. Torque to hand-tight plus 3/4 turn.',
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 51),
    partId: 'onan-149-2206',
    manufacturer: 'Onan/Cummins',
    mpn: '149-2206',
    name: 'Generator Fuel Filter',
    quantity: 1,
    notes: 'Replace with oil filter during service',
    category_name: 'Generator',
    listings: [
      { supplier: 'Defender', sku: 'DEF-1492206', price_cents: 2499, list_price_cents: 2899, in_stock: true, stock_qty: 10 },
    ],
    confirmed: true,
    status: 'installed',
    confidence: 0.97,
    warnings: [],
  },
  {
    id: demoId('bom', 52),
    partId: 'onan-belt',
    manufacturer: 'Onan/Cummins',
    mpn: '511-0221',
    name: 'Generator Drive Belt',
    quantity: 1,
    notes: 'Showing cracks — preventive replacement',
    category_name: 'Generator',
    listings: [
      { supplier: 'Defender', sku: 'DEF-5110221', price_cents: 3999, list_price_cents: 4599, in_stock: true, stock_qty: 5 },
    ],
    confirmed: true,
    status: 'installed',
    confidence: 0.93,
    intelligence: {
      context: {
        installation_notes: 'Loosen alternator pivot bolt to release tension. Slip new belt on. Set tension to 1/2" deflection at midpoint. Re-check after 10 hours run time.',
        installation_time_pro: '15 min',
        common_mistakes: 'Over-tensioning belt — causes premature bearing wear on alternator.',
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 53),
    partId: 'jab-6303',
    manufacturer: 'Jabsco',
    mpn: '6303-0003',
    name: 'Generator Raw Water Impeller',
    quantity: 1,
    notes: 'Preventive — replace during service while access is open',
    category_name: 'Generator',
    listings: [
      { supplier: 'Defender', sku: 'DEF-6303', price_cents: 5999, list_price_cents: 6999, in_stock: true, stock_qty: 8 },
    ],
    confirmed: true,
    status: 'installed',
    confidence: 0.96,
    intelligence: {
      context: {
        installation_notes: 'Same procedure as engine impeller. Generator model uses smaller pump — don\'t confuse parts. Lubricate with glycerin.',
        companion_parts: ['Impeller cover gasket (check part number against gen model)'],
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 54),
    partId: 'peak-coolant',
    manufacturer: 'Peak',
    mpn: 'PEAK-OET-50/50',
    name: 'Marine Coolant 50/50 (gallon)',
    quantity: 2,
    notes: 'Flush and refill generator coolant',
    category_name: 'Generator',
    listings: [
      { supplier: 'West Marine', sku: 'WM-PEAK-MAR', price_cents: 1899, list_price_cents: 2199, in_stock: true, stock_qty: 30 },
    ],
    confirmed: true,
    status: 'installed',
    confidence: 0.99,
    warnings: [],
  },
  // === ELECTRICAL ===
  {
    id: demoId('bom', 55),
    partId: 'marinco-6364',
    manufacturer: 'Marinco',
    mpn: '6364CRN',
    name: '50A 125/250V Shore Power Inlet',
    quantity: 1,
    notes: 'Existing inlet corroded — stainless replacement',
    category_name: 'Electrical',
    listings: [
      { supplier: 'West Marine', sku: 'WM-6364CRN', price_cents: 18999, list_price_cents: 21999, in_stock: true, stock_qty: 4 },
    ],
    confirmed: true,
    status: 'installed',
    confidence: 0.95,
    intelligence: {
      context: {
        installation_notes: 'Kill shore power breaker at dock AND onboard main before removing. Check wire gauge — 50A requires #6 AWG minimum. Apply dielectric grease to new connections.',
        installation_time_pro: '1–1.5 hours',
        common_mistakes: 'Not isolating BOTH shore power sources before work. On a 52 Viking, there may be two inlets — verify which one you\'re replacing.',
      },
    },
    warnings: [],
  },
  {
    id: demoId('bom', 56),
    partId: 'charles-iso',
    manufacturer: 'Charles',
    mpn: '93-?"ISO12/50',
    name: 'Isolation Transformer 12kVA',
    quantity: 1,
    notes: 'Galvanic isolator failed — upgrading to full transformer',
    category_name: 'Electrical',
    listings: [
      { supplier: 'Defender', sku: 'DEF-ISO12', price_cents: 289999, list_price_cents: 319999, in_stock: true, stock_qty: 2 },
    ],
    confirmed: true,
    status: 'installed',
    confidence: 0.88,
    intelligence: {
      context: {
        installation_notes: 'Heavy unit (85 lbs) — mount on vibration pads in engine room. Wire per ABYC E-11. Requires dedicated 50A breaker. Ground to vessel\'s bonding system. Have ABYC-certified tech verify wiring.',
        installation_time_pro: '4–6 hours',
        compatibility_warning: 'Verify total AC load does not exceed 12kVA — this Viking may pull 10kVA+ with all systems running',
      },
      sourcing: { estimated_price_range: '$2,800–$3,200' },
    },
    warnings: [
      {
        type: 'price_check',
        severity: 'info',
        message: 'High-value item — verify sizing against actual AC load before final order',
      },
    ],
  },
];

const vikingSpiritJob: Job = {
  id: 'demo_vikingspirit',
  name: 'Viking Spirit — Feb 8',
  vessel: 'Viking Spirit',
  vesselId: 'vessel_vs',
  vesselContext: {
    name: 'Viking Spirit',
    make: 'Viking',
    model: '52 Convertible',
    year: 2008,
    voltage: 24,
    engine: 'Twin MAN V8-1000',
    fuel_type: 'Diesel',
    hull_material: 'Fiberglass',
  },
  client: 'Northeast Marine Group',
  status: 'complete',
  priority: 'critical',
  createdAt: FEB_8,
  updatedAt: FEB_8_LATE,
  startedAt: FEB_8,
  completedAt: FEB_8_LATE,
  photos: [
    {
      id: demoId('photo', 50),
      file: '',
      filename: 'generator_compartment.jpg',
      uploadedAt: FEB_8,
      status: 'identified',
      identifiedParts: [],
      notes: 'Onan 11.5 kW generator — 500 hour service due',
      photoType: 'identification',
    },
    {
      id: demoId('photo', 51),
      file: '',
      filename: 'shore_power_inlet.jpg',
      uploadedAt: FEB_8,
      status: 'identified',
      identifiedParts: [],
      notes: 'Shore power inlet — heavy green corrosion on pins',
      photoType: 'identification',
    },
  ],
  bom: vikingSpiritBOM,
  installations: [
    {
      id: demoId('inst', 50),
      jobItemId: demoId('bom', 50),
      vesselId: 'vessel_vs',
      installedAt: FEB_8_LATE,
      hoursTaken: 0.5,
      outcome: 'success',
      outcomeNotes: 'Generator oil and filter changed. Oil was dark but not contaminated.',
      verified: true,
      verifiedAt: FEB_8_LATE,
    },
    {
      id: demoId('inst', 51),
      jobItemId: demoId('bom', 55),
      vesselId: 'vessel_vs',
      installedAt: FEB_8_LATE,
      hoursTaken: 1.5,
      outcome: 'success',
      outcomeNotes: 'Shore power inlet replaced. Existing wiring in good condition — reused.',
      verified: true,
      verifiedAt: FEB_8_LATE,
    },
    {
      id: demoId('inst', 52),
      jobItemId: demoId('bom', 56),
      vesselId: 'vessel_vs',
      installedAt: FEB_8_LATE,
      hoursTaken: 5,
      outcome: 'success',
      outcomeNotes: 'Isolation transformer installed and tested. All circuits reading correctly. No stray current detected.',
      verified: true,
      verifiedAt: FEB_8_LATE,
    },
  ],
  notes: 'Full generator 500-hour service plus shore power system upgrade. Owner reported corrosion and galvanic issues. Isolation transformer should resolve stray current problem that was eating zincs.',
  lessonsLearned: 'Viking 52 engine room is tight but workable. The Charles transformer barely fits in the forward compartment — measure clearances carefully. Vibration pads are critical at this weight.',
  estimatedHours: 12,
  actualHours: 10,
  estimatedCostCents: 450000,
  actualCostCents: 438700,
  progress: 100,
};

// ============================================================================
// EXPORTS
// ============================================================================

export function getDemoJobs(): Job[] {
  return [blackBearJob, ladyGraceJob, tenaciousJob, dockHolidayJob, seaSprayJob, vikingSpiritJob];
}

const DEMO_DATA_VERSION = 2;

/**
 * Load jobs from localStorage, or seed with demo data if empty or outdated.
 */
export function ensureDemoData(existingJobs: Job[]): Job[] {
  if (typeof window === 'undefined') return existingJobs.length > 0 ? existingJobs : getDemoJobs();
  
  const storedVersion = localStorage.getItem('picsea_demo_version');
  const currentVersion = storedVersion ? parseInt(storedVersion, 10) : 0;
  
  // Re-seed if empty or demo data version changed
  if (existingJobs.length === 0 || currentVersion < DEMO_DATA_VERSION) {
    localStorage.setItem('picsea_demo_version', String(DEMO_DATA_VERSION));
    return getDemoJobs();
  }
  
  return existingJobs;
}
