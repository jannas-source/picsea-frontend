"use client";

import React, { useState } from "react";
import { BOMItem, ValidationWarning, Installation, PartIntelligence } from "@/lib/types";
import {
  AlertTriangle, AlertCircle, Info, CheckCircle, XCircle,
  ShieldCheck, Clock, Camera, MessageSquare, Star,
  Wrench, Zap, ArrowUpCircle, Package, ChevronDown, ChevronUp
} from "lucide-react";

// ============================================================================
// PRE-ORDER VALIDATION WARNINGS
// ============================================================================

interface WarningBadgeProps {
  warnings: ValidationWarning[];
}

export function WarningBadge({ warnings }: WarningBadgeProps) {
  if (warnings.length === 0) return null;
  
  const errors = warnings.filter(w => w.severity === 'error');
  const warns = warnings.filter(w => w.severity === 'warning');
  
  if (errors.length > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
        <XCircle className="w-3 h-3" />
        {errors.length} issue{errors.length > 1 ? 's' : ''}
      </span>
    );
  }
  
  if (warns.length > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
        <AlertTriangle className="w-3 h-3" />
        {warns.length} warning{warns.length > 1 ? 's' : ''}
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
      <Info className="w-3 h-3" />
      {warnings.length} note{warnings.length > 1 ? 's' : ''}
    </span>
  );
}

// ============================================================================
// WARNING LIST (expanded view)
// ============================================================================

interface WarningListProps {
  warnings: ValidationWarning[];
  onDismiss?: (index: number) => void;
}

export function WarningList({ warnings, onDismiss }: WarningListProps) {
  if (warnings.length === 0) return null;
  
  const iconMap = {
    error: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  };
  
  const bgMap = {
    error: 'border-red-500/30 bg-red-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    info: 'border-blue-500/30 bg-blue-500/5',
  };
  
  return (
    <div className="space-y-2">
      {warnings.map((w, i) => (
        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${bgMap[w.severity]}`}>
          {iconMap[w.severity]}
          <div className="flex-1 min-w-0">
            <p className="text-sm">{w.message}</p>
            {w.parts && w.parts.length > 0 && (
              <div className="mt-2 space-y-1">
                {w.parts.map((p, j) => (
                  <div key={j} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                    <span className="font-medium">{p.manufacturer} {p.mpn}</span>
                    <span className="text-[var(--text-tertiary)]">— {p.name}</span>
                    <span className="text-[var(--text-tertiary)]">({p.frequency})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {onDismiss && (
            <button onClick={() => onDismiss(i)} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ITEM STATUS TRACKER (pipeline view)
// ============================================================================

const statusSteps: { key: string; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'ordered', label: 'Ordered' },
  { key: 'received', label: 'Received' },
  { key: 'installed', label: 'Installed' },
  { key: 'verified', label: 'Verified' },
];

interface ItemStatusTrackerProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function ItemStatusTracker({ status, onStatusChange }: ItemStatusTrackerProps) {
  const currentIdx = statusSteps.findIndex(s => s.key === status);
  
  return (
    <div className="flex items-center gap-1">
      {statusSteps.map((step, i) => {
        const isComplete = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isFailed = status === 'failed';
        
        return (
          <React.Fragment key={step.key}>
            <button
              onClick={() => onStatusChange(step.key)}
              className={`
                flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all
                ${isComplete ? 'bg-[var(--success)]/20 text-[var(--success)]' : ''}
                ${isCurrent ? 'bg-[var(--cyan)]/20 text-[var(--cyan)] ring-1 ring-[var(--cyan)]/30' : ''}
                ${!isComplete && !isCurrent ? 'bg-[var(--surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]' : ''}
                ${isFailed ? 'bg-red-500/20 text-red-400' : ''}
              `}
              title={`Mark as ${step.label}`}
            >
              {isComplete ? <CheckCircle className="w-3 h-3" /> : null}
              {step.label}
            </button>
            {i < statusSteps.length - 1 && (
              <div className={`w-3 h-px ${isComplete ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// POST-INSTALL CAPTURE
// ============================================================================

interface InstallCaptureProps {
  itemId: string;
  partName: string;
  onSubmit: (data: {
    hoursTaken: number;
    outcome: string;
    notes: string;
  }) => void;
  onCancel: () => void;
}

export function InstallCapture({ itemId, partName, onSubmit, onCancel }: InstallCaptureProps) {
  const [hours, setHours] = useState('');
  const [outcome, setOutcome] = useState<'success' | 'partial' | 'failed'>('success');
  const [notes, setNotes] = useState('');
  
  return (
    <div className="glass rounded-xl p-5 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-[var(--cyan)]" />
        <h3 className="text-sm font-semibold">Installation Capture: {partName}</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">
            <Clock className="w-3 h-3 inline mr-1" />Time Taken (hours)
          </label>
          <input
            type="number"
            step="0.25"
            value={hours}
            onChange={e => setHours(e.target.value)}
            placeholder="1.5"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">
            Outcome
          </label>
          <div className="flex gap-2">
            {(['success', 'partial', 'failed'] as const).map(o => (
              <button
                key={o}
                onClick={() => setOutcome(o)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  outcome === o 
                    ? o === 'success' ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30'
                    : o === 'partial' ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                    : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                    : 'bg-[var(--surface-2)] text-[var(--text-tertiary)]'
                }`}
              >
                {o === 'success' ? '✓ Success' : o === 'partial' ? '⚠ Partial' : '✗ Failed'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">
          <MessageSquare className="w-3 h-3 inline mr-1" />Installer Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any issues, tips, or things to remember for next time..."
          rows={3}
          className="w-full"
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-[var(--text-tertiary)]">Cancel</button>
        <button
          onClick={() => onSubmit({ hoursTaken: parseFloat(hours) || 0, outcome, notes })}
          className="px-4 py-1.5 bg-[var(--cyan)] text-[var(--abyss)] text-xs font-semibold rounded-lg"
        >
          Record Installation
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// CONFIDENCE INDICATOR
// ============================================================================

interface ConfidenceProps {
  score: number; // 0-1
  showLabel?: boolean;
}

export function ConfidenceIndicator({ score, showLabel = true }: ConfidenceProps) {
  const pct = Math.round(score * 100);
  const color = pct >= 90 ? 'text-green-400' : pct >= 70 ? 'text-amber-400' : 'text-red-400';
  const bg = pct >= 90 ? 'bg-green-400' : pct >= 70 ? 'bg-amber-400' : 'bg-red-400';
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${bg}`} />
      {pct}%{showLabel && pct < 90 && <span className="text-[var(--text-tertiary)]">— verify before ordering</span>}
    </span>
  );
}

// ============================================================================
// PART INTELLIGENCE PANEL (rich AI intelligence display)
// ============================================================================

interface IntelligencePanelProps {
  intelligence: PartIntelligence;
  partName: string;
  compact?: boolean;
}

export function IntelligencePanel({ intelligence, partName, compact = false }: IntelligencePanelProps) {
  const [expanded, setExpanded] = useState(!compact);
  const ctx = intelligence.context;
  const src = intelligence.sourcing;
  
  if (!ctx && !src) return null;
  
  const hasWarnings = ctx?.compatibility_warning || ctx?.common_mistakes;
  const hasUpgrade = ctx?.upgrade_recommendation;
  const sourceLabel = intelligence.source_attribution || 'AI inference';
  const isExpertSourced = intelligence.expert_knowledge && intelligence.expert_knowledge.length > 0;
  
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* ⚠️ AI Safety Disclaimer — always visible */}
      <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[10px] text-amber-300/90 leading-relaxed">
          <span className="font-semibold">⚠️ AI-generated guidance.</span> Always verify torque specs and procedures with manufacturer documentation before installation.
          <span className="block mt-0.5 text-[var(--text-tertiary)]">
            Source: {isExpertSourced ? `📚 ${sourceLabel}` : `🤖 ${sourceLabel}`}
          </span>
        </div>
      </div>
      
      {/* Header - always visible */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-[var(--surface-hover)] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[var(--cyan)]" />
          <span className="text-xs font-semibold text-[var(--cyan)]">AI Intelligence</span>
          {isExpertSourced && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">Expert data</span>}
          {hasWarnings && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
          {hasUpgrade && <ArrowUpCircle className="w-3 h-3 text-blue-400" />}
        </div>
        {expanded ? <ChevronUp className="w-3 h-3 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)]" />}
      </button>
      
      {expanded && (
        <div className="px-3 pb-3 space-y-3 text-xs">
          {/* Compatibility Warning - most critical, show first */}
          {ctx?.compatibility_warning && (
            <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-400 mb-0.5">Compatibility Check</div>
                <div className="text-[var(--text-secondary)]">{ctx.compatibility_warning}</div>
              </div>
            </div>
          )}
          
          {/* Companion parts - prevents missing items */}
          {ctx?.companion_parts && ctx.companion_parts.length > 0 && (
            <div className="flex items-start gap-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
              <Package className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-400 mb-0.5">Order Together</div>
                <div className="text-[var(--text-secondary)]">{ctx.companion_parts.join(' • ')}</div>
              </div>
            </div>
          )}

          {/* Failure intelligence */}
          {ctx?.failure_mode && (
            <div>
              <div className="font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Why It Fails</div>
              <div className="text-[var(--text-secondary)]">{ctx.failure_mode}</div>
              {ctx.failure_timeline && <div className="text-[var(--text-tertiary)] mt-0.5">⏱ {ctx.failure_timeline}</div>}
              {ctx.failure_consequence && <div className="text-red-400/80 mt-0.5">⚠ If it fails: {ctx.failure_consequence}</div>}
            </div>
          )}
          
          {/* Installation guidance */}
          {ctx?.installation_notes && (
            <div>
              <div className="font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                <Wrench className="w-3 h-3 inline mr-1" />Installation
              </div>
              <div className="text-[var(--text-secondary)]">{ctx.installation_notes}</div>
              <div className="flex gap-3 mt-1 text-[var(--text-tertiary)]">
                {ctx.installation_time_pro && <span>Pro: {ctx.installation_time_pro}</span>}
                {ctx.installation_time_diy && <span>DIY: {ctx.installation_time_diy}</span>}
              </div>
            </div>
          )}
          
          {/* Common mistakes */}
          {ctx?.common_mistakes && (
            <div className="p-2 rounded bg-red-500/5 border border-red-500/15">
              <div className="font-semibold text-red-400/80 mb-0.5">❌ Common Mistakes</div>
              <div className="text-[var(--text-secondary)]">{ctx.common_mistakes}</div>
            </div>
          )}
          
          {/* Upgrade recommendation */}
          {ctx?.upgrade_recommendation && (
            <div>
              <div className="font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                <ArrowUpCircle className="w-3 h-3 inline mr-1" />Upgrade Option
              </div>
              <div className="text-[var(--text-secondary)]">{ctx.upgrade_recommendation}</div>
            </div>
          )}
          
          {/* Sourcing */}
          {src && (
            <div className="pt-2 border-t border-[var(--border)]">
              <div className="font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Sourcing</div>
              <div className="space-y-0.5 text-[var(--text-secondary)]">
                {src.preferred_supplier_type && <div>🏪 {src.preferred_supplier_type}</div>}
                {src.material_preference && <div>🔩 {src.material_preference}</div>}
                {src.verification_needed && <div>✅ Verify: {src.verification_needed}</div>}
                {src.cross_reference && <div>🔄 Alt: {src.cross_reference}</div>}
                {src.estimated_price_range && <div>💰 {src.estimated_price_range}</div>}
              </div>
            </div>
          )}

          {/* Confidence reasoning */}
          {intelligence.confidence_reasoning && (
            <div className="text-[var(--text-tertiary)] italic pt-1 border-t border-[var(--border)]">
              ID basis: {intelligence.confidence_reasoning}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
