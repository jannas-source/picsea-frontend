"use client";

import React, { useState } from "react";
import { Search, Loader2, CheckCircle, X } from "lucide-react";

interface Part {
  id: string;
  manufacturer: string;
  mpn: string;
  name: string;
  category_name?: string;
  listings?: Array<{
    supplier: string;
    sku: string;
    price_cents: number;
    list_price_cents: number;
    in_stock: boolean;
    stock_qty: number;
  }>;
}

export function SearchDemo() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Part[]>([]);
  const [selectedPart, setSelectedPart] = useState<any>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`https://api.picsea.app/api/parts/search?q=${encodeURIComponent(searchQuery)}&limit=6`);
      const data = await res.json();
      setResults(data.parts || []);
    } catch (error) {
      setResults([]);
    }
    setLoading(false);
  };

  const handlePartClick = async (partId: string) => {
    try {
      const res = await fetch(`https://api.picsea.app/api/parts/${partId}`);
      const data = await res.json();
      setSelectedPart(data);
    } catch (error) {
      console.error('Failed to load part');
    }
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-white/20" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Jabsco, Blue Sea, Garmin..."
            className="w-full pl-11 pr-24 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00F0FF]/30 focus:bg-white/[0.04] transition-all"
          />
          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="absolute right-1.5 px-5 py-2 bg-white text-[#000C18] text-sm font-semibold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {results.map((part) => (
            <button
              key={part.id}
              onClick={() => handlePartClick(part.id)}
              className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl hover:border-white/[0.15] transition-all text-left"
            >
              <span className="text-[11px] font-mono text-white/30 block mb-1">{part.mpn}</span>
              <h4 className="text-white text-sm font-medium mb-0.5 line-clamp-1">{part.name}</h4>
              <p className="text-white/35 text-xs">{part.manufacturer}</p>
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPart && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedPart(null)}
        >
          <div
            className="bg-[#000C18] border border-white/[0.12] rounded-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="text-xs font-mono text-white/30 block mb-1">{selectedPart.mpn}</span>
                <h3 className="text-xl font-semibold text-white mb-1">{selectedPart.name}</h3>
                <p className="text-white/40 text-sm">{selectedPart.manufacturer}</p>
              </div>
              <button
                onClick={() => setSelectedPart(null)}
                className="p-1.5 text-white/30 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedPart.listings && selectedPart.listings.length > 0 && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Dealer</p>
                  <p className="text-lg font-semibold text-[#00F0FF]">
                    ${(selectedPart.listings[0].price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">List</p>
                  <p className="text-lg font-semibold text-white/70">
                    ${(selectedPart.listings[0].list_price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Stock</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {selectedPart.listings[0].in_stock ? (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-white font-medium">{selectedPart.listings[0].stock_qty}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span className="text-red-400 text-sm">Out of Stock</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
