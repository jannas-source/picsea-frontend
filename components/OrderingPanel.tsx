"use client";

import React, { useState } from "react";
import { OrderingOption, IdentifiedPart, Listing } from "@/lib/types";
import { ShoppingCart, ExternalLink, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface OrderingPanelProps {
  part: IdentifiedPart;
  jobId?: string;
  userId?: string;
  sessionId?: string;
  onQuoteRequest?: (part: IdentifiedPart) => void;
}

const SUPPLIER_STYLES: Record<string, { bg: string; border: string; glow: string }> = {
  'CWR Distribution': {
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.25)',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  'West Marine': {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  'Defender Marine': {
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.25)',
    glow: 'rgba(249, 115, 22, 0.3)',
  },
  'Amazon': {
    bg: 'rgba(234, 179, 8, 0.12)',
    border: 'rgba(234, 179, 8, 0.25)',
    glow: 'rgba(234, 179, 8, 0.3)',
  },
};

const SUPPLIER_ICONS: Record<string, string> = {
  'CWR Distribution': '🏭',
  'West Marine': '⚓',
  'Defender Marine': '🛡️',
  'Amazon': '📦',
};

const ACTION_LABELS: Record<string, string> = {
  'request_quote': 'Request Quote',
  'search': 'Search',
  'affiliate_search': 'Find on',
};

async function logSupplierClick(data: {
  job_id?: string; part_id?: string; part_name?: string; part_mpn?: string;
  supplier_name: string; supplier_priority: number; action_type: string;
  clicked_url?: string | null; estimated_commission_pct?: number;
  estimated_part_value_cents?: number; user_id?: string; session_id?: string;
}) {
  try {
    await fetch(`${API_URL}/api/supplier-clicks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error('Failed to log supplier click:', err);
  }
}

function parseCommissionPct(estimate: string): number {
  const match = estimate.match(/(\d+)-(\d+)/);
  if (match) return (parseInt(match[1]) + parseInt(match[2])) / 2;
  const single = estimate.match(/(\d+)/);
  return single ? parseInt(single[1]) : 0;
}

function getPartValueCents(part: IdentifiedPart): number {
  if (!part.listings || part.listings.length === 0) return 0;
  const listing = part.listings[0];
  return listing.list_price_cents || listing.price_cents || 0;
}

export function OrderingPanel({ part, jobId, userId, sessionId, onQuoteRequest }: OrderingPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const options = part.ordering_options;

  if (!options || options.length === 0) return null;

  const handleClick = async (option: OrderingOption) => {
    await logSupplierClick({
      job_id: jobId, part_id: part.id, part_name: part.name, part_mpn: part.mpn,
      supplier_name: option.supplier, supplier_priority: option.priority,
      action_type: option.action, clicked_url: option.url,
      estimated_commission_pct: parseCommissionPct(option.commission_estimate),
      estimated_part_value_cents: getPartValueCents(part),
      user_id: userId, session_id: sessionId,
    });
    if (option.action === 'request_quote') {
      onQuoteRequest?.(part);
    } else if (option.url) {
      window.open(option.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden mt-2"
      style={{
        background: 'rgba(0, 18, 34, 0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left transition-colors duration-150"
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-3.5 h-3.5" style={{ color: '#34D399' }} />
          <span
            className="text-xs font-black uppercase tracking-wider"
            style={{ color: '#34D399', fontFamily: 'Montserrat, sans-serif' }}
          >
            Order This Part
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            {options.length} supplier{options.length !== 1 ? 's' : ''}
          </span>
        </div>
        {expanded
          ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
          : <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
        }
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 fade-in">
          {options.map((option, idx) => {
            const s = SUPPLIER_STYLES[option.supplier] || {
              bg: 'rgba(255,255,255,0.05)',
              border: 'rgba(255,255,255,0.1)',
              glow: 'rgba(255,255,255,0.2)',
            };
            return (
              <button
                key={idx}
                onClick={() => handleClick(option)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-white text-xs font-bold transition-all duration-150"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = `0 0 12px ${s.glow}`;
                  el.style.borderColor = s.glow;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = 'none';
                  el.style.borderColor = s.border;
                }}
              >
                <div className="flex items-center gap-2">
                  <span>{SUPPLIER_ICONS[option.supplier] || '🔗'}</span>
                  <span style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {option.action === 'request_quote'
                      ? `Request Quote — ${option.supplier}`
                      : `${ACTION_LABELS[option.action] || 'Open'} ${option.supplier}`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {option.type === 'primary' && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-black"
                      style={{ background: 'rgba(255,255,255,0.15)', fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Recommended
                    </span>
                  )}
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </div>
              </button>
            );
          })}

          <div
            className="text-[10px] pt-1 flex items-center gap-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <TrendingUp className="w-3 h-3" />
            Clicks tracked for analytics. Affiliate links help support PicSea.
          </div>
        </div>
      )}
    </div>
  );
}
