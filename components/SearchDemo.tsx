"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Package, DollarSign, CheckCircle } from "lucide-react";

interface Part {
  id: string;
  manufacturer: string;
  mpn: string;
  name: string;
  category_name?: string;
  images?: string[];
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
      console.error("Search failed:", error);
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
      console.error("Failed to load part details:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative mb-8"
      >
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-bioluminescent-cyan/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Try: Jabsco, Blue Sea, Garmin, VETUS..."
            className="w-full pl-12 pr-32 py-4 bg-oceanic-navy/50 border border-bioluminescent-cyan/20 rounded-lg text-pure-white placeholder-pure-white/40 focus:outline-none focus:border-bioluminescent-cyan/50 focus:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all"
          />
          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="absolute right-2 px-6 py-2 bg-bioluminescent-cyan text-deep-abyss-blue font-bold rounded-md hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
        <p className="text-xs text-pure-white/40 mt-2 text-center">
          Live search across thousands of marine parts
        </p>
      </motion.div>

      {/* Results Grid */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          >
            {results.map((part, i) => (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handlePartClick(part.id)}
                className="group p-4 bg-oceanic-navy/40 border border-bioluminescent-cyan/10 rounded-lg hover:border-bioluminescent-cyan/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-bioluminescent-cyan/5 border border-bioluminescent-cyan/20 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-bioluminescent-cyan" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-bioluminescent-cyan/70 font-mono">{part.mpn}</p>
                    <h4 className="text-sm font-bold text-pure-white mt-1 line-clamp-2 group-hover:text-bioluminescent-cyan transition-colors">
                      {part.name}
                    </h4>
                    <p className="text-xs text-pure-white/50 mt-1">{part.manufacturer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Part Details Modal */}
      <AnimatePresence>
        {selectedPart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPart(null)}
            className="fixed inset-0 bg-deep-abyss-blue/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-oceanic-navy border border-bioluminescent-cyan/30 rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-bioluminescent-cyan/70 font-mono">{selectedPart.mpn}</p>
                  <h2 className="text-2xl font-bold text-pure-white mt-2">{selectedPart.name}</h2>
                  <p className="text-pure-white/60 mt-1">{selectedPart.manufacturer}</p>
                  {selectedPart.category_name && (
                    <p className="text-sm text-pure-white/40 mt-2">Category: {selectedPart.category_name}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPart(null)}
                  className="text-pure-white/60 hover:text-pure-white text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedPart.listings && selectedPart.listings.length > 0 && (
                <div className="space-y-4">
                  {selectedPart.listings.map((listing: any, i: number) => (
                    <div key={i} className="p-4 bg-deep-abyss-blue/50 rounded-lg border border-bioluminescent-cyan/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-pure-white/70">{listing.supplier}</span>
                        <span className="text-xs font-mono text-bioluminescent-cyan/70">SKU: {listing.sku}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-pure-white/50 mb-1">Dealer Price</p>
                          <p className="text-lg font-bold text-bioluminescent-cyan">
                            ${(listing.price_cents / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-pure-white/50 mb-1">List Price</p>
                          <p className="text-lg font-bold text-pure-white">
                            ${(listing.list_price_cents / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-pure-white/50 mb-1">Stock</p>
                          <div className="flex items-center gap-2">
                            {listing.in_stock ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-pure-white font-bold">{listing.stock_qty}</span>
                              </>
                            ) : (
                              <span className="text-red-400">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
