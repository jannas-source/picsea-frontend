"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  FileDown, 
  FileText, 
  Trash2, 
  Plus,
  Minus,
  DollarSign,
  Package,
  AlertCircle
} from "lucide-react";

interface BOMPart {
  id: string;
  manufacturer: string;
  mpn: string;
  name: string;
  quantity: number;
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

interface BOMManagerProps {
  initialParts?: BOMPart[];
}

export function BOMManager({ initialParts = [] }: BOMManagerProps) {
  const [parts, setParts] = useState<BOMPart[]>([]);
  const [showBOM, setShowBOM] = useState(false);

  useEffect(() => {
    if (initialParts.length > 0) {
      addParts(initialParts);
    }
  }, [initialParts]);

  const addParts = (newParts: BOMPart[]) => {
    setParts(current => {
      const updated = [...current];
      newParts.forEach(newPart => {
        const existing = updated.find(p => p.id === newPart.id);
        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
        } else {
          updated.push({ ...newPart, quantity: 1 });
        }
      });
      return updated;
    });
    setShowBOM(true);
  };

  const updateQuantity = (partId: string, delta: number) => {
    setParts(current =>
      current.map(p =>
        p.id === partId
          ? { ...p, quantity: Math.max(1, (p.quantity || 1) + delta) }
          : p
      )
    );
  };

  const removePart = (partId: string) => {
    setParts(current => current.filter(p => p.id !== partId));
  };

  const clearBOM = () => {
    if (confirm('Clear all parts from BOM?')) {
      setParts([]);
      setShowBOM(false);
    }
  };

  const calculateTotals = () => {
    let dealerTotal = 0;
    let listTotal = 0;

    parts.forEach(part => {
      if (part.listings && part.listings[0]) {
        const listing = part.listings[0];
        dealerTotal += (listing.price_cents / 100) * (part.quantity || 1);
        listTotal += (listing.list_price_cents / 100) * (part.quantity || 1);
      }
    });

    return { dealerTotal, listTotal, savings: listTotal - dealerTotal };
  };

  const exportCSV = () => {
    const headers = ['Manufacturer', 'Part Number', 'Description', 'Quantity', 'Dealer Price', 'List Price', 'Subtotal', 'Supplier', 'SKU', 'Stock'];
    const rows = parts.map(p => {
      const listing = p.listings?.[0];
      const qty = p.quantity || 1;
      const dealerPrice = listing ? (listing.price_cents / 100) : 0;
      const listPrice = listing ? (listing.list_price_cents / 100) : 0;
      
      return [
        p.manufacturer,
        p.mpn,
        `"${p.name}"`,
        qty,
        `$${dealerPrice.toFixed(2)}`,
        `$${listPrice.toFixed(2)}`,
        `$${(dealerPrice * qty).toFixed(2)}`,
        listing?.supplier || '',
        listing?.sku || '',
        listing?.in_stock ? `Yes (${listing.stock_qty})` : 'No'
      ].join(',');
    });

    const { dealerTotal, listTotal, savings } = calculateTotals();
    rows.push(''); // Empty line
    rows.push(`Total,,,${parts.reduce((sum, p) => sum + (p.quantity || 1), 0)},$${dealerTotal.toFixed(2)},$${listTotal.toFixed(2)},$${savings.toFixed(2)}`);

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PicSea_BOM_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    // For now, generate an HTML document that can be printed to PDF
    const { dealerTotal, listTotal, savings } = calculateTotals();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PicSea Bill of Materials</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #000; }
    .header { border-bottom: 3px solid #00F0FF; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #000C18; }
    .header p { margin: 5px 0; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #000C18; color: #00F0FF; text-align: left; padding: 12px; font-size: 12px; }
    td { padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 11px; }
    tr:hover { background: #f5f5f5; }
    .totals { margin-top: 30px; padding: 20px; background: #f9f9f9; border: 2px solid #000C18; }
    .totals div { display: flex; justify-content: space-between; margin: 10px 0; font-size: 14px; }
    .totals .grand-total { font-size: 18px; font-weight: bold; color: #00F0FF; border-top: 2px solid #000C18; padding-top: 15px; margin-top: 15px; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 10px; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PicSea Bill of Materials</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>by 7-SENSE Marine</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Qty</th>
        <th>Manufacturer</th>
        <th>Part Number</th>
        <th>Description</th>
        <th>Dealer Price</th>
        <th>List Price</th>
        <th>Subtotal</th>
        <th>Stock</th>
      </tr>
    </thead>
    <tbody>
      ${parts.map(p => {
        const listing = p.listings?.[0];
        const qty = p.quantity || 1;
        const dealerPrice = listing ? (listing.price_cents / 100) : 0;
        const listPrice = listing ? (listing.list_price_cents / 100) : 0;
        
        return `
          <tr>
            <td>${qty}</td>
            <td>${p.manufacturer}</td>
            <td>${p.mpn}</td>
            <td>${p.name}</td>
            <td>$${dealerPrice.toFixed(2)}</td>
            <td>$${listPrice.toFixed(2)}</td>
            <td>$${(dealerPrice * qty).toFixed(2)}</td>
            <td>${listing?.in_stock ? `✓ (${listing.stock_qty})` : '✗ Out'}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div><span>Total Items:</span><span>${parts.reduce((sum, p) => sum + (p.quantity || 1), 0)}</span></div>
    <div><span>List Price Total:</span><span>$${listTotal.toFixed(2)}</span></div>
    <div><span>Your Savings:</span><span style="color: #00F0FF;">-$${savings.toFixed(2)}</span></div>
    <div class="grand-total"><span>Dealer Price Total:</span><span>$${dealerTotal.toFixed(2)}</span></div>
  </div>

  <div class="footer">
    <p>PicSea by 7-SENSE Marine • https://api.picsea.app</p>
    <p>This is an estimate. Final pricing and availability subject to confirmation with supplier.</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          win.print();
        }, 500);
      };
    }
  };

  const totals = calculateTotals();

  if (parts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating BOM Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setShowBOM(!showBOM)}
        className="fixed bottom-8 right-8 z-50 p-4 bg-bioluminescent-cyan text-deep-abyss-blue rounded-full shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] transition-all"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {parts.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-deep-abyss-blue text-bioluminescent-cyan rounded-full text-xs font-bold flex items-center justify-center">
              {parts.length}
            </span>
          )}
        </div>
      </motion.button>

      {/* BOM Panel */}
      <AnimatePresence>
        {showBOM && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBOM(false)}
            className="fixed inset-0 bg-deep-abyss-blue/80 backdrop-blur-sm z-40 flex items-end md:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-oceanic-navy border border-bioluminescent-cyan/30 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-bioluminescent-cyan/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-pure-white flex items-center gap-3">
                      <Package className="w-7 h-7 text-bioluminescent-cyan" />
                      Bill of Materials
                    </h2>
                    <p className="text-pure-white/60 text-sm mt-1">{parts.length} part(s) selected</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportCSV}
                      className="px-4 py-2 bg-oceanic-navy/50 border border-bioluminescent-cyan/30 text-pure-white rounded-lg hover:bg-oceanic-navy/70 transition-all flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      CSV
                    </button>
                    <button
                      onClick={exportPDF}
                      className="px-4 py-2 bg-bioluminescent-cyan text-deep-abyss-blue font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Parts List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {parts.map((part) => (
                  <div
                    key={part.id}
                    className="p-4 bg-deep-abyss-blue/50 border border-bioluminescent-cyan/10 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-bioluminescent-cyan/70">{part.mpn}</span>
                          {part.listings?.[0]?.in_stock ? (
                            <span className="text-xs text-green-400">In Stock ({part.listings[0].stock_qty})</span>
                          ) : (
                            <span className="text-xs text-red-400">Out of Stock</span>
                          )}
                        </div>
                        <h4 className="text-pure-white font-bold mb-1">{part.name}</h4>
                        <p className="text-pure-white/60 text-sm">{part.manufacturer}</p>
                        {part.listings?.[0] && (
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-pure-white/50">Dealer: <span className="text-bioluminescent-cyan font-bold">${(part.listings[0].price_cents / 100).toFixed(2)}</span></span>
                            <span className="text-pure-white/50">List: <span className="text-pure-white">${(part.listings[0].list_price_cents / 100).toFixed(2)}</span></span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <button
                          onClick={() => removePart(part.id)}
                          className="text-pure-white/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 bg-oceanic-navy/50 border border-bioluminescent-cyan/20 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(part.id, -1)}
                            className="p-1 hover:bg-bioluminescent-cyan/10 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4 text-pure-white" />
                          </button>
                          <span className="text-pure-white font-bold w-8 text-center">{part.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(part.id, 1)}
                            className="p-1 hover:bg-bioluminescent-cyan/10 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4 text-pure-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Totals */}
              <div className="p-6 border-t border-bioluminescent-cyan/20 bg-deep-abyss-blue/30">
                <div className="space-y-3">
                  <div className="flex justify-between text-pure-white/60">
                    <span>List Price Total:</span>
                    <span>${totals.listTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Your Savings:</span>
                    <span>-${totals.savings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-bioluminescent-cyan pt-3 border-t border-bioluminescent-cyan/20">
                    <span>Dealer Price Total:</span>
                    <span>${totals.dealerTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={clearBOM}
                    className="flex-1 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-lg hover:bg-red-500/20 transition-all"
                  >
                    Clear All
                  </button>
                  <button
                    className="flex-1 px-4 py-3 bg-bioluminescent-cyan text-deep-abyss-blue font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
