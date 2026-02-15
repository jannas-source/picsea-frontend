"use client";

import React, { useState } from "react";
import {
  Ship, Zap, Anchor, Wrench, ChevronDown, ChevronUp,
  Plus, Trash2, MapPin, Save, AlertTriangle
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface EngineSpec {
  manufacturer: string;
  model: string;
  year: number | '';
  fuel_type: "gas" | "diesel" | "";
}

export interface VesselContext {
  // Basic info
  make: string;
  model: string;
  year: number | '';
  hull_material: string;
  
  // Electrical system
  electrical_voltage: "12V" | "24V" | "32V" | "other" | "";
  battery_banks: number | '';
  
  // Propulsion
  engines: EngineSpec[];
  
  // Plumbing standards
  thread_standard: "NPT" | "BSP" | "Metric" | "mixed" | "";
  raw_water_cooling: boolean;
  
  // Optional
  location: string;
  usage: "recreational" | "commercial" | "racing" | "";
  
  // Meta
  name: string; // vessel name for display
}

export const EMPTY_VESSEL: VesselContext = {
  make: '', model: '', year: '', hull_material: '',
  electrical_voltage: '', battery_banks: '',
  engines: [{ manufacturer: '', model: '', year: '', fuel_type: '' }],
  thread_standard: '', raw_water_cooling: false,
  location: '', usage: '',
  name: '',
};

const EMPTY_ENGINE: EngineSpec = { manufacturer: '', model: '', year: '', fuel_type: '' };

// ============================================================================
// COMMON VESSEL MAKES (quick-fill)
// ============================================================================

const COMMON_MAKES = [
  "Boston Whaler", "Grady-White", "Sea Ray", "Bertram", "Viking",
  "Regulator", "Yellowfin", "Contender", "Everglades", "Hinckley",
  "Sabre", "Back Cove", "MJM", "Chris-Craft", "Bayliner",
  "Scout", "Robalo", "Pursuit", "Cobia", "Sportsman"
];

const ENGINE_MAKES = [
  "Mercury", "Yamaha", "Suzuki", "Honda", "Evinrude",
  "Volvo Penta", "Cummins", "Caterpillar", "John Deere",
  "Yanmar", "Perkins", "MAN", "MTU"
];

// ============================================================================
// VESSEL CONTEXT FORM
// ============================================================================

interface VesselContextFormProps {
  vessel: VesselContext;
  onChange: (vessel: VesselContext) => void;
  onSave?: (vessel: VesselContext) => void;
  compact?: boolean;
}

export function VesselContextForm({ vessel, onChange, onSave, compact = false }: VesselContextFormProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    electrical: false,
    engines: false,
    plumbing: false,
    optional: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const update = (changes: Partial<VesselContext>) => {
    onChange({ ...vessel, ...changes });
  };

  const updateEngine = (index: number, changes: Partial<EngineSpec>) => {
    const engines = [...vessel.engines];
    engines[index] = { ...engines[index], ...changes };
    update({ engines });
  };

  const addEngine = () => {
    update({ engines: [...vessel.engines, { ...EMPTY_ENGINE }] });
  };

  const removeEngine = (index: number) => {
    if (vessel.engines.length <= 1) return;
    update({ engines: vessel.engines.filter((_, i) => i !== index) });
  };

  // Completeness indicator
  const filledFields = [
    vessel.make, vessel.model, vessel.year,
    vessel.electrical_voltage,
    vessel.engines[0]?.manufacturer,
    vessel.thread_standard,
  ].filter(Boolean).length;
  const totalFields = 6;
  const completeness = Math.round((filledFields / totalFields) * 100);

  // Compatibility coverage
  const hasVoltage = !!vessel.electrical_voltage;
  const hasThreads = !!vessel.thread_standard;
  const hasEngines = vessel.engines.some(e => e.manufacturer && e.fuel_type);
  const coverageItems = [
    { label: 'Voltage checks', active: hasVoltage },
    { label: 'Thread compatibility', active: hasThreads },
    { label: 'Engine/fuel matching', active: hasEngines },
  ];

  return (
    <div className={`space-y-3 ${compact ? '' : ''}`}>
      {/* Completeness bar */}
      {!compact && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${completeness}%`,
                backgroundColor: completeness >= 80 ? 'var(--success)' : completeness >= 40 ? 'var(--warning)' : 'var(--text-tertiary)',
              }}
            />
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">{completeness}% complete</span>
        </div>
      )}

      {/* Compatibility coverage badges */}
      {!compact && completeness > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {coverageItems.map(item => (
            <span
              key={item.label}
              className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                item.active
                  ? 'bg-green-500/15 text-green-400'
                  : 'bg-[var(--surface-2)] text-[var(--text-tertiary)]'
              }`}
            >
              {item.active ? '✓' : '○'} {item.label}
            </span>
          ))}
        </div>
      )}

      {/* ---- BASIC INFO ---- */}
      <AccordionSection
        title="Vessel Info"
        icon={Ship}
        expanded={expandedSections.basic}
        onToggle={() => toggleSection('basic')}
        badge={vessel.make && vessel.model ? `${vessel.make} ${vessel.model}` : undefined}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Vessel Name</Label>
            <input
              type="text"
              value={vessel.name}
              onChange={e => update({ name: e.target.value })}
              placeholder="e.g., BLACK BEAR"
              className="w-full"
            />
          </div>
          <div>
            <Label>Year</Label>
            <input
              type="number"
              value={vessel.year}
              onChange={e => update({ year: e.target.value ? parseInt(e.target.value) : '' })}
              placeholder="2018"
              min={1950}
              max={2030}
              className="w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <Label>Make</Label>
            <input
              type="text"
              list="vessel-makes"
              value={vessel.make}
              onChange={e => update({ make: e.target.value })}
              placeholder="e.g., Sea Ray"
              className="w-full"
            />
            <datalist id="vessel-makes">
              {COMMON_MAKES.map(m => <option key={m} value={m} />)}
            </datalist>
          </div>
          <div>
            <Label>Model</Label>
            <input
              type="text"
              value={vessel.model}
              onChange={e => update({ model: e.target.value })}
              placeholder="e.g., 350 Sundancer"
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-3">
          <Label>Hull Material</Label>
          <select
            value={vessel.hull_material}
            onChange={e => update({ hull_material: e.target.value })}
            className="w-full"
          >
            <option value="">Select...</option>
            <option value="fiberglass">Fiberglass</option>
            <option value="aluminum">Aluminum</option>
            <option value="steel">Steel</option>
            <option value="wood">Wood</option>
            <option value="composite">Composite</option>
          </select>
        </div>
      </AccordionSection>

      {/* ---- ELECTRICAL ---- */}
      <AccordionSection
        title="Electrical System"
        icon={Zap}
        expanded={expandedSections.electrical}
        onToggle={() => toggleSection('electrical')}
        badge={vessel.electrical_voltage || undefined}
        warning={!vessel.electrical_voltage ? "Voltage checks disabled" : undefined}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>DC Voltage</Label>
            <select
              value={vessel.electrical_voltage}
              onChange={e => update({ electrical_voltage: e.target.value as VesselContext['electrical_voltage'] })}
              className="w-full"
            >
              <option value="">Select...</option>
              <option value="12V">12V DC</option>
              <option value="24V">24V DC</option>
              <option value="32V">32V DC</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label>Battery Banks</Label>
            <input
              type="number"
              value={vessel.battery_banks}
              onChange={e => update({ battery_banks: e.target.value ? parseInt(e.target.value) : '' })}
              placeholder="2"
              min={1}
              max={10}
              className="w-full"
            />
          </div>
        </div>
      </AccordionSection>

      {/* ---- ENGINES ---- */}
      <AccordionSection
        title="Propulsion"
        icon={Anchor}
        expanded={expandedSections.engines}
        onToggle={() => toggleSection('engines')}
        badge={vessel.engines[0]?.manufacturer ? `${vessel.engines.length} engine${vessel.engines.length > 1 ? 's' : ''}` : undefined}
      >
        {vessel.engines.map((engine, i) => (
          <div key={i} className={`${i > 0 ? 'mt-4 pt-4 border-t border-[var(--border)]' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                Engine {i + 1}
              </span>
              {vessel.engines.length > 1 && (
                <button onClick={() => removeEngine(i)} className="text-[var(--text-tertiary)] hover:text-[var(--danger)]">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Manufacturer</Label>
                <input
                  type="text"
                  list="engine-makes"
                  value={engine.manufacturer}
                  onChange={e => updateEngine(i, { manufacturer: e.target.value })}
                  placeholder="e.g., Mercury"
                  className="w-full"
                />
              </div>
              <div>
                <Label>Model</Label>
                <input
                  type="text"
                  value={engine.model}
                  onChange={e => updateEngine(i, { model: e.target.value })}
                  placeholder="e.g., 8.2 MAG HO"
                  className="w-full"
                />
              </div>
              <div>
                <Label>Year</Label>
                <input
                  type="number"
                  value={engine.year}
                  onChange={e => updateEngine(i, { year: e.target.value ? parseInt(e.target.value) : '' })}
                  placeholder="2018"
                  min={1950}
                  max={2030}
                  className="w-full"
                />
              </div>
              <div>
                <Label>Fuel Type</Label>
                <select
                  value={engine.fuel_type}
                  onChange={e => updateEngine(i, { fuel_type: e.target.value as EngineSpec['fuel_type'] })}
                  className="w-full"
                >
                  <option value="">Select...</option>
                  <option value="gas">Gasoline</option>
                  <option value="diesel">Diesel</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <datalist id="engine-makes">
          {ENGINE_MAKES.map(m => <option key={m} value={m} />)}
        </datalist>
        <button
          onClick={addEngine}
          className="mt-3 flex items-center gap-1.5 text-xs text-[var(--cyan)] hover:underline"
        >
          <Plus className="w-3 h-3" /> Add engine
        </button>
      </AccordionSection>

      {/* ---- PLUMBING ---- */}
      <AccordionSection
        title="Plumbing Standards"
        icon={Wrench}
        expanded={expandedSections.plumbing}
        onToggle={() => toggleSection('plumbing')}
        badge={vessel.thread_standard || undefined}
        warning={!vessel.thread_standard ? "Thread checks disabled" : undefined}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Thread Standard</Label>
            <select
              value={vessel.thread_standard}
              onChange={e => update({ thread_standard: e.target.value as VesselContext['thread_standard'] })}
              className="w-full"
            >
              <option value="">Select...</option>
              <option value="NPT">NPT (US standard)</option>
              <option value="BSP">BSP (British/metric)</option>
              <option value="Metric">Metric</option>
              <option value="mixed">Mixed / Unknown</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={vessel.raw_water_cooling}
                onChange={e => update({ raw_water_cooling: e.target.checked })}
                className="accent-[var(--cyan)]"
              />
              Raw water cooling
            </label>
          </div>
        </div>
      </AccordionSection>

      {/* ---- OPTIONAL ---- */}
      <AccordionSection
        title="Location & Usage"
        icon={MapPin}
        expanded={expandedSections.optional}
        onToggle={() => toggleSection('optional')}
        badge={vessel.location || undefined}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Home Port / Region</Label>
            <input
              type="text"
              value={vessel.location}
              onChange={e => update({ location: e.target.value })}
              placeholder="e.g., Portland, ME"
              className="w-full"
            />
          </div>
          <div>
            <Label>Usage Type</Label>
            <select
              value={vessel.usage}
              onChange={e => update({ usage: e.target.value as VesselContext['usage'] })}
              className="w-full"
            >
              <option value="">Select...</option>
              <option value="recreational">Recreational</option>
              <option value="commercial">Commercial</option>
              <option value="racing">Racing</option>
            </select>
          </div>
        </div>
      </AccordionSection>

      {/* Save button */}
      {onSave && (
        <button
          onClick={() => onSave(vessel)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--cyan)] text-[var(--abyss)] font-semibold text-sm rounded-lg hover:shadow-[0_0_20px_var(--cyan-glow)] transition-all mt-4"
        >
          <Save className="w-4 h-4" />
          Save Vessel Profile
        </button>
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">
      {children}
    </label>
  );
}

interface AccordionSectionProps {
  title: string;
  icon: React.ElementType;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  warning?: string;
}

function AccordionSection({ title, icon: Icon, expanded, onToggle, children, badge, warning }: AccordionSectionProps) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors"
      >
        <Icon className="w-4 h-4 text-[var(--cyan)]" />
        <span className="text-sm font-semibold flex-1 text-left">{title}</span>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--cyan)]/10 text-[var(--cyan)] font-medium">
            {badge}
          </span>
        )}
        {warning && !badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" />
            {warning}
          </span>
        )}
        {expanded ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VESSEL STORAGE HELPERS
// ============================================================================

const VESSELS_KEY = 'picsea_vessels';

export function loadSavedVessels(): VesselContext[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VESSELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveVessel(vessel: VesselContext): void {
  if (typeof window === 'undefined') return;
  const existing = loadSavedVessels();
  // Update if same name exists, otherwise add
  const idx = existing.findIndex(v => v.name === vessel.name);
  if (idx >= 0) existing[idx] = vessel;
  else existing.push(vessel);
  localStorage.setItem(VESSELS_KEY, JSON.stringify(existing));
}

export function deleteVessel(name: string): void {
  if (typeof window === 'undefined') return;
  const existing = loadSavedVessels().filter(v => v.name !== name);
  localStorage.setItem(VESSELS_KEY, JSON.stringify(existing));
}

// Convert VesselContext to the format the identify API expects
export function vesselContextToAPI(vessel: VesselContext): Record<string, any> {
  return {
    name: vessel.name,
    make: vessel.make,
    model: vessel.model,
    year: vessel.year,
    voltage: vessel.electrical_voltage?.replace('V', '') || undefined,
    engine: vessel.engines.map(e => `${e.manufacturer} ${e.model}`).filter(s => s.trim()).join(', '),
    fuel_type: vessel.engines[0]?.fuel_type || undefined,
    hull_material: vessel.hull_material || undefined,
    thread_standard: vessel.thread_standard || undefined,
    systems: vessel.raw_water_cooling ? 'Raw water cooling' : undefined,
  };
}
