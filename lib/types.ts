// ============================================================================
// CORE TYPES
// ============================================================================

export interface Listing {
  supplier: string;
  sku: string;
  price_cents: number;
  list_price_cents: number;
  in_stock: boolean;
  stock_qty: number;
}

export interface OrderingOption {
  supplier: string;
  priority: number;
  type: 'primary' | 'fallback';
  action: 'request_quote' | 'search' | 'affiliate_search';
  url: string | null;
  commission_estimate: string;
  cwr_part_number?: string | null;
}

export interface IdentifiedPart {
  id: string;
  manufacturer: string;
  mpn: string;
  name: string;
  confidence: number;
  category_name?: string;
  listings?: Listing[];
  intelligence?: PartIntelligence;
  ordering_options?: OrderingOption[];
}

// ============================================================================
// BOM ITEMS (with verification status)
// ============================================================================

export interface PartIntelligence {
  context?: {
    failure_mode?: string;
    failure_timeline?: string;
    failure_consequence?: string;
    upgrade_recommendation?: string;
    installation_notes?: string;
    installation_time_pro?: string;
    installation_time_diy?: string;
    compatibility_warning?: string;
    companion_parts?: string[];
    common_mistakes?: string;
  };
  sourcing?: {
    preferred_supplier_type?: string;
    material_preference?: string;
    verification_needed?: string;
    cross_reference?: string;
    estimated_price_range?: string;
  };
  system_context?: string;
  job_recommendation?: string;
  confidence_reasoning?: string;
  source_attribution?: string;
  expert_knowledge?: any[];
}

export interface BOMItem {
  id: string;
  partId: string;
  manufacturer: string;
  mpn: string;
  name: string;
  quantity: number;
  notes: string;
  category_name?: string;
  listings?: Listing[];
  photoId?: string;
  confirmed: boolean;
  // Verification
  status: ItemStatus;
  supplier?: string;
  unitCostCents?: number;
  installerNotes?: string;
  confidence?: number;
  // AI Intelligence
  intelligence?: PartIntelligence;
  // Ordering options
  ordering_options?: OrderingOption[];
  // Warnings from pre-order validation
  warnings?: ValidationWarning[];
}

export type ItemStatus = 'pending' | 'ordered' | 'received' | 'installed' | 'verified' | 'failed';

// ============================================================================
// VALIDATION & COMPATIBILITY
// ============================================================================

export interface ValidationWarning {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  parts?: { manufacturer: string; mpn: string; name: string; frequency: string }[];
  data?: any;
}

export interface PreOrderValidation {
  valid: boolean;
  warnings: ValidationWarning[];
}

// ============================================================================
// PHOTOS
// ============================================================================

export interface JobPhoto {
  id: string;
  file: string; // data URL
  filename: string;
  uploadedAt: string;
  status: 'pending' | 'identifying' | 'identified' | 'failed';
  identifiedParts: IdentifiedPart[];
  notes: string;
  photoType?: 'identification' | 'before' | 'after' | 'documentation';
}

// ============================================================================
// INSTALLATIONS (post-install tracking)
// ============================================================================

export interface Installation {
  id: string;
  jobItemId: string;
  vesselId: string;
  partId?: string;
  installedAt: string;
  hoursTaken?: number;
  locationNotes?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  outcome: 'success' | 'partial' | 'failed' | 'pending';
  outcomeNotes?: string;
  verified: boolean;
  verifiedAt?: string;
}

// ============================================================================
// JOBS (extended with lifecycle tracking)
// ============================================================================

export interface VesselContext {
  name?: string;
  make?: string;
  model?: string;
  year?: number;
  voltage?: number;  // 12 or 24
  engine?: string;
  fuel_type?: string;
  hull_material?: string;
  thread_standard?: string; // NPT or BSP
  systems?: string;
}

export interface Job {
  id: string;
  name: string;
  vessel: string;
  vesselId?: string;
  vesselContext?: VesselContext;
  client: string;
  status: JobStatus;
  priority: 'low' | 'normal' | 'critical';
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  photos: JobPhoto[];
  bom: BOMItem[];
  installations: Installation[];
  notes: string;
  lessonsLearned: string;
  // Time & cost tracking
  estimatedHours?: number;
  actualHours?: number;
  estimatedCostCents?: number;
  actualCostCents?: number;
  // Computed
  progress?: number; // 0-100
}

export type JobStatus = 'draft' | 'active' | 'ordered' | 'installing' | 'complete';

// ============================================================================
// TEMPLATES
// ============================================================================

export interface JobTemplate {
  id: string;
  name: string;
  description?: string;
  systemPath?: string;
  defaultParts: TemplatePart[];
  estimatedHours?: number;
  estimatedCostCents?: number;
  avgActualHours?: number;
  avgActualCostCents?: number;
  timesUsed: number;
}

export interface TemplatePart {
  manufacturer: string;
  mpn: string;
  name: string;
  quantity: number;
  notes?: string;
}

// ============================================================================
// MAINTENANCE
// ============================================================================

export interface MaintenanceSchedule {
  id: string;
  vesselId: string;
  vesselName: string;
  partId?: string;
  partName?: string;
  description: string;
  intervalMonths?: number;
  intervalHours?: number;
  lastPerformedAt?: string;
  nextDueAt?: string;
  urgency?: 'overdue' | 'due_soon' | 'upcoming';
  basedOn: 'manual' | 'history' | 'manufacturer';
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface DashboardStats {
  jobs: {
    active_jobs: number;
    draft_jobs: number;
    completed_jobs: number;
    total_jobs: number;
  };
  upcoming_maintenance: MaintenanceSchedule[];
  recent_issues: ValidationEvent[];
  cost_summary: {
    total_spent: number;
    total_estimated: number;
    total_hours: number;
    total_estimated_hours: number;
    completed_count: number;
  };
}

export interface ValidationEvent {
  id: string;
  partId?: string;
  partName?: string;
  manufacturer?: string;
  mpn?: string;
  eventType: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export interface PartInsights {
  history: {
    timesOrdered: number;
    timesReturned: number;
    timesFailed: number;
    avgLifespanHours: number;
    avgInstallTimeHours: number;
    commonIssues: string[];
    alwaysOrderWith: string[];
    preferredSuppliers: string[];
    avoidSuppliers: string[];
    installTips: string[];
  } | null;
  validations: ValidationEvent[];
  installations: Installation[];
  relatedParts: { manufacturer: string; mpn: string; name: string; coOccurrenceCount: number }[];
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export interface UserPreferences {
  expertiseLevel: 'beginner' | 'intermediate' | 'professional';
  showInstallVideos: boolean;
  showTorqueSpecs: boolean;
  detailLevel: 'minimal' | 'standard' | 'detailed';
  batchOrdering: boolean;
}

// ============================================================================
// VIEWS
// ============================================================================

export type View = 'dashboard' | 'job' | 'analytics' | 'maintenance' | 'templates';
