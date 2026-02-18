'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Job, IdentifiedPart } from '@/lib/types';
import { History, ChevronDown, X, Package, AlertCircle } from 'lucide-react';

interface ScanEntry {
  photoId: string;
  jobId: string;
  jobName: string;
  vesselName: string;
  date: string;
  imageUrl: string;
  filename: string;
  parts: IdentifiedPart[];
}

interface HistoryViewProps {
  jobs: Job[];
  onOpenJob: (jobId: string) => void;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function HistoryView({ jobs, onOpenJob }: HistoryViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Build flat list of all scans across all jobs, sorted by date desc
  const scans = useMemo<ScanEntry[]>(() => {
    const entries: ScanEntry[] = [];
    for (const job of jobs) {
      for (const photo of job.photos || []) {
        entries.push({
          photoId: photo.id,
          jobId: job.id,
          jobName: job.name,
          vesselName: job.vessel || job.name,
          date: photo.uploadedAt,
          imageUrl: photo.file || '',
          filename: photo.filename,
          parts: photo.identifiedParts || [],
        });
      }
    }
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [jobs]);

  if (scans.length === 0) {
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
            <History className="w-9 h-9" style={{ color: 'rgba(0, 240, 255, 0.3)' }} />
          </div>
          <h2
            className="text-lg font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            No Scan History Yet
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: '1.6' }}>
            Your scans will appear here after you capture photos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Scan History
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {scans.length} total scan{scans.length !== 1 ? 's' : ''} across {jobs.filter(j => j.photos?.length > 0).length} job{jobs.filter(j => j.photos?.length > 0).length !== 1 ? 's' : ''}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(0, 240, 255, 0.06)',
            border: '1px solid rgba(0, 240, 255, 0.12)',
          }}
        >
          <History className="w-5 h-5" style={{ color: 'rgba(0, 240, 255, 0.6)' }} />
        </div>
      </div>

      {/* Scan list */}
      <div className="space-y-2.5">
        {scans.map((scan) => {
          const isExpanded = expandedId === scan.photoId;
          const topPart = scan.parts[0];
          const confidence = topPart?.confidence ?? null;
          const confidenceColor =
            confidence == null ? 'rgba(255,255,255,0.3)'
            : confidence >= 0.85 ? '#34D399'
            : confidence >= 0.65 ? '#FBBF24'
            : '#F87171';

          return (
            <div
              key={scan.photoId}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: 'rgba(0, 26, 46, 0.45)',
                border: isExpanded
                  ? '1px solid rgba(0, 240, 255, 0.2)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Collapsed row */}
              <button
                className="w-full flex items-center gap-3 p-3 transition-all active:scale-[0.99]"
                onClick={() => setExpandedId(isExpanded ? null : scan.photoId)}
              >
                {/* Thumbnail */}
                <div
                  className="flex-shrink-0 rounded-xl overflow-hidden"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(0, 43, 69, 0.5)',
                    border: '1px solid rgba(0, 240, 255, 0.1)',
                  }}
                >
                  {scan.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={scan.imageUrl}
                      alt="scan thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5" style={{ color: 'rgba(0, 240, 255, 0.3)' }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  {scan.parts.length > 0 ? (
                    <>
                      <div className="text-sm font-bold text-white truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        {topPart?.manufacturer} {topPart?.mpn}
                      </div>
                      <div className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {topPart?.name}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        No parts identified
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {scan.filename}
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {relativeTime(scan.date)}
                    </span>
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span className="text-[9px] truncate" style={{ color: 'rgba(0, 240, 255, 0.4)' }}>
                      {scan.vesselName}
                    </span>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {confidence != null && (
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${confidenceColor}15`,
                        color: confidenceColor,
                        border: `1px solid ${confidenceColor}25`,
                      }}
                    >
                      {Math.round(confidence * 100)}%
                    </span>
                  )}
                  {scan.parts.length > 1 && (
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      +{scan.parts.length - 1} more
                    </span>
                  )}
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform"
                    style={{
                      color: 'rgba(0, 240, 255, 0.4)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-4 pb-4 pt-2"
                      style={{ borderTop: '1px solid rgba(0, 240, 255, 0.06)' }}
                    >
                      {/* Date + job link */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {formatDate(scan.date)}
                        </span>
                        <button
                          onClick={() => onOpenJob(scan.jobId)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-all active:scale-95"
                          style={{
                            background: 'rgba(0, 240, 255, 0.08)',
                            color: '#00F0FF',
                            border: '1px solid rgba(0, 240, 255, 0.15)',
                          }}
                        >
                          View Job →
                        </button>
                      </div>

                      {/* Full image if available */}
                      {scan.imageUrl && (
                        <div
                          className="rounded-xl overflow-hidden mb-3"
                          style={{
                            maxHeight: '200px',
                            border: '1px solid rgba(0, 240, 255, 0.08)',
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={scan.imageUrl}
                            alt="Scan"
                            className="w-full object-cover"
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      )}

                      {/* All identified parts */}
                      {scan.parts.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            Identified Parts ({scan.parts.length})
                          </div>
                          {scan.parts.map((part, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl"
                              style={{
                                background: 'rgba(0, 43, 69, 0.3)',
                                border: '1px solid rgba(0, 240, 255, 0.06)',
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>
                                    {part.manufacturer} {part.mpn}
                                  </div>
                                  <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                    {part.name}
                                  </div>
                                  {part.category_name && (
                                    <div className="text-[9px] mt-0.5" style={{ color: 'rgba(0, 240, 255, 0.4)' }}>
                                      {part.category_name}
                                    </div>
                                  )}
                                </div>
                                {part.confidence != null && (
                                  <span
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                    style={{
                                      background: `${confidenceColor}15`,
                                      color: confidenceColor,
                                    }}
                                  >
                                    {Math.round(part.confidence * 100)}%
                                  </span>
                                )}
                              </div>

                              {/* AI context */}
                              {part.intelligence?.context?.failure_mode && (
                                <div className="mt-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                  {part.intelligence.context.failure_mode}
                                </div>
                              )}

                              {/* Best price */}
                              {part.listings && part.listings.length > 0 && (
                                <div className="mt-1.5 flex items-center gap-2">
                                  {(() => {
                                    const best = part.listings.filter(l => l.in_stock)[0] || part.listings[0];
                                    return (
                                      <>
                                        <span className="text-[10px] font-bold" style={{ color: '#00F0FF' }}>
                                          ${(best.price_cents / 100).toFixed(2)}
                                        </span>
                                        <span
                                          className="text-[8px] px-1.5 py-0.5 rounded-full"
                                          style={{
                                            background: best.in_stock ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                            color: best.in_stock ? '#34D399' : '#F87171',
                                          }}
                                        >
                                          {best.in_stock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 py-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">No parts were identified in this scan</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
