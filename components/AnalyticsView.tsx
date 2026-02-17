"use client";

import React from "react";
import { Job } from "@/lib/types";
import {
  TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle,
  CheckCircle, BarChart3, Target
} from "lucide-react";

interface AnalyticsViewProps {
  jobs: Job[];
}

export function AnalyticsView({ jobs }: AnalyticsViewProps) {
  const completed = jobs.filter(j => j.status === 'complete');

  const totalEstimatedCost = completed.reduce((s, j) => s + (j.estimatedCostCents || 0), 0);
  const totalActualCost = completed.reduce((s, j) => s + (j.actualCostCents || 0), 0);
  const costAccuracy = totalEstimatedCost > 0 ? Math.round((totalActualCost / totalEstimatedCost) * 100) : 0;

  const totalEstimatedHours = completed.reduce((s, j) => s + (j.estimatedHours || 0), 0);
  const totalActualHours = completed.reduce((s, j) => s + (j.actualHours || 0), 0);
  const timeAccuracy = totalEstimatedHours > 0 ? Math.round((totalActualHours / totalEstimatedHours) * 100) : 0;

  const totalParts = jobs.reduce((s, j) => s + j.bom.length, 0);
  const verifiedParts = jobs.reduce((s, j) => s + j.bom.filter(b => b.status === 'verified').length, 0);
  const failedParts = jobs.reduce((s, j) => s + j.bom.filter(b => b.status === 'failed').length, 0);
  const warningCount = jobs.reduce((s, j) => s + j.bom.reduce((ws, b) => ws + (b.warnings?.length || 0), 0), 0);

  const metrics = [
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'Cost Accuracy',
      value: costAccuracy ? `${costAccuracy}%` : '—',
      detail: totalActualCost > 0 ? `$${(totalActualCost / 100).toLocaleString()} actual` : 'No data yet',
      color: costAccuracy > 110 ? '#FBBF24' : costAccuracy > 0 ? '#34D399' : 'var(--text-tertiary)',
      glow: costAccuracy > 110 ? 'rgba(251, 191, 36, 0.5)' : costAccuracy > 0 ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255,255,255,0.2)',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Time Accuracy',
      value: timeAccuracy ? `${timeAccuracy}%` : '—',
      detail: totalActualHours > 0 ? `${totalActualHours.toFixed(1)}h actual` : 'No data yet',
      color: timeAccuracy > 120 ? '#FBBF24' : timeAccuracy > 0 ? '#34D399' : 'var(--text-tertiary)',
      glow: timeAccuracy > 120 ? 'rgba(251, 191, 36, 0.5)' : timeAccuracy > 0 ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255,255,255,0.2)',
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Parts Verified',
      value: totalParts > 0 ? `${Math.round((verifiedParts / totalParts) * 100)}%` : '—',
      detail: `${verifiedParts}/${totalParts} parts`,
      color: '#34D399',
      glow: 'rgba(52, 211, 153, 0.5)',
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'Issues Caught',
      value: `${warningCount + failedParts}`,
      detail: `${warningCount} warnings, ${failedParts} failures`,
      color: warningCount + failedParts > 0 ? '#FBBF24' : 'var(--text-tertiary)',
      glow: warningCount + failedParts > 0 ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255,255,255,0.2)',
    },
  ];

  return (
    <div
      className="max-w-5xl mx-auto px-5 py-8 fade-in"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-black tracking-tight mb-1.5 text-white"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Analytics
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Performance insights across {jobs.length} job{jobs.length !== 1 ? 's' : ''}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-px w-20" style={{ background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.4), transparent)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px rgba(0, 240, 255, 0.8)', animation: 'glow-pulse 2s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {metrics.map(m => (
          <div
            key={m.label}
            className="rounded-2xl p-5 relative overflow-hidden transition-all duration-200"
            style={{
              background: 'var(--gradient-card)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'rgba(0, 240, 255, 0.15)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'var(--border)';
            }}
          >
            {/* Corner glow */}
            <div
              className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
              style={{ background: `radial-gradient(circle at top right, ${m.glow} 0%, transparent 70%)`, opacity: 0.4 }}
            />
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: m.color }}>{m.icon}</span>
              <span
                className="text-[10px] uppercase tracking-wider font-bold"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'Montserrat, sans-serif' }}
              >
                {m.label}
              </span>
            </div>
            <span
              className="text-2xl font-black tracking-tight"
              style={{
                color: m.color,
                fontFamily: 'Montserrat, sans-serif',
                textShadow: m.color !== 'var(--text-tertiary)' ? `0 0 12px ${m.glow}` : 'none',
              }}
            >
              {m.value}
            </span>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{m.detail}</p>
          </div>
        ))}
      </div>

      {/* Job Performance Table */}
      {completed.length > 0 && (
        <div
          className="rounded-2xl p-5 mb-6 fade-in"
          style={{
            background: 'rgba(0, 26, 46, 0.4)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
            <h2
              className="text-sm font-black uppercase tracking-wider"
              style={{ color: 'var(--cyan)', fontFamily: 'Montserrat, sans-serif' }}
            >
              Job Performance
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Vessel</th>
                  <th className="text-right">Est. Hours</th>
                  <th className="text-right">Actual</th>
                  <th className="text-right">Accuracy</th>
                  <th className="text-right">Parts</th>
                </tr>
              </thead>
              <tbody>
                {completed.slice(0, 20).map(j => {
                  const hoursPct = j.estimatedHours && j.actualHours
                    ? Math.round((j.actualHours / j.estimatedHours) * 100)
                    : null;
                  return (
                    <tr key={j.id}>
                      <td className="font-semibold text-white">{j.name}</td>
                      <td style={{ color: 'var(--text-tertiary)' }}>{j.vessel}</td>
                      <td className="text-right" style={{ color: 'var(--text-secondary)' }}>{j.estimatedHours || '—'}</td>
                      <td className="text-right" style={{ color: 'var(--text-secondary)' }}>{j.actualHours || '—'}</td>
                      <td className="text-right">
                        {hoursPct ? (
                          <span
                            className="flex items-center justify-end gap-1"
                            style={{
                              color: hoursPct > 120 ? '#F87171' : hoursPct > 100 ? '#FBBF24' : '#34D399',
                              fontFamily: 'Montserrat, sans-serif',
                              fontWeight: 700,
                            }}
                          >
                            {hoursPct}%
                            {hoursPct > 100
                              ? <TrendingUp className="w-3 h-3" />
                              : <TrendingDown className="w-3 h-3" />
                            }
                          </span>
                        ) : '—'}
                      </td>
                      <td className="text-right" style={{ color: 'var(--text-secondary)' }}>{j.bom.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lessons Learned */}
      {completed.filter(j => j.lessonsLearned).length > 0 && (
        <div
          className="rounded-2xl p-5 fade-in"
          style={{
            background: 'rgba(0, 26, 46, 0.4)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
            <h2
              className="text-sm font-black uppercase tracking-wider"
              style={{ color: 'var(--cyan)', fontFamily: 'Montserrat, sans-serif' }}
            >
              Lessons Learned
            </h2>
          </div>
          <div className="space-y-4">
            {completed.filter(j => j.lessonsLearned).map(j => (
              <div
                key={j.id}
                className="pl-4"
                style={{ borderLeft: '2px solid rgba(0, 240, 255, 0.25)' }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {j.name}{j.vessel ? ` · ${j.vessel}` : ''}
                </p>
                <p className="text-sm text-white/80">{j.lessonsLearned}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {jobs.length === 0 && (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            background: 'rgba(0, 26, 46, 0.3)',
            border: '1px solid var(--border)',
          }}
        >
          <BarChart3 className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-white/40 font-medium">Complete some jobs to see analytics</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Track time, cost, and outcomes to build institutional knowledge
          </p>
        </div>
      )}
    </div>
  );
}
