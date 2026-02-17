'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { BOMItem } from '@/lib/types';
import {
  Package, Check, X, ChevronRight, Minus, Plus,
  AlertTriangle, ShieldCheck,
} from 'lucide-react';

interface PartCardProps {
  item: BOMItem;
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
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', label: 'Pending' },
    ordered: { bg: 'rgba(0, 240, 255, 0.1)', color: '#00F0FF', label: 'Ordered' },
    received: { bg: 'rgba(52, 211, 153, 0.1)', color: '#34D399', label: 'Received' },
    installed: { bg: 'rgba(52, 211, 153, 0.15)', color: '#34D399', label: 'Installed' },
    verified: { bg: 'rgba(52, 211, 153, 0.2)', color: '#34D399', label: 'Verified' },
    failed: { bg: 'rgba(248, 113, 113, 0.1)', color: '#F87171', label: 'Failed' },
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

export function PartCard({ item, onConfirm, onRemove, onQuantityChange, onTap }: PartCardProps) {
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
  const conf = item.confidence ?? 0;
  const confColor = confidenceColor(conf);

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
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status badge */}
              <span
                className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                style={{
                  background: status.bg,
                  color: status.color,
                  border: `1px solid ${status.color}20`,
                }}
              >
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

              {/* Price */}
              {price && (
                <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  ${(price.price / 100).toFixed(2)}
                  {item.quantity > 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}> ea</span>
                  )}
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

            {/* Line total */}
            {price && (
              <span className="text-xs font-bold" style={{ color: '#00F0FF' }}>
                ${((price.price * item.quantity) / 100).toFixed(2)}
              </span>
            )}

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
            className="mt-2 ml-15 text-[11px] italic pl-[60px]"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {item.notes}
          </div>
        )}
      </motion.div>
    </div>
  );
}
