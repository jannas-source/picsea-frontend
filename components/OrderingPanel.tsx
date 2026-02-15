"use client";

import React, { useState } from "react";
import { OrderingOption, IdentifiedPart, Listing } from "@/lib/types";
import {
  ShoppingCart, ExternalLink, FileText, Mail,
  ChevronDown, ChevronUp, TrendingUp, Store
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface OrderingPanelProps {
  part: IdentifiedPart;
  jobId?: string;
  userId?: string;
  sessionId?: string;
  onQuoteRequest?: (part: IdentifiedPart) => void;
}

const SUPPLIER_COLORS: Record<string, string> = {
  'CWR Distribution': 'bg-blue-600 hover:bg-blue-700',
  'West Marine': 'bg-emerald-600 hover:bg-emerald-700',
  'Defender Marine': 'bg-orange-600 hover:bg-orange-700',
  'Amazon': 'bg-yellow-600 hover:bg-yellow-700',
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
  job_id?: string;
  part_id?: string;
  part_name?: string;
  part_mpn?: string;
  supplier_name: string;
  supplier_priority: number;
  action_type: string;
  clicked_url?: string | null;
  estimated_commission_pct?: number;
  estimated_part_value_cents?: number;
  user_id?: string;
  session_id?: string;
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
  // "15-20%" → 17.5, "5-8%" → 6.5, "3-5%" → 4
  const match = estimate.match(/(\d+)-(\d+)/);
  if (match) return (parseInt(match[1]) + parseInt(match[2])) / 2;
  const single = estimate.match(/(\d+)/);
  return single ? parseInt(single[1]) : 0;
}

function getPartValueCents(part: IdentifiedPart): number {
  if (!part.listings || part.listings.length === 0) return 0;
  // Use first available price
  const listing = part.listings[0];
  return listing.list_price_cents || listing.price_cents || 0;
}

export function OrderingPanel({ part, jobId, userId, sessionId, onQuoteRequest }: OrderingPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const options = part.ordering_options;

  if (!options || options.length === 0) return null;

  const handleClick = async (option: OrderingOption) => {
    // Log the click
    await logSupplierClick({
      job_id: jobId,
      part_id: part.id,
      part_name: part.name,
      part_mpn: part.mpn,
      supplier_name: option.supplier,
      supplier_priority: option.priority,
      action_type: option.action,
      clicked_url: option.url,
      estimated_commission_pct: parseCommissionPct(option.commission_estimate),
      estimated_part_value_cents: getPartValueCents(part),
      user_id: userId,
      session_id: sessionId,
    });

    // Handle action
    if (option.action === 'request_quote') {
      onQuoteRequest?.(part);
    } else if (option.url) {
      window.open(option.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-[var(--surface-hover)] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-semibold text-green-400">Order This Part</span>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {options.length} supplier{options.length !== 1 ? 's' : ''}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3 h-3 text-[var(--text-tertiary)]" />
        ) : (
          <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)]" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(option)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-white text-xs font-medium transition-colors ${
                SUPPLIER_COLORS[option.supplier] || 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{SUPPLIER_ICONS[option.supplier] || '🔗'}</span>
                <span>
                  {option.action === 'request_quote'
                    ? `Request Quote from ${option.supplier}`
                    : `${ACTION_LABELS[option.action] || 'Open'} ${option.supplier}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {option.type === 'primary' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                    Recommended
                  </span>
                )}
                <ExternalLink className="w-3 h-3 opacity-60" />
              </div>
            </button>
          ))}

          <div className="text-[10px] text-[var(--text-tertiary)] pt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Clicks tracked for analytics. Affiliate links help support PicSea.
          </div>
        </div>
      )}
    </div>
  );
}
