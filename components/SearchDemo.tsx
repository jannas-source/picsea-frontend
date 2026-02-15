"use client";

import React, { useState } from "react";
import { Search, Loader2, CheckCircle } from "lucide-react";

interface Part {
  id: string;
  manufacturer: string;
  mpn: string;
  name: string;
  category_name?: string;
}

interface SearchResult {
  count: number;
  parts: Part[];
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
      const data: SearchResult = await res.json();
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
      <div className="relative mb-8">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Try: Jabsco, Blue Sea, Garmin..."
            className="w-full pl-12 pr-28 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]/50 transition-all"
          />
          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="absolute right-2 px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((part) => (
            <button
              key={part.id}
              onClick={() => handlePartClick(part.id)}
              className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-white/50 block mb-2">{part.mpn}</span>
                  <h4 className="text-white font-bold mb-1">{part.name}</h4>
                  <p className="text-white/50 text-sm">{part.manufacturer}</p>
                </div>
              </div>
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
            className="bg-[#000C18] border border-white/20 rounded-2xl max-w-2xl w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <span className="text-xs font-mono text-white/50 block mb-2">{selectedPart.mpn}</span>
              <h3 className="text-2xl font-bold text-white mb-2">{selectedPart.name}</h3>
              <p className="text-white/60">{selectedPart.manufacturer}</p>
            </div>

            {selectedPart.listings && selectedPart.listings.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-xs text-white/40 mb-1">Dealer Price</p>
                  <p className="text-xl font-bold text-[#00F0FF]">
                    ${(selectedPart.listings[0].price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">List Price</p>
                  <p className="text-xl font-bold text-white">
                    ${(selectedPart.listings[0].list_price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Stock</p>
                  <div className="flex items-center gap-2">
                    {selectedPart.listings[0].in_stock ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white font-bold">{selectedPart.listings[0].stock_qty}</span>
                      </>
                    ) : (
                      <span className="text-red-400">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedPart(null)}
              className="w-full px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
