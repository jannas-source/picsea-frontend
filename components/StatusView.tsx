'use client';

import React, { useState, useMemo } from 'react';
import { Job, BOMItem, ItemStatus } from '@/lib/types';
import {
  Clock, Package, CheckCircle, Truck,
  Wrench, Archive, ChevronRight, Filter,
  AlertTriangle, Calendar, DollarSign,
  Wifi, WifiOff, AlertCircle,
} from 'lucide-react';

interface StatusViewProps {
  jobs: Job[];
  onOpenJob: (jobId: string) => void;
}

type FilterTab = 'all' | 'active' | 'completed';

const STATUS_CONFIG: Record<ItemStatus, { icon: typeof Package; color: string; label: string }> = {
  pending: { icon: Clock, color: '#FBBF24', label: 'Pending' },
  ordered: { icon: Truck, color: '#00F0FF', label: 'Ordered' },
  received: { icon: Package, color: '#4DFAFF', label: 'Received' },
  installed: { icon: Wrench, color: '#10B981', label: 'Installed' },
  verified: { icon: CheckCircle, color: '#34D399', label: 'Verified' },
  failed: { icon: AlertCircle, color: '#F87171', label: 'Failed' },
};

function jobProgress(job: Job): number {
  if (job.bom.length === 0) return 0;
  if (job.status === 'complete') return 100;
  const weights: Record<string, number> = {
    pending: 0, ordered: 25, received: 50, installed: 75, verified: 100, failed: 0,
  };
  const total = job.bom.reduce((sum, item) => sum + (weights[item.status] || 0), 0);
  return Math.round(total / job.bom.length);
}

function jobPartsByStatus(bom: BOMItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  bom.forEach((item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
  });
  return counts;
}

function statusSummary(bom: BOMItem[]): { status: ItemStatus; count: number }[] {
  const counts = new Map<ItemStatus, number>();
  bom.forEach((item) => {
    counts.set(item.status, (counts.get(item.status) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => {
      const order: ItemStatus[] = ['pending', 'ordered', 'received', 'installed', 'verified', 'failed'];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function jobTotalCents(bom: BOMItem[]): number {
  return bom.reduce((s, item) => {
    if (!item.listings || item.listings.length === 0) return s;
    const inStock = item.listings.filter((l) => l.in_stock);
    const list = inStock.length > 0 ? inStock : item.listings;
    const best = Math.min(...list.map((l) => l.price_cents));
    return s + best * item.quantity;
  }, 0);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function StatusView({ jobs, onOpenJob }: StatusViewProps) {
  const [filter, setFilter] = useState<FilterTab>('all');

  const filteredJobs = useMemo(() =>
    jobs.filter((j) => {
      if (filter === 'active') return j.status !== 'complete';
      if (filter === 'completed') return j.status === 'complete';
      return true;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [jobs, filter]
  );

  const activeCount = jobs.filter((j) => j.status !== 'complete').length;
  const completedCount = jobs.filter((j) => j.status === 'complete').length;

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: jobs.length },
    { id: 'active', label: 'Active', count: activeCount },
    { id: 'completed', label: 'Done', count: completedCount },
  ];

  return (
    <div className="px-4 py-3">
      {/* Header with connection status */}
      <div className="flex items-center justify-between mb-4">
        <h1
          className="text-xl font-bold text-white"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Jobs & Orders
        </h1>
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
            background: 'rgba(52, 211, 153, 0.08)',
            border: '1px solid rgba(52, 211, 153, 0.15)',
          }}>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#34D399', boxShadow: '0 0 6px rgba(52, 211, 153, 0.5)' }}
            />
            <span className="text-[9px] font-bold" style={{ color: 'rgba(52, 211, 153, 0.7)' }}>
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Last synced */}
      <div className="flex items-center gap-1.5 mb-3">
        <Clock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Last synced: 2 min ago
        </span>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-4"
        style={{ background: 'rgba(0, 26, 46, 0.3)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            style={{
              background: filter === tab.id ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
              color: filter === tab.id ? '#00F0FF' : 'rgba(255,255,255,0.35)',
              border: filter === tab.id ? '1px solid rgba(0, 240, 255, 0.12)' : '1px solid transparent',
              fontFamily: 'var(--font-montserrat)',
              minHeight: '40px',
            }}
          >
            {tab.label}
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
              style={{
                fontVariantNumeric: 'tabular-nums',
                background: filter === tab.id ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255,255,255,0.04)',
                color: filter === tab.id ? '#00F0FF' : 'rgba(255,255,255,0.25)',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Job list */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <Archive className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-sm mb-1 font-semibold text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
            {filter === 'completed' ? 'No Completed Jobs' : 'No Jobs Yet'}
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {filter === 'completed'
              ? 'Completed jobs will appear here'
              : 'Capture a photo to start your first job'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const progress = jobProgress(job);
            const summary = statusSummary(job.bom);
            const isComplete = job.status === 'complete';
            const totalCents = jobTotalCents(job.bom);
            const partsByStatus = jobPartsByStatus(job.bom);
            const receivedOrInstalled = (partsByStatus.received || 0) + (partsByStatus.installed || 0) + (partsByStatus.verified || 0);
            const isCritical = job.priority === 'critical';

            return (
              <button
                key={job.id}
                onClick={() => onOpenJob(job.id)}
                className="w-full text-left rounded-2xl p-4 transition-all group active:scale-[0.98]"
                style={{
                  background: isComplete
                    ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.04), rgba(0, 26, 46, 0.3))'
                    : isCritical
                    ? 'linear-gradient(135deg, rgba(248, 113, 113, 0.04), rgba(0, 26, 46, 0.4))'
                    : 'rgba(0, 26, 46, 0.4)',
                  border: isComplete
                    ? '1px solid rgba(52, 211, 153, 0.1)'
                    : isCritical
                    ? '1px solid rgba(248, 113, 113, 0.1)'
                    : '1px solid rgba(255,255,255,0.06)',
                  minHeight: '80px',
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        {job.vessel || job.name}
                      </span>
                      {isComplete && (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#34D399' }} />
                      )}
                      {isCritical && !isComplete && (
                        <span
                          className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: 'rgba(248, 113, 113, 0.1)',
                            color: '#F87171',
                            border: '1px solid rgba(248, 113, 113, 0.2)',
                          }}
                        >
                          Priority
                        </span>
                      )}
                    </div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {job.vesselContext?.year} {job.vesselContext?.make} {job.vesselContext?.model}
                    </div>
                    {job.client && (
                      <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {job.client}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {relativeTime(job.updatedAt)}
                    </span>
                    <ChevronRight
                      className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'rgba(0, 240, 255, 0.5)' }}
                    />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-2.5">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {isComplete
                        ? 'All parts complete'
                        : `${receivedOrInstalled} of ${job.bom.length} parts received`}
                    </span>
                    <span style={{ color: isComplete ? 'rgba(52, 211, 153, 0.6)' : 'rgba(0, 240, 255, 0.5)' }}>
                      {progress}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden flex"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    {/* Segmented progress bar */}
                    {job.bom.length > 0 && (
                      <>
                        {(partsByStatus.installed || 0) + (partsByStatus.verified || 0) > 0 && (
                          <div
                            className="h-full"
                            style={{
                              width: `${(((partsByStatus.installed || 0) + (partsByStatus.verified || 0)) / job.bom.length) * 100}%`,
                              background: '#10B981',
                              boxShadow: '0 0 4px rgba(16, 185, 129, 0.4)',
                            }}
                          />
                        )}
                        {(partsByStatus.received || 0) > 0 && (
                          <div
                            className="h-full"
                            style={{
                              width: `${((partsByStatus.received || 0) / job.bom.length) * 100}%`,
                              background: '#34D399',
                              boxShadow: '0 0 4px rgba(52, 211, 153, 0.3)',
                            }}
                          />
                        )}
                        {(partsByStatus.ordered || 0) > 0 && (
                          <div
                            className="h-full"
                            style={{
                              width: `${((partsByStatus.ordered || 0) / job.bom.length) * 100}%`,
                              background: '#00F0FF',
                              boxShadow: '0 0 4px rgba(0, 240, 255, 0.3)',
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom row: status badges + cost */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap flex-1">
                    {summary.map(({ status, count }) => {
                      const cfg = STATUS_CONFIG[status];
                      const Icon = cfg.icon;
                      return (
                        <span
                          key={status}
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{
                            background: `${cfg.color}10`,
                            color: cfg.color,
                            border: `1px solid ${cfg.color}20`,
                          }}
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {count}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 ml-2">
                    <span className="text-xs font-bold" style={{ color: '#00F0FF', fontFamily: 'var(--font-montserrat)' }}>
                      ${((isComplete ? (job.actualCostCents || totalCents) : totalCents) / 100).toFixed(0)}
                    </span>
                    {isComplete && job.completedAt && (
                      <span className="text-[9px]" style={{ color: 'rgba(52, 211, 153, 0.5)' }}>
                        {formatDate(job.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
