"use client";

import React, { useState } from "react";
import { JobTemplate } from "@/lib/types";
import { Clock, Package, ChevronDown, ChevronUp, Zap } from "lucide-react";

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
          <Zap className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
          <span
            className="text-sm font-black uppercase tracking-wider"
            style={{ color: 'var(--cyan)', fontFamily: 'Montserrat, sans-serif' }}
          >
            Start from Template
          </span>
        </div>
        <button
          onClick={onSkip}
          className="text-xs transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)')}
        >
          Blank Job →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {templates.map(t => (
          <div
            key={t.id}
            className="rounded-xl overflow-hidden transition-all duration-200"
            style={{
              background: 'rgba(0, 26, 46, 0.5)',
              border: expanded === t.id ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <button
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              className="w-full p-3 text-left transition-all duration-150"
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0, 240, 255, 0.04)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-bold text-white truncate"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {t.name}
                  </p>
                  {t.description && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {t.description}
                    </p>
                  )}
                </div>
                {expanded === t.id
                  ? <ChevronUp className="w-3 h-3 flex-shrink-0 ml-1" style={{ color: 'var(--text-tertiary)' }} />
                  : <ChevronDown className="w-3 h-3 flex-shrink-0 ml-1" style={{ color: 'var(--text-tertiary)' }} />
                }
              </div>

              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                  <Package className="w-3 h-3" />
                  {t.defaultParts.length} parts
                </span>
                {(t.avgActualHours || t.estimatedHours) && (
                  <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                    <Clock className="w-3 h-3" />
                    {t.avgActualHours || t.estimatedHours}h
                  </span>
                )}
                {t.timesUsed > 0 && (
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    Used {t.timesUsed}×
                  </span>
                )}
              </div>
            </button>

            {expanded === t.id && (
              <div className="px-3 pb-3 fade-in">
                <div
                  className="pt-2 mb-2.5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {t.defaultParts.map((p, i) => (
                    <div
                      key={i}
                      className="text-xs py-0.5 flex justify-between"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span>{p.manufacturer} {p.mpn}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>×{p.quantity}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onSelect(t)}
                  className="w-full px-3 py-2 rounded-lg text-xs font-black transition-all duration-150"
                  style={{
                    background: 'var(--cyan)',
                    color: 'var(--abyss)',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-sm)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
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
