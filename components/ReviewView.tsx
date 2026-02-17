'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Job, BOMItem, VesselContext, ItemStatus } from '@/lib/types';
import { VesselBar } from './VesselBar';
import { PartCard } from './PartCard';
import { PartDetail } from './PartDetail';
import {
  Search, Package, Share2, FileText, Copy, CheckCheck,
  ChevronDown, Camera, AlertTriangle,
  Clock, Truck, Check, Wrench,
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

const STATUS_ICON: Record<ItemStatus, typeof Package> = {
  pending: Clock,
  ordered: Truck,
  received: Package,
  installed: Wrench,
  verified: Check,
  failed: AlertTriangle,
};

const STATUS_COLOR: Record<ItemStatus, string> = {
  pending: '#FBBF24',
  ordered: '#00F0FF',
  received: '#34D399',
  installed: '#10B981',
  verified: '#34D399',
  failed: '#F87171',
};

export function ReviewView({ job, allJobs, onUpdateJob, onSelectJob, onGoCapture }: ReviewViewProps) {
  const [selectedPart, setSelectedPart] = useState<BOMItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSystems, setCollapsedSystems] = useState<Set<string>>(new Set());
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeJobs = useMemo(
    () => allJobs.filter((j) => j.status === 'active' || j.status === 'ordered'),
    [allJobs]
  );

  // If no active job, show empty state
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center px-6" style={{ minHeight: 'calc(100dvh - 64px - 80px)' }}>
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{
              background: 'rgba(0, 240, 255, 0.04)',
              border: '1.5px solid rgba(0, 240, 255, 0.1)',
            }}
          >
            <Package className="w-9 h-9" style={{ color: 'rgba(0, 240, 255, 0.3)' }} />
          </div>
          <h2
            className="text-lg font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            {activeJobs.length === 0 ? 'No Active Jobs' : 'Select a Job'}
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: '1.6' }}>
            {activeJobs.length === 0
              ? 'Start by capturing a photo or running a demo analysis'
              : 'Pick a job to review its parts list'}
          </p>
          {activeJobs.length === 0 ? (
            <button
              onClick={onGoCapture}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-bold transition-all active:scale-95"
              style={{
                background: '#00F0FF',
                color: '#000C18',
                fontFamily: 'var(--font-montserrat)',
                minHeight: '56px',
                boxShadow: '0 0 24px rgba(0, 240, 255, 0.2)',
              }}
            >
              <Camera className="w-5 h-5" />
              Open Camera
            </button>
          ) : (
            <div className="space-y-2 max-w-sm mx-auto">
              {activeJobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => onSelectJob(j.id)}
                  className="w-full text-left p-4 rounded-2xl transition-all active:scale-[0.98]"
                  style={{
                    background: 'rgba(0, 26, 46, 0.4)',
                    border: '1px solid rgba(0, 240, 255, 0.08)',
                    minHeight: '64px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        {j.vessel || j.name}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {j.bom.length} parts · {j.vesselContext?.make} {j.vesselContext?.model}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90" style={{ color: 'rgba(0, 240, 255, 0.4)' }} />
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
            i.manufacturer.toLowerCase().includes(q) ||
            (i.notes && i.notes.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, searchQuery]);

  // Cost breakdown by status
  const costBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; cents: number }> = {};
    job.bom.forEach((item) => {
      const status = item.status || 'pending';
      if (!breakdown[status]) breakdown[status] = { count: 0, cents: 0 };
      breakdown[status].count += 1; // count distinct items, not quantities
      breakdown[status].cents += bestPriceCents(item) * item.quantity;
    });
    return breakdown;
  }, [job.bom]);

  const grandTotal = job.bom.reduce((s, i) => s + bestPriceCents(i) * i.quantity, 0);
  const confirmedCount = job.bom.filter((i) => i.confirmed || i.status !== 'pending').length;
  const totalItems = job.bom.length;
  const pendingCount = job.bom.filter((i) => i.status === 'pending').length;

  const toggleSystem = useCallback((sys: string) => {
    setCollapsedSystems((prev) => {
      const next = new Set(prev);
      if (next.has(sys)) next.delete(sys);
      else next.add(sys);
      return next;
    });
  }, []);

  const handleConfirm = useCallback((itemId: string) => {
    const updatedBom = job.bom.map((i) =>
      i.id === itemId ? { ...i, confirmed: true, status: 'ordered' as const } : i
    );
    onUpdateJob({ ...job, bom: updatedBom });
  }, [job, onUpdateJob]);

  const handleRemove = useCallback((itemId: string) => {
    const updatedBom = job.bom.filter((i) => i.id !== itemId);
    onUpdateJob({ ...job, bom: updatedBom });
  }, [job, onUpdateJob]);

  const handleQuantityChange = useCallback((itemId: string, qty: number) => {
    const updatedBom = job.bom.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i));
    onUpdateJob({ ...job, bom: updatedBom });
  }, [job, onUpdateJob]);

  const handleVesselUpdate = useCallback((vessel: VesselContext) => {
    onUpdateJob({ ...job, vesselContext: vessel });
  }, [job, onUpdateJob]);

  // Generate BOM as plain text for export
  const generateBOMText = useCallback(() => {
    if (!job) return '';
    const lines: string[] = [];
    const divider = '─'.repeat(40);
    lines.push(`BILL OF MATERIALS`);
    lines.push(`Job: ${job.vessel || job.name}`);
    if (job.vesselContext) {
      const v = job.vesselContext;
      lines.push(`Vessel: ${[v.year, v.make, v.model].filter(Boolean).join(' ')}`);
    }
    if (job.client) lines.push(`Client: ${job.client}`);
    lines.push(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
    lines.push(divider);
    lines.push('');

    groups.forEach((group) => {
      lines.push(`▸ ${group.system.toUpperCase()}`);
      group.items.forEach((item) => {
        const price = bestPriceCents(item);
        const lineTotal = price > 0 ? ` — $${((price * item.quantity) / 100).toFixed(2)}` : '';
        lines.push(`  ${item.quantity}x  ${item.manufacturer} ${item.mpn}`);
        lines.push(`       ${item.name}${lineTotal}`);
        if (item.notes) lines.push(`       Note: ${item.notes}`);
      });
      lines.push('');
    });

    lines.push(divider);
    lines.push(`TOTAL: $${(grandTotal / 100).toFixed(2)}  (${totalItems} items)`);
    lines.push('');
    lines.push(`Generated by PicSea — picsea.app`);
    return lines.join('\n');
  }, [job, groups, grandTotal, totalItems]);

  const handleCopyBOM = useCallback(async () => {
    const text = generateBOMText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generateBOMText]);

  const handleShareBOM = useCallback(async () => {
    const text = generateBOMText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `BOM — ${job?.vessel || job?.name || 'PicSea'}`,
          text,
        });
      } catch { /* user cancelled share */ }
    } else {
      // Fallback to copy
      handleCopyBOM();
    }
  }, [generateBOMText, job, handleCopyBOM]);

  return (
    <div className="flex flex-col h-full">
      {/* Job selector (compact) */}
      {activeJobs.length > 1 && (
        <div className="px-4 pt-2">
          <button
            onClick={() => setShowJobPicker(!showJobPicker)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all"
            style={{
              background: 'rgba(0, 240, 255, 0.04)',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              minHeight: '40px',
            }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#00F0FF', fontFamily: 'var(--font-montserrat)' }}>
              {job.vessel || job.name}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {activeJobs.length} jobs
              </span>
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform"
                style={{
                  color: 'rgba(0, 240, 255, 0.5)',
                  transform: showJobPicker ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </div>
          </button>

          <AnimatePresence>
            {showJobPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 pt-1.5">
                  {activeJobs
                    .filter((j) => j.id !== job.id)
                    .map((j) => (
                      <button
                        key={j.id}
                        onClick={() => {
                          onSelectJob(j.id);
                          setShowJobPicker(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                        style={{
                          background: 'rgba(0, 26, 46, 0.3)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          minHeight: '48px',
                        }}
                      >
                        <div className="text-xs font-bold text-white">{j.vessel || j.name}</div>
                        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {j.bom.length} parts · {j.vesselContext?.make} {j.vesselContext?.model}
                        </div>
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
            style={{ border: 'none', fontSize: '14px', padding: '0' }}
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

      {/* Progress bar + status summary */}
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

        {/* Status chip summary */}
        <div className="flex items-center gap-2 mt-2 overflow-x-auto scrollbar-hide pb-0.5">
          {Object.entries(costBreakdown).map(([status, { count, cents }]) => {
            const Icon = STATUS_ICON[status as ItemStatus] || Clock;
            const color = STATUS_COLOR[status as ItemStatus] || '#FBBF24';
            return (
              <div
                key={status}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                style={{
                  background: `${color}10`,
                  border: `1px solid ${color}20`,
                }}
              >
                <Icon className="w-2.5 h-2.5" style={{ color }} />
                <span className="text-[9px] font-bold uppercase" style={{ color }}>
                  {count} {status}
                </span>
                <span className="text-[9px]" style={{ color: `${color}80` }}>
                  ${(cents / 100).toFixed(0)}
                </span>
              </div>
            );
          })}
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
                    vesselVoltage={job.vesselContext?.voltage}
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
            background: 'linear-gradient(0deg, rgba(0, 6, 12, 0.98) 70%, transparent)',
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
              {pendingCount > 0 && (
                <div className="text-[10px] mt-0.5" style={{ color: 'rgba(251, 191, 36, 0.6)' }}>
                  {pendingCount} pending review
                </div>
              )}
            </div>
            <button
              onClick={() => setShowExport(true)}
              className="px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
              style={{
                background: '#00F0FF',
                color: '#000C18',
                fontFamily: 'var(--font-montserrat)',
                minHeight: '48px',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
              }}
            >
              <FileText className="w-4 h-4" />
              Export BOM
            </button>
          </div>
        </div>
      )}

      {/* Export BOM Sheet */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 6, 12, 0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setShowExport(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
              style={{
                maxHeight: '70vh',
                background: 'linear-gradient(180deg, #001a2e 0%, #000c18 100%)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                borderBottom: 'none',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              <div className="px-5 pb-8">
                <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Export Parts List
                </h3>
                <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {job.vessel || job.name} · {totalItems} parts · ${(grandTotal / 100).toFixed(2)}
                </p>

                {/* BOM Summary */}
                <div className="space-y-3 mb-6">
                  {Object.entries(costBreakdown).map(([status, { count, cents }]) => {
                    const color = STATUS_COLOR[status as ItemStatus] || '#FBBF24';
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                          <span className="text-xs capitalize text-white">{status}</span>
                          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            ({count} items)
                          </span>
                        </div>
                        <span className="text-xs font-bold" style={{ color }}>
                          ${(cents / 100).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}

                  <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Total</span>
                    <span className="text-lg font-bold" style={{ color: '#00F0FF', fontFamily: 'var(--font-montserrat)' }}>
                      ${(grandTotal / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Export actions */}
                <div className="space-y-2.5">
                  {/* Share (mobile native share sheet) */}
                  <button
                    onClick={() => { handleShareBOM(); setShowExport(false); }}
                    className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all active:scale-95"
                    style={{
                      background: '#00F0FF',
                      color: '#000C18',
                      fontFamily: 'var(--font-montserrat)',
                      minHeight: '52px',
                      boxShadow: '0 0 24px rgba(0, 240, 255, 0.2)',
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    Share Parts List
                  </button>

                  {/* Copy to clipboard */}
                  <button
                    onClick={handleCopyBOM}
                    className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all active:scale-95"
                    style={{
                      background: copied ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255,255,255,0.04)',
                      color: copied ? '#34D399' : 'rgba(255,255,255,0.6)',
                      border: `1px solid ${copied ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.08)'}`,
                      fontFamily: 'var(--font-montserrat)',
                      minHeight: '52px',
                    }}
                  >
                    {copied ? (
                      <><CheckCheck className="w-4 h-4" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy to Clipboard</>
                    )}
                  </button>

                  {/* Mark all as ordered */}
                  <button
                    onClick={() => {
                      const updatedBom = job.bom.map((i) =>
                        i.status === 'pending' ? { ...i, confirmed: true, status: 'ordered' as const } : i
                      );
                      onUpdateJob({ ...job, bom: updatedBom, status: 'ordered' });
                      setShowExport(false);
                    }}
                    className="w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      color: 'rgba(255,255,255,0.35)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      fontFamily: 'var(--font-montserrat)',
                      minHeight: '48px',
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark All as Ordered
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Part detail modal */}
      <PartDetail
        item={selectedPart}
        vesselVoltage={job.vesselContext?.voltage}
        onClose={() => setSelectedPart(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
