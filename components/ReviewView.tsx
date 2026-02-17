'use client';

import React, { useState, useMemo } from 'react';
import { Job, BOMItem, VesselContext } from '@/lib/types';
import { VesselBar } from './VesselBar';
import { PartCard } from './PartCard';
import { PartDetail } from './PartDetail';
import {
  Search, Package, ShoppingCart, FileText,
  ChevronDown, ChevronRight, Plus,
} from 'lucide-react';

interface ReviewViewProps {
  job: Job | null;
  allJobs: Job[];
  onUpdateJob: (job: Job) => void;
  onSelectJob: (jobId: string) => void;
  onGoCapture: () => void;
}

type SystemGroup = {
  system: string;
  items: BOMItem[];
  totalCents: number;
};

function bestPriceCents(item: BOMItem): number {
  if (!item.listings || item.listings.length === 0) return 0;
  const inStock = item.listings.filter((l) => l.in_stock);
  const list = inStock.length > 0 ? inStock : item.listings;
  return Math.min(...list.map((l) => l.price_cents));
}

function groupBySystem(bom: BOMItem[]): SystemGroup[] {
  const map = new Map<string, BOMItem[]>();
  bom.forEach((item) => {
    const sys = item.category_name || 'General';
    if (!map.has(sys)) map.set(sys, []);
    map.get(sys)!.push(item);
  });

  return Array.from(map.entries())
    .map(([system, items]) => ({
      system,
      items,
      totalCents: items.reduce((s, i) => s + bestPriceCents(i) * i.quantity, 0),
    }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

export function ReviewView({ job, allJobs, onUpdateJob, onSelectJob, onGoCapture }: ReviewViewProps) {
  const [selectedPart, setSelectedPart] = useState<BOMItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSystems, setCollapsedSystems] = useState<Set<string>>(new Set());

  // If no active job, show job picker
  if (!job) {
    const activeJobs = allJobs.filter((j) => j.status === 'active' || j.status === 'ordered');
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(0, 240, 255, 0.3)' }} />
          <h2
            className="text-lg font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            {activeJobs.length === 0 ? 'No Active Jobs' : 'Select a Job'}
          </h2>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {activeJobs.length === 0
              ? 'Take a photo to start a new job'
              : 'Pick a job to review its parts list'}
          </p>
          {activeJobs.length === 0 ? (
            <button
              onClick={onGoCapture}
              className="px-6 py-3 rounded-xl text-sm font-bold"
              style={{
                background: '#00F0FF',
                color: '#000C18',
                fontFamily: 'var(--font-montserrat)',
                minHeight: '48px',
              }}
            >
              Open Camera
            </button>
          ) : (
            <div className="space-y-2">
              {activeJobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => onSelectJob(j.id)}
                  className="w-full text-left p-4 rounded-2xl transition-all"
                  style={{
                    background: 'rgba(0, 26, 46, 0.4)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    minHeight: '60px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{j.name}</div>
                      <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {j.bom.length} parts · {j.vessel}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const groups = useMemo(() => groupBySystem(job.bom), [job.bom]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.mpn.toLowerCase().includes(q) ||
            i.manufacturer.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, searchQuery]);

  const grandTotal = job.bom.reduce((s, i) => s + bestPriceCents(i) * i.quantity, 0);
  const confirmedCount = job.bom.filter((i) => i.confirmed || i.status !== 'pending').length;
  const totalItems = job.bom.length;

  const toggleSystem = (sys: string) => {
    setCollapsedSystems((prev) => {
      const next = new Set(prev);
      if (next.has(sys)) next.delete(sys);
      else next.add(sys);
      return next;
    });
  };

  const handleConfirm = (itemId: string) => {
    const updatedBom = job.bom.map((i) =>
      i.id === itemId ? { ...i, confirmed: true, status: 'ordered' as const } : i
    );
    onUpdateJob({ ...job, bom: updatedBom });
  };

  const handleRemove = (itemId: string) => {
    const updatedBom = job.bom.filter((i) => i.id !== itemId);
    onUpdateJob({ ...job, bom: updatedBom });
  };

  const handleQuantityChange = (itemId: string, qty: number) => {
    const updatedBom = job.bom.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i));
    onUpdateJob({ ...job, bom: updatedBom });
  };

  const handleVesselUpdate = (vessel: VesselContext) => {
    onUpdateJob({ ...job, vesselContext: vessel });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Vessel context bar */}
      {job.vesselContext && (
        <VesselBar
          vessel={job.vesselContext}
          jobName={job.name}
          onUpdate={handleVesselUpdate}
        />
      )}

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="flex items-center gap-2 px-3 rounded-xl"
          style={{
            background: 'rgba(0, 26, 46, 0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
            height: '44px',
          }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <input
            type="text"
            placeholder="Search parts, MPN, manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[rgba(255,255,255,0.25)]"
            style={{ border: 'none' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-[10px] mb-1.5">
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>
            {confirmedCount} of {totalItems} confirmed
          </span>
          <span style={{ color: 'rgba(0, 240, 255, 0.6)' }}>
            {totalItems > 0 ? Math.round((confirmedCount / totalItems) * 100) : 0}%
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${totalItems > 0 ? (confirmedCount / totalItems) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #00F0FF, #4DFAFF)',
              boxShadow: '0 0 8px rgba(0, 240, 255, 0.4)',
            }}
          />
        </div>
      </div>

      {/* Parts list grouped by system */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {searchQuery ? 'No parts match your search' : 'No parts yet — take a photo to start'}
            </p>
          </div>
        )}

        {filteredGroups.map((group) => {
          const collapsed = collapsedSystems.has(group.system);
          return (
            <div key={group.system} className="mb-3">
              {/* System header */}
              <button
                onClick={() => toggleSystem(group.system)}
                className="w-full flex items-center gap-2 px-2 py-2 mb-1"
              >
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform"
                  style={{
                    color: 'rgba(0, 240, 255, 0.5)',
                    transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  }}
                />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-montserrat)' }}
                >
                  {group.system}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  ({group.items.length})
                </span>
                <div className="flex-1" />
                <span className="text-[10px] font-bold" style={{ color: 'rgba(0, 240, 255, 0.4)' }}>
                  ${(group.totalCents / 100).toFixed(2)}
                </span>
              </button>

              {/* Part cards */}
              {!collapsed &&
                group.items.map((item) => (
                  <PartCard
                    key={item.id}
                    item={item}
                    onConfirm={handleConfirm}
                    onRemove={handleRemove}
                    onQuantityChange={handleQuantityChange}
                    onTap={setSelectedPart}
                  />
                ))}
            </div>
          );
        })}
      </div>

      {/* Bottom cost bar */}
      {job.bom.length > 0 && (
        <div
          className="sticky bottom-0 left-0 right-0 px-4 py-3"
          style={{
            background: 'linear-gradient(0deg, rgba(0, 6, 12, 0.95) 70%, transparent)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{
              background: 'rgba(0, 26, 46, 0.5)',
              border: '1px solid rgba(0, 240, 255, 0.1)',
            }}
          >
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-montserrat)' }}>
                Estimated Total
              </div>
              <div className="text-xl font-bold" style={{ color: '#00F0FF', fontFamily: 'var(--font-montserrat)' }}>
                ${(grandTotal / 100).toFixed(2)}
              </div>
            </div>
            <button
              className="px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
              style={{
                background: '#00F0FF',
                color: '#000C18',
                fontFamily: 'var(--font-montserrat)',
                minHeight: '48px',
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Review & Order
            </button>
          </div>
        </div>
      )}

      {/* Part detail modal */}
      <PartDetail
        item={selectedPart}
        onClose={() => setSelectedPart(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
