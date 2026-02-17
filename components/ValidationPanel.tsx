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
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
        style={{
          background: 'rgba(248, 113, 113, 0.12)',
          color: '#F87171',
          border: '1px solid rgba(248, 113, 113, 0.2)',
          fontFamily: 'Montserrat, sans-serif',
          animation: 'status-pulse-danger 2.5s ease-in-out infinite',
        }}
      >
        <XCircle className="w-3 h-3" />
        {errors.length} issue{errors.length > 1 ? 's' : ''}
      </span>
    );
  }

  if (warns.length > 0) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
        style={{
          background: 'rgba(251, 191, 36, 0.12)',
          color: '#FBBF24',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          fontFamily: 'Montserrat, sans-serif',
          animation: 'status-pulse-warning 3s ease-in-out infinite',
        }}
      >
        <AlertTriangle className="w-3 h-3" />
        {warns.length} warning{warns.length > 1 ? 's' : ''}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(0, 150, 255, 0.12)',
        color: '#60A5FA',
        border: '1px solid rgba(0, 150, 255, 0.2)',
      }}
    >
      <Info className="w-3 h-3" />
      {warnings.length} note{warnings.length > 1 ? 's' : ''}
    </span>
  );
}

// ============================================================================
// WARNING LIST
// ============================================================================

interface WarningListProps {
  warnings: ValidationWarning[];
  onDismiss?: (index: number) => void;
}

export function WarningList({ warnings, onDismiss }: WarningListProps) {
  if (warnings.length === 0) return null;

  const iconMap = {
    error:   <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#F87171' }} />,
    warning: <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#FBBF24' }} />,
    info:    <Info className="w-4 h-4 flex-shrink-0" style={{ color: '#60A5FA' }} />,
  };

  const bgMap = {
    error:   { background: 'rgba(248, 113, 113, 0.06)',  border: '1px solid rgba(248, 113, 113, 0.2)',  animation: 'status-pulse-danger 3s ease-in-out infinite' },
    warning: { background: 'rgba(251, 191, 36, 0.06)',   border: '1px solid rgba(251, 191, 36, 0.2)',   animation: 'status-pulse-warning 3s ease-in-out infinite' },
    info:    { background: 'rgba(0, 150, 255, 0.06)',    border: '1px solid rgba(0, 150, 255, 0.15)',   animation: 'none' },
  };

  return (
    <div className="space-y-2">
      {warnings.map((w, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-xl"
          style={bgMap[w.severity]}
        >
          {iconMap[w.severity]}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80">{w.message}</p>
            {w.parts && w.parts.length > 0 && (
              <div className="mt-2 space-y-1">
                {w.parts.map((p, j) => (
                  <div key={j} className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium">{p.manufacturer} {p.mpn}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>— {p.name}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>({p.frequency})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(i)}
              className="text-sm transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)')}
            >
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
  { key: 'pending',   label: 'Pending' },
  { key: 'ordered',   label: 'Ordered' },
  { key: 'received',  label: 'Received' },
  { key: 'installed', label: 'Installed' },
  { key: 'verified',  label: 'Verified' },
];

interface ItemStatusTrackerProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function ItemStatusTracker({ status, onStatusChange }: ItemStatusTrackerProps) {
  const currentIdx = statusSteps.findIndex(s => s.key === status);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {statusSteps.map((step, i) => {
        const isComplete = i < currentIdx;
        const isCurrent = i === currentIdx;

        let style: React.CSSProperties = {
          background: 'rgba(0, 43, 69, 0.4)',
          color: 'var(--text-tertiary)',
          border: '1px solid rgba(255,255,255,0.06)',
        };
        if (isComplete) style = {
          background: 'rgba(52, 211, 153, 0.12)',
          color: '#34D399',
          border: '1px solid rgba(52, 211, 153, 0.2)',
        };
        if (isCurrent) style = {
          background: 'rgba(0, 240, 255, 0.1)',
          color: '#00F0FF',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          boxShadow: '0 0 8px rgba(0, 240, 255, 0.1)',
        };

        return (
          <React.Fragment key={step.key}>
            <button
              onClick={() => onStatusChange(step.key)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
              style={style}
            >
              {isComplete && <CheckCircle className="w-3 h-3" />}
              {step.label}
            </button>
            {i < statusSteps.length - 1 && (
              <div
                className="w-3 h-px"
                style={{ background: isComplete ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255,255,255,0.08)' }}
              />
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
  onSubmit: (data: { hoursTaken: number; outcome: string; notes: string }) => void;
  onCancel: () => void;
}

export function InstallCapture({ itemId, partName, onSubmit, onCancel }: InstallCaptureProps) {
  const [hours, setHours] = useState('');
  const [outcome, setOutcome] = useState<'success' | 'partial' | 'failed'>('success');
  const [notes, setNotes] = useState('');

  type OutcomeState = { active: React.CSSProperties; inactive: React.CSSProperties };
  const outcomeStyles: Record<string, OutcomeState> = {
    success: {
      active:   { background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', border: '1px solid rgba(52, 211, 153, 0.3)', boxShadow: '0 0 8px rgba(52, 211, 153, 0.2)' },
      inactive: { background: 'rgba(0, 43, 69, 0.3)', color: 'var(--text-tertiary)' as string, border: '1px solid rgba(255,255,255,0.06)' },
    },
    partial: {
      active:   { background: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', border: '1px solid rgba(251, 191, 36, 0.3)', boxShadow: '0 0 8px rgba(251, 191, 36, 0.2)' },
      inactive: { background: 'rgba(0, 43, 69, 0.3)', color: 'var(--text-tertiary)' as string, border: '1px solid rgba(255,255,255,0.06)' },
    },
    failed: {
      active:   { background: 'rgba(248, 113, 113, 0.15)', color: '#F87171', border: '1px solid rgba(248, 113, 113, 0.3)', boxShadow: '0 0 8px rgba(248, 113, 113, 0.2)' },
      inactive: { background: 'rgba(0, 43, 69, 0.3)', color: 'var(--text-tertiary)' as string, border: '1px solid rgba(255,255,255,0.06)' },
    },
  };

  return (
    <div
      className="rounded-xl p-5 fade-in"
      style={{
        background: 'rgba(0, 26, 46, 0.6)',
        border: '1px solid rgba(0, 240, 255, 0.12)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5" style={{ color: '#00F0FF' }} />
        <h3
          className="text-sm font-bold"
          style={{ color: '#00F0FF', fontFamily: 'Montserrat, sans-serif' }}
        >
          Installation Capture: {partName}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label-upper block mb-1.5">
            <Clock className="w-3 h-3 inline mr-1" />Time (hours)
          </label>
          <input type="number" step="0.25" value={hours} onChange={e => setHours(e.target.value)} placeholder="1.5" className="w-full" />
        </div>
        <div>
          <label className="label-upper block mb-1.5">Outcome</label>
          <div className="flex gap-2">
            {(['success', 'partial', 'failed'] as const).map(o => (
              <button
                key={o}
                onClick={() => setOutcome(o)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                style={outcomeStyles[o][outcome === o ? 'active' : 'inactive']}
              >
                {o === 'success' ? '✓ OK' : o === 'partial' ? '⚠ Partial' : '✗ Failed'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="label-upper block mb-1.5">
          <MessageSquare className="w-3 h-3 inline mr-1" />Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Issues, tips, or things to remember..."
          rows={3}
          className="w-full"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs transition-colors" style={{ color: 'var(--text-tertiary)' }}>
          Cancel
        </button>
        <button
          onClick={() => onSubmit({ hoursTaken: parseFloat(hours) || 0, outcome, notes })}
          className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
          style={{ background: 'var(--cyan)', color: 'var(--abyss)', fontFamily: 'Montserrat, sans-serif' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-sm)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
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
  score: number;
  showLabel?: boolean;
}

export function ConfidenceIndicator({ score, showLabel = true }: ConfidenceProps) {
  const pct = Math.round(score * 100);

  let color: string;
  let dotBg: string;
  let animation: string;

  if (pct >= 90) {
    color = '#34D399';
    dotBg = '#34D399';
    animation = 'status-pulse-success 2.5s ease-in-out infinite';
  } else if (pct >= 70) {
    color = '#FBBF24';
    dotBg = '#FBBF24';
    animation = 'status-pulse-warning 2.5s ease-in-out infinite';
  } else {
    color = '#F87171';
    dotBg = '#F87171';
    animation = 'status-pulse-danger 2s ease-in-out infinite';
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotBg, animation }} />
      {pct}%
      {showLabel && pct < 90 && (
        <span style={{ color: 'var(--text-tertiary)' }}>— verify before ordering</span>
      )}
    </span>
  );
}

// ============================================================================
// PART INTELLIGENCE PANEL
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
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(0, 18, 34, 0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* AI Safety Disclaimer */}
      <div
        className="px-3 py-2 flex items-start gap-2"
        style={{
          background: 'rgba(251, 191, 36, 0.06)',
          borderBottom: '1px solid rgba(251, 191, 36, 0.12)',
        }}
      >
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#FBBF24' }} />
        <div className="text-[10px] leading-relaxed" style={{ color: 'rgba(251, 191, 36, 0.85)' }}>
          <span className="font-bold">⚠ AI-generated guidance.</span> Always verify specs with manufacturer documentation before installation.
          <span className="block mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            Source: {isExpertSourced ? `📚 ${sourceLabel}` : `🤖 ${sourceLabel}`}
          </span>
        </div>
      </div>

      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left transition-colors duration-150"
        style={{ background: 'transparent' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" style={{ color: '#00F0FF' }} />
          <span className="text-xs font-bold" style={{ color: '#00F0FF', fontFamily: 'Montserrat, sans-serif' }}>
            AI Intelligence
          </span>
          {isExpertSourced && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#34D399' }}
            >
              Expert
            </span>
          )}
          {hasWarnings && (
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FBBF24', animation: 'status-pulse-warning 2s ease-in-out infinite' }} />
          )}
          {hasUpgrade && <ArrowUpCircle className="w-3 h-3" style={{ color: '#60A5FA' }} />}
        </div>
        {expanded
          ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
          : <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
        }
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 text-xs fade-in">
          {/* Compatibility Warning */}
          {ctx?.compatibility_warning && (
            <div
              className="flex items-start gap-2 p-2 rounded-lg"
              style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.15)' }}
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#FBBF24' }} />
              <div>
                <div className="font-bold mb-0.5" style={{ color: '#FBBF24', fontFamily: 'Montserrat, sans-serif' }}>
                  Compatibility
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{ctx.compatibility_warning}</div>
              </div>
            </div>
          )}

          {/* Companion parts */}
          {ctx?.companion_parts && ctx.companion_parts.length > 0 && (
            <div
              className="flex items-start gap-2 p-2 rounded-lg"
              style={{ background: 'rgba(0, 150, 255, 0.08)', border: '1px solid rgba(0, 150, 255, 0.12)' }}
            >
              <Package className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#60A5FA' }} />
              <div>
                <div className="font-bold mb-0.5" style={{ color: '#60A5FA', fontFamily: 'Montserrat, sans-serif' }}>
                  Order Together
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{ctx.companion_parts.join(' · ')}</div>
              </div>
            </div>
          )}

          {/* Failure intel */}
          {ctx?.failure_mode && (
            <div>
              <div
                className="font-bold uppercase tracking-wider mb-1"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'Montserrat, sans-serif' }}
              >
                Why It Fails
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>{ctx.failure_mode}</div>
              {ctx.failure_timeline && <div style={{ color: 'var(--text-tertiary)' }} className="mt-0.5">⏱ {ctx.failure_timeline}</div>}
              {ctx.failure_consequence && <div style={{ color: 'rgba(248, 113, 113, 0.8)' }} className="mt-0.5">⚠ {ctx.failure_consequence}</div>}
            </div>
          )}

          {/* Installation guidance */}
          {ctx?.installation_notes && (
            <div>
              <div
                className="font-bold uppercase tracking-wider mb-1"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'Montserrat, sans-serif' }}
              >
                <Wrench className="w-3 h-3 inline mr-1" />Installation
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>{ctx.installation_notes}</div>
              <div className="flex gap-3 mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {ctx.installation_time_pro && <span>Pro: {ctx.installation_time_pro}</span>}
                {ctx.installation_time_diy && <span>DIY: {ctx.installation_time_diy}</span>}
              </div>
            </div>
          )}

          {/* Common mistakes */}
          {ctx?.common_mistakes && (
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(248, 113, 113, 0.06)', border: '1px solid rgba(248, 113, 113, 0.12)' }}
            >
              <div
                className="font-bold mb-0.5"
                style={{ color: 'rgba(248, 113, 113, 0.8)', fontFamily: 'Montserrat, sans-serif' }}
              >
                ❌ Common Mistakes
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>{ctx.common_mistakes}</div>
            </div>
          )}

          {/* Upgrade */}
          {ctx?.upgrade_recommendation && (
            <div>
              <div
                className="font-bold uppercase tracking-wider mb-1"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'Montserrat, sans-serif' }}
              >
                <ArrowUpCircle className="w-3 h-3 inline mr-1" />Upgrade Option
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>{ctx.upgrade_recommendation}</div>
            </div>
          )}

          {/* Sourcing */}
          {src && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 4 }}>
              <div
                className="font-bold uppercase tracking-wider mb-1"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'Montserrat, sans-serif' }}
              >
                Sourcing
              </div>
              <div className="space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
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
            <div
              className="italic pt-1"
              style={{ color: 'var(--text-tertiary)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}
            >
              ID basis: {intelligence.confidence_reasoning}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
