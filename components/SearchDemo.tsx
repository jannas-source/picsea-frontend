"use client";

import React, { useState } from "react";
import { Search, Loader2, X } from "lucide-react";

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
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handlePartClick = async (partId: string) => {
    try {
      const res = await fetch(`https://api.picsea.app/api/parts/${partId}`);
      const data = await res.json();
      setSelectedPart(data);
    } catch {
      console.error('Failed to load part');
    }
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 pointer-events-none" style={{ color: 'rgba(0, 240, 255, 0.35)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Search Jabsco, Blue Sea, Garmin..."
            className="w-full pl-11 pr-28 py-3.5 rounded-xl text-white text-sm"
            style={{
              background: 'rgba(0, 26, 46, 0.5)',
              border: '1px solid rgba(0, 240, 255, 0.12)',
              outline: 'none',
            }}
            onFocus={e => {
              (e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.3)';
              (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(0, 240, 255, 0.06)';
            }}
            onBlur={e => {
              (e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.12)';
              (e.target as HTMLElement).style.boxShadow = 'none';
            }}
          />
          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="absolute right-1.5 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5"
            style={{
              background: 'var(--cyan)',
              color: '#000C18',
              fontFamily: 'Montserrat, sans-serif',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-sm)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : 'Search'
            }
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3 stagger-children">
          {results.map((part) => (
            <button
              key={part.id}
              onClick={() => handlePartClick(part.id)}
              className="p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: 'rgba(0, 26, 46, 0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(0, 240, 255, 0.2)';
                el.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.04)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(255,255,255,0.06)';
                el.style.boxShadow = 'none';
              }}
            >
              <span className="text-[11px] font-mono block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {part.mpn}
              </span>
              <h4 className="text-white text-sm font-semibold mb-0.5 line-clamp-1">{part.name}</h4>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{part.manufacturer}</p>
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0, 8, 18, 0.88)', backdropFilter: 'blur(12px)' }}
          onClick={() => setSelectedPart(null)}
        >
          <div
            className="max-w-lg w-full p-6 rounded-2xl scale-in"
            style={{
              background: 'rgba(0, 18, 34, 0.95)',
              border: '1px solid rgba(0, 240, 255, 0.18)',
              boxShadow: '0 0 50px rgba(0, 240, 255, 0.08), 0 25px 60px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="text-xs font-mono block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {selectedPart.mpn}
                </span>
                <h3
                  className="text-xl font-bold text-white mb-1"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {selectedPart.name}
                </h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{selectedPart.manufacturer}</p>
              </div>
              <button
                onClick={() => setSelectedPart(null)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedPart.listings && selectedPart.listings.length > 0 && (
              <div
                className="grid grid-cols-3 gap-4 p-4 rounded-xl"
                style={{
                  background: 'rgba(0, 26, 46, 0.6)',
                  border: '1px solid rgba(0, 240, 255, 0.1)',
                }}
              >
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider mb-1 font-bold"
                    style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Dealer
                  </p>
                  <p
                    className="text-lg font-black"
                    style={{
                      color: '#00F0FF',
                      fontFamily: 'Montserrat, sans-serif',
                      textShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
                    }}
                  >
                    ${(selectedPart.listings[0].price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider mb-1 font-bold"
                    style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    List
                  </p>
                  <p className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    ${(selectedPart.listings[0].list_price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider mb-1 font-bold"
                    style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Stock
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {selectedPart.listings[0].in_stock ? (
                      <>
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: '#34D399', animation: 'status-pulse-success 2.5s ease-in-out infinite' }}
                        />
                        <span className="text-white font-semibold">{selectedPart.listings[0].stock_qty}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F87171' }} />
                        <span className="text-sm" style={{ color: '#F87171' }}>Out of Stock</span>
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
