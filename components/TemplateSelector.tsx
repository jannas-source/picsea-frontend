"use client";

import React, { useState } from "react";
import { JobTemplate } from "@/lib/types";
import { FileText, Clock, DollarSign, Package, ChevronDown, ChevronUp, Zap } from "lucide-react";

interface TemplateSelectorProps {
  templates: JobTemplate[];
  onSelect: (template: JobTemplate) => void;
  onSkip: () => void;
}

export function TemplateSelector({ templates, onSelect, onSkip }: TemplateSelectorProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[var(--cyan)]" />
          <span className="text-sm font-semibold">Start from Template</span>
        </div>
        <button onClick={onSkip} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
          Blank Job →
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {templates.map(t => (
          <div key={t.id} className="glass rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              className="w-full p-3 text-left hover:bg-[var(--surface-2)] transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  {t.description && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{t.description}</p>}
                </div>
                {expanded === t.id ? <ChevronUp className="w-3 h-3 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)]" />}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                  <Package className="w-3 h-3" />{t.defaultParts.length} parts
                </span>
                {(t.avgActualHours || t.estimatedHours) && (
                  <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />{t.avgActualHours || t.estimatedHours}h
                  </span>
                )}
                {t.timesUsed > 0 && (
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    Used {t.timesUsed}x
                  </span>
                )}
              </div>
            </button>
            
            {expanded === t.id && (
              <div className="px-3 pb-3 fade-in">
                <div className="border-t border-[var(--border)] pt-2 mb-2">
                  {t.defaultParts.map((p, i) => (
                    <div key={i} className="text-xs text-[var(--text-secondary)] py-0.5 flex justify-between">
                      <span>{p.manufacturer} {p.mpn}</span>
                      <span className="text-[var(--text-tertiary)]">×{p.quantity}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onSelect(t)}
                  className="w-full px-3 py-2 bg-[var(--cyan)] text-[var(--abyss)] text-xs font-semibold rounded-lg"
                >
                  Use Template
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
