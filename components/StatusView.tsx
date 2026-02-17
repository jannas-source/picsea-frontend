'use client';

import React, { useState } from 'react';
import { Job, BOMItem, ItemStatus } from '@/lib/types';
import {
  Clock, Package, CheckCircle, Truck,
  Wrench, Archive, ChevronRight, Filter,
  AlertCircle,
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
  installed: { icon: Wrench, color: '#34D399', label: 'Installed' },
  verified: { icon: CheckCircle, color: '#34D399', label: 'Verified' },
  failed: { icon: AlertCircle, color: '#F87171', label: 'Failed' },
};

function jobProgress(job: Job): number {
  if (job.bom.length === 0) return 0;
  const weights: Record<string, number> = {
    pending: 0, ordered: 25, received: 50, installed: 75, verified: 100, failed: 0,
  };
  const total = job.bom.reduce((sum, item) => sum + (weights[item.status] || 0), 0);
  return Math.round(total / job.bom.length);
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
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function StatusView({ jobs, onOpenJob }: StatusViewProps) {
  const [filter, setFilter] = useState<FilterTab>('all');

  const filteredJobs = jobs.filter((j) => {
    if (filter === 'active') return j.status !== 'complete';
    if (filter === 'completed') return j.status === 'complete';
    return true;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: jobs.length },
    { id: 'active', label: 'Active', count: jobs.filter((j) => j.status !== 'complete').length },
    { id: 'completed', label: 'Done', count: jobs.filter((j) => j.status === 'complete').length },
  ];

  return (
    <div className="px-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1
          className="text-xl font-bold text-white"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Jobs & Orders
        </h1>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>
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
              className="text-[9px] opacity-70"
              style={{ fontVariantNumeric: 'tabular-nums' }}
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
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
            No jobs yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const progress = jobProgress(job);
            const summary = statusSummary(job.bom);
            const isComplete = job.status === 'complete';

            return (
              <button
                key={job.id}
                onClick={() => onOpenJob(job.id)}
                className="w-full text-left rounded-2xl p-4 transition-all group"
                style={{
                  background: 'rgba(0, 26, 46, 0.4)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  minHeight: '80px',
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white truncate">
                        {job.name}
                      </span>
                      {isComplete && (
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#34D399' }} />
                      )}
                    </div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {job.vessel}
                      {job.vesselContext?.make && ` · ${job.vesselContext.make} ${job.vesselContext.model || ''}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {relativeTime(job.updatedAt)}
                    </span>
                    <ChevronRight
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'rgba(0, 240, 255, 0.4)' }}
                    />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-2.5">
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        background: isComplete
                          ? '#34D399'
                          : 'linear-gradient(90deg, #00F0FF, #4DFAFF)',
                        boxShadow: isComplete
                          ? '0 0 6px rgba(52, 211, 153, 0.4)'
                          : '0 0 6px rgba(0, 240, 255, 0.3)',
                      }}
                    />
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
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
                        {count} {cfg.label.toLowerCase()}
                      </span>
                    );
                  })}
                  <span className="text-[10px] ml-auto" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {job.bom.length} parts
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
