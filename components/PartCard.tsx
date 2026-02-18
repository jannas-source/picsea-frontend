'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { BOMItem } from '@/lib/types';
import {
  Package, Check, X, ChevronRight, Minus, Plus,
  AlertTriangle, ShieldCheck, Clock, Truck, Wrench,
  Link2,
} from 'lucide-react';

interface PartCardProps {
  item: BOMItem;
  vesselVoltage?: number;
  onConfirm: (id: string) => void;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, qty: number) => void;
  onTap: (item: BOMItem) => void;
}

function confidenceColor(c: number): string {
  if (c >= 0.95) return '#34D399';
  if (c >= 0.85) return '#00F0FF';
  if (c >= 0.70) return '#FBBF24';
  return '#F87171';
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string; label: string; icon: typeof Package }> = {
    pending: { bg: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', label: 'Pending', icon: Clock },
    ordered: { bg: 'rgba(0, 240, 255, 0.1)', color: '#00F0FF', label: 'Ordered', icon: Truck },
    received: { bg: 'rgba(52, 211, 153, 0.1)', color: '#34D399', label: 'Received', icon: Package },
    installed: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', label: 'Installed', icon: Wrench },
    verified: { bg: 'rgba(52, 211, 153, 0.2)', color: '#34D399', label: 'Verified', icon: Check },
    failed: { bg: 'rgba(248, 113, 113, 0.1)', color: '#F87171', label: 'Failed', icon: AlertTriangle },
  };
  return map[status] || map.pending;
}

function bestPrice(item: BOMItem): { price: number; supplier: string } | null {
  if (!item.listings || item.listings.length === 0) return null;
  const inStock = item.listings.filter((l) => l.in_stock);
  const sorted = (inStock.length > 0 ? inStock : item.listings).sort(
    (a, b) => a.price_cents - b.price_cents
  );
  return { price: sorted[0].price_cents, supplier: sorted[0].supplier };
}

function stockStatus(item: BOMItem): { label: string; color: string } | null {
  if (!item.listings || item.listings.length === 0) return null;
  const anyInStock = item.listings.some((l) => l.in_stock);
  const lowStock = item.listings.some((l) => l.in_stock && l.stock_qty <= 5);
  
  if (!anyInStock) return { label: 'Out of Stock', color: '#F87171' };
  if (lowStock) return { label: 'Low Stock', color: '#FBBF24' };
  return { label: 'In Stock', color: '#34D399' };
}

export function PartCard({ item, vesselVoltage, onConfirm, onRemove, onQuantityChange, onTap }: PartCardProps) {
  const x = useMotionValue(0);
  const bg = useTransform(x, [-120, -60, 0, 60, 120], [
    'rgba(248, 113, 113, 0.15)',
    'rgba(248, 113, 113, 0.08)',
    'rgba(0, 26, 46, 0.4)',
    'rgba(52, 211, 153, 0.08)',
    'rgba(52, 211, 153, 0.15)',
  ]);
  const iconLeftOpacity = useTransform(x, [-100, -40, 0], [1, 0.3, 0]);
  const iconRightOpacity = useTransform(x, [0, 40, 100], [0, 0.3, 1]);

  const [swiped, setSwiped] = useState(false);
  const price = bestPrice(item);
  const status = statusBadge(item.status);
  const StatusIcon = status.icon;
  const conf = item.confidence ?? 0;
  const confColor = confidenceColor(conf);
  const stock = stockStatus(item);
  const hasCompanions = item.intelligence?.context?.companion_parts && item.intelligence.context.companion_parts.length > 0;

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80;
    if (info.offset.x > threshold) {
      setSwiped(true);
      onConfirm(item.id);
    } else if (info.offset.x < -threshold) {
      setSwiped(true);
      onRemove(item.id);
    }
  };

  if (swiped) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-2">
      {/* Swipe indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none">
        <motion.div style={{ opacity: iconLeftOpacity }} className="flex items-center gap-2">
          <X className="w-6 h-6" style={{ color: '#F87171' }} />
          <span className="text-xs font-bold" style={{ color: '#F87171' }}>Remove</span>
        </motion.div>
        <motion.div style={{ opacity: iconRightOpacity }} className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: '#34D399' }}>Confirm</span>
          <Check className="w-6 h-6" style={{ color: '#34D399' }} />
        </motion.div>
      </div>

      {/* Draggable card */}
      <motion.div
        style={{ x, background: bg }}
        drag="x"
        dragConstraints={{ left: -140, right: 140 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative rounded-2xl px-4 py-3.5 cursor-grab active:cursor-grabbing"
        whileTap={{ scale: 0.985 }}
      >
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        />

        <div className="flex items-start gap-3">
          {/* Part icon / thumbnail */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(0, 240, 255, 0.06)',
              border: '1px solid rgba(0, 240, 255, 0.1)',
            }}
          >
            <Package className="w-5 h-5" style={{ color: 'rgba(0, 240, 255, 0.5)' }} />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-white truncate">{item.name}</span>
              {item.warnings && item.warnings.length > 0 && (
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FBBF24' }} />
              )}
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[11px] font-medium"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {item.manufacturer} · {item.mpn}
              </span>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Status badge */}
              <span
                className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{
                  background: status.bg,
                  color: status.color,
                  border: `1px solid ${status.color}20`,
                }}
              >
                <StatusIcon className="w-2.5 h-2.5" />
                {status.label}
              </span>

              {/* Confidence */}
              {conf > 0 && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    color: confColor,
                    background: `${confColor}15`,
                  }}
                >
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {Math.round(conf * 100)}%
                </span>
              )}

              {/* Stock status */}
              {stock && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    color: stock.color,
                    background: `${stock.color}10`,
                  }}
                >
                  {stock.label}
                </span>
              )}

              {/* Companion parts indicator */}
              {hasCompanions && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                  style={{
                    color: 'rgba(0, 240, 255, 0.6)',
                    background: 'rgba(0, 240, 255, 0.06)',
                  }}
                >
                  <Link2 className="w-2.5 h-2.5" />
                  +{item.intelligence!.context!.companion_parts!.length}
                </span>
              )}
            </div>
          </div>

          {/* Right side: quantity + expand */}
          <div className="flex flex-col items-end gap-2">
            {/* Quantity control */}
            <div
              className="flex items-center gap-1 rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.quantity > 1) onQuantityChange(item.id, item.quantity - 1);
                }}
                className="w-8 h-8 flex items-center justify-center"
                style={{ color: 'rgba(255,255,255,0.4)', minHeight: '36px', minWidth: '36px' }}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span
                className="text-sm font-bold text-white w-6 text-center"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {item.quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuantityChange(item.id, item.quantity + 1);
                }}
                className="w-8 h-8 flex items-center justify-center"
                style={{ color: 'rgba(255,255,255,0.4)', minHeight: '36px', minWidth: '36px' }}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Line total OR affiliate fallback buttons */}
            {price ? (
              <span className="text-xs font-bold" style={{ color: '#00F0FF' }}>
                ${((price.price * item.quantity) / 100).toFixed(2)}
              </span>
            ) : item.affiliateFallbacks && item.affiliateFallbacks.length > 0 ? (
              <div className="flex items-center gap-1">
                {item.affiliateFallbacks.slice(0, 2).map((af) => (
                  <a
                    key={af.vendor}
                    href={af.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 rounded-md text-[10px] font-bold transition-all active:scale-95"
                    style={{
                      background: 'rgba(255, 165, 0, 0.12)',
                      color: 'rgba(255, 165, 0, 0.9)',
                      border: '1px solid rgba(255, 165, 0, 0.2)',
                      whiteSpace: 'nowrap',
                    }}
                    title={`Find on ${af.label}`}
                  >
                    {af.label}
                  </a>
                ))}
              </div>
            ) : null}

            {/* Expand button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTap(item);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.3)',
                minHeight: '36px',
                minWidth: '36px',
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Item notes */}
        {item.notes && (
          <div
            className="mt-2 text-[11px] italic pl-[60px]"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {item.notes}
          </div>
        )}

        {/* Compatibility warning inline */}
        {item.intelligence?.context?.compatibility_warning && (
          <div
            className="mt-2 ml-[60px] flex items-start gap-1.5 p-2 rounded-lg"
            style={{
              background: 'rgba(251, 191, 36, 0.06)',
              border: '1px solid rgba(251, 191, 36, 0.12)',
            }}
          >
            <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#FBBF24' }} />
            <span className="text-[10px]" style={{ color: 'rgba(251, 191, 36, 0.7)' }}>
              {item.intelligence.context.compatibility_warning}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
