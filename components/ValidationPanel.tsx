"use client";

import React, { useState } from "react";
import { BOMItem, ValidationWarning, Installation } from "@/lib/types";
import {
  AlertTriangle, AlertCircle, Info, CheckCircle, XCircle,
  ShieldCheck, Clock, Camera, MessageSquare, Star
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
