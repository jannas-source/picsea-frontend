'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOMItem } from '@/lib/types';
import {
  X, Package, ShieldCheck, ExternalLink,
  Wrench, AlertTriangle, DollarSign, Clock,
  Info, Truck, Lightbulb,
} from 'lucide-react';

interface PartDetailProps {
  item: BOMItem | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

function confidenceColor(c: number): string {
  if (c >= 0.95) return '#34D399';
  if (c >= 0.85) return '#00F0FF';
  if (c >= 0.70) return '#FBBF24';
  return '#F87171';
}

export function PartDetail({ item, onClose, onConfirm }: PartDetailProps) {
  if (!item) return null;

  const conf = item.confidence ?? 0;
  const intel = item.intelligence;
  const ctx = intel?.context;
  const src = intel?.sourcing;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(0, 6, 12, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
            style={{
              maxHeight: '85vh',
              background: 'linear-gradient(180deg, #001a2e 0%, #000c18 100%)',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              borderBottom: 'none',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 px-5 pb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                }}
              >
                <Package className="w-6 h-6" style={{ color: '#00F0FF' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white leading-tight">
                  {item.name}
                </h3>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {item.manufacturer} · {item.mpn}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {conf > 0 && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{
                        color: confidenceColor(conf),
                        background: `${confidenceColor(conf)}15`,
                        border: `1px solid ${confidenceColor(conf)}25`,
                      }}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {Math.round(conf * 100)}% match confidence
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.4)',
                  minHeight: '44px',
                  minWidth: '44px',
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div
              className="overflow-y-auto px-5 pb-32"
              style={{ maxHeight: 'calc(85vh - 140px)' }}
            >
              {/* Warnings */}
              {item.warnings && item.warnings.length > 0 && (
                <div className="mb-4">
                  {item.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-3 rounded-xl mb-2"
                      style={{
                        background:
                          w.severity === 'error'
                            ? 'rgba(248, 113, 113, 0.08)'
                            : w.severity === 'warning'
                            ? 'rgba(251, 191, 36, 0.08)'
                            : 'rgba(0, 240, 255, 0.05)',
                        border: `1px solid ${
                          w.severity === 'error'
                            ? 'rgba(248, 113, 113, 0.2)'
                            : w.severity === 'warning'
                            ? 'rgba(251, 191, 36, 0.2)'
                            : 'rgba(0, 240, 255, 0.1)'
                        }`,
                      }}
                    >
                      <AlertTriangle
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{
                          color:
                            w.severity === 'error' ? '#F87171' : w.severity === 'warning' ? '#FBBF24' : '#00F0FF',
                        }}
                      />
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {w.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing */}
              {item.listings && item.listings.length > 0 && (
                <Section title="Pricing & Availability" icon={<DollarSign className="w-3.5 h-3.5" />}>
                  <div className="space-y-2">
                    {item.listings
                      .sort((a, b) => a.price_cents - b.price_cents)
                      .map((l, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{
                            background: 'rgba(0, 26, 46, 0.4)',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">{l.supplier}</div>
                            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              SKU: {l.sku} · {l.in_stock ? `${l.stock_qty} in stock` : 'Out of stock'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold" style={{ color: '#00F0FF' }}>
                              ${(l.price_cents / 100).toFixed(2)}
                            </div>
                            {l.list_price_cents > l.price_cents && (
                              <div className="text-[10px] line-through" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                ${(l.list_price_cents / 100).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </Section>
              )}

              {/* Installation Intel */}
              {ctx && (ctx.installation_notes || ctx.installation_time_pro) && (
                <Section title="Installation" icon={<Wrench className="w-3.5 h-3.5" />}>
                  {ctx.installation_time_pro && (
                    <InfoRow icon={<Clock className="w-3 h-3" />} label="Est. Time (Pro)">
                      {ctx.installation_time_pro}
                    </InfoRow>
                  )}
                  {ctx.installation_time_diy && (
                    <InfoRow icon={<Clock className="w-3 h-3" />} label="Est. Time (DIY)">
                      {ctx.installation_time_diy}
                    </InfoRow>
                  )}
                  {ctx.installation_notes && (
                    <div className="text-xs leading-relaxed mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {ctx.installation_notes}
                    </div>
                  )}
                  {ctx.common_mistakes && (
                    <div className="mt-2 flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#FBBF24' }} />
                      <span className="text-[11px]" style={{ color: 'rgba(251, 191, 36, 0.7)' }}>
                        {ctx.common_mistakes}
                      </span>
                    </div>
                  )}
                </Section>
              )}

              {/* Companion Parts */}
              {ctx?.companion_parts && ctx.companion_parts.length > 0 && (
                <Section title="Often Ordered Together" icon={<Lightbulb className="w-3.5 h-3.5" />}>
                  <div className="flex flex-wrap gap-2">
                    {ctx.companion_parts.map((p, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded-lg"
                        style={{
                          background: 'rgba(0, 240, 255, 0.06)',
                          color: 'rgba(0, 240, 255, 0.7)',
                          border: '1px solid rgba(0, 240, 255, 0.1)',
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Failure context */}
              {ctx?.failure_mode && (
                <Section title="Failure Context" icon={<Info className="w-3.5 h-3.5" />}>
                  <div className="text-xs space-y-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <div><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Failure Mode:</strong> {ctx.failure_mode}</div>
                    {ctx.failure_consequence && (
                      <div><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Consequence:</strong> {ctx.failure_consequence}</div>
                    )}
                    {ctx.upgrade_recommendation && (
                      <div><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Upgrade:</strong> {ctx.upgrade_recommendation}</div>
                    )}
                  </div>
                </Section>
              )}

              {/* Sourcing */}
              {src?.estimated_price_range && (
                <Section title="Sourcing" icon={<Truck className="w-3.5 h-3.5" />}>
                  <InfoRow icon={<DollarSign className="w-3 h-3" />} label="Price Range">
                    {src.estimated_price_range}
                  </InfoRow>
                </Section>
              )}
            </div>

            {/* Bottom action bar */}
            <div
              className="absolute bottom-0 left-0 right-0 px-5 py-4"
              style={{
                background: 'linear-gradient(0deg, #000c18 60%, transparent)',
                paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
              }}
            >
              {item.status === 'pending' && (
                <button
                  onClick={() => {
                    onConfirm(item.id);
                    onClose();
                  }}
                  className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{
                    background: '#00F0FF',
                    color: '#000C18',
                    fontFamily: 'var(--font-montserrat)',
                    minHeight: '56px',
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Confirm Part
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---- Helper components ----

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: 'rgba(0, 240, 255, 0.6)' }}>{icon}</span>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-montserrat)' }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span style={{ color: 'rgba(255,255,255,0.25)' }}>{icon}</span>
      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}:
      </span>
      <span className="text-xs font-medium text-white">{children}</span>
    </div>
  );
}
