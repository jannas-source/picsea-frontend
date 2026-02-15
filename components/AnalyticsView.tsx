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
  
  // Cost analysis
  const totalEstimatedCost = completed.reduce((s, j) => s + (j.estimatedCostCents || 0), 0);
  const totalActualCost = completed.reduce((s, j) => s + (j.actualCostCents || 0), 0);
  const costAccuracy = totalEstimatedCost > 0 ? Math.round((totalActualCost / totalEstimatedCost) * 100) : 0;
  
  // Time analysis
  const totalEstimatedHours = completed.reduce((s, j) => s + (j.estimatedHours || 0), 0);
  const totalActualHours = completed.reduce((s, j) => s + (j.actualHours || 0), 0);
  const timeAccuracy = totalEstimatedHours > 0 ? Math.round((totalActualHours / totalEstimatedHours) * 100) : 0;
  
  // Part stats
  const totalParts = jobs.reduce((s, j) => s + j.bom.length, 0);
  const verifiedParts = jobs.reduce((s, j) => s + j.bom.filter(b => b.status === 'verified').length, 0);
  const failedParts = jobs.reduce((s, j) => s + j.bom.filter(b => b.status === 'failed').length, 0);
  
  // Jobs with warnings
  const warningCount = jobs.reduce((s, j) => s + j.bom.reduce((ws, b) => ws + (b.warnings?.length || 0), 0), 0);
  
  return (
    <div className="max-w-5xl mx-auto px-5 py-8 fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Analytics</h1>
        <p className="text-sm text-[var(--text-tertiary)]">
          Performance insights across {jobs.length} jobs
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Cost Accuracy"
          value={costAccuracy ? `${costAccuracy}%` : '—'}
          detail={totalActualCost > 0 ? `$${(totalActualCost / 100).toLocaleString()} actual` : 'No data yet'}
          color={costAccuracy > 110 ? 'var(--warning)' : costAccuracy > 0 ? 'var(--success)' : 'var(--text-tertiary)'}
        />
        <MetricCard
          icon={<Clock className="w-4 h-4" />}
          label="Time Accuracy"
          value={timeAccuracy ? `${timeAccuracy}%` : '—'}
          detail={totalActualHours > 0 ? `${totalActualHours.toFixed(1)}h actual` : 'No data yet'}
          color={timeAccuracy > 120 ? 'var(--warning)' : timeAccuracy > 0 ? 'var(--success)' : 'var(--text-tertiary)'}
        />
        <MetricCard
          icon={<CheckCircle className="w-4 h-4" />}
          label="Parts Verified"
          value={totalParts > 0 ? `${Math.round((verifiedParts / totalParts) * 100)}%` : '—'}
          detail={`${verifiedParts}/${totalParts} parts`}
          color="var(--success)"
        />
        <MetricCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Issues Caught"
          value={`${warningCount + failedParts}`}
          detail={`${warningCount} warnings, ${failedParts} failures`}
          color="var(--warning)"
        />
      </div>

      {/* Job Performance Table */}
      {completed.length > 0 && (
        <div className="glass rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[var(--cyan)]" />
            <h2 className="text-sm font-semibold">Job Performance</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border)]">
                  <th className="text-left py-2 pr-4">Job</th>
                  <th className="text-left py-2 pr-4">Vessel</th>
                  <th className="text-right py-2 pr-4">Est. Hours</th>
                  <th className="text-right py-2 pr-4">Actual</th>
                  <th className="text-right py-2 pr-4">Accuracy</th>
                  <th className="text-right py-2">Parts</th>
                </tr>
              </thead>
              <tbody>
                {completed.slice(0, 20).map(j => {
                  const hoursPct = j.estimatedHours && j.actualHours 
                    ? Math.round((j.actualHours / j.estimatedHours) * 100) : null;
                  return (
                    <tr key={j.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-2)]">
                      <td className="py-2 pr-4 font-medium">{j.name}</td>
                      <td className="py-2 pr-4 text-[var(--text-tertiary)]">{j.vessel}</td>
                      <td className="py-2 pr-4 text-right">{j.estimatedHours || '—'}</td>
                      <td className="py-2 pr-4 text-right">{j.actualHours || '—'}</td>
                      <td className="py-2 pr-4 text-right">
                        {hoursPct ? (
                          <span className={hoursPct > 120 ? 'text-red-400' : hoursPct > 100 ? 'text-amber-400' : 'text-green-400'}>
                            {hoursPct}%
                            {hoursPct > 100 ? <TrendingUp className="w-3 h-3 inline ml-1" /> : <TrendingDown className="w-3 h-3 inline ml-1" />}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2 text-right">{j.bom.length}</td>
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
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[var(--cyan)]" />
            <h2 className="text-sm font-semibold">Lessons Learned</h2>
          </div>
          <div className="space-y-3">
            {completed.filter(j => j.lessonsLearned).map(j => (
              <div key={j.id} className="border-l-2 border-[var(--cyan)]/30 pl-3">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">{j.name} · {j.vessel}</p>
                <p className="text-sm">{j.lessonsLearned}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="text-center py-16 text-[var(--text-tertiary)]">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Complete some jobs to see analytics</p>
          <p className="text-xs mt-1">Track time, cost, and outcomes to build institutional knowledge</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, detail, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <p className="text-xs text-[var(--text-tertiary)] mt-1">{detail}</p>
    </div>
  );
}
