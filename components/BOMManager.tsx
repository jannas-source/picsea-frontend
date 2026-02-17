"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, FileDown, FileText, Trash2, Plus, Minus, Package } from "lucide-react";

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
    if (initialParts.length > 0) addParts(initialParts);
  }, [initialParts]);

  const addParts = (newParts: BOMPart[]) => {
    setParts(current => {
      const updated = [...current];
      newParts.forEach(np => {
        const existing = updated.find(p => p.id === np.id);
        if (existing) { existing.quantity = (existing.quantity || 1) + 1; }
        else { updated.push({ ...np, quantity: 1 }); }
      });
      return updated;
    });
    setShowBOM(true);
  };

  const updateQuantity = (partId: string, delta: number) => {
    setParts(current => current.map(p =>
      p.id === partId ? { ...p, quantity: Math.max(1, (p.quantity || 1) + delta) } : p
    ));
  };

  const removePart = (partId: string) => {
    setParts(current => current.filter(p => p.id !== partId));
  };

  const clearBOM = () => {
    if (confirm('Clear all parts from BOM?')) { setParts([]); setShowBOM(false); }
  };

  const calculateTotals = () => {
    let dealerTotal = 0, listTotal = 0;
    parts.forEach(part => {
      if (part.listings?.[0]) {
        dealerTotal += (part.listings[0].price_cents / 100) * (part.quantity || 1);
        listTotal += (part.listings[0].list_price_cents / 100) * (part.quantity || 1);
      }
    });
    return { dealerTotal, listTotal, savings: listTotal - dealerTotal };
  };

  const exportCSV = () => {
    const headers = ['Manufacturer', 'Part Number', 'Description', 'Quantity', 'Dealer Price', 'List Price', 'Subtotal', 'Supplier', 'SKU', 'Stock'];
    const rows = parts.map(p => {
      const l = p.listings?.[0];
      const qty = p.quantity || 1;
      const dp = l ? (l.price_cents / 100) : 0;
      const lp = l ? (l.list_price_cents / 100) : 0;
      return [p.manufacturer, p.mpn, `"${p.name}"`, qty, `$${dp.toFixed(2)}`, `$${lp.toFixed(2)}`, `$${(dp * qty).toFixed(2)}`, l?.supplier || '', l?.sku || '', l?.in_stock ? `Yes (${l.stock_qty})` : 'No'].join(',');
    });
    const { dealerTotal, listTotal, savings } = calculateTotals();
    rows.push('');
    rows.push(`Total,,,${parts.reduce((s, p) => s + (p.quantity || 1), 0)},$${dealerTotal.toFixed(2)},$${listTotal.toFixed(2)},$${savings.toFixed(2)}`);
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `PicSea_BOM_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const { dealerTotal, listTotal, savings } = calculateTotals();
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PicSea Bill of Materials</title>
<style>body{font-family:Inter,-apple-system,sans-serif;padding:40px;color:#000;font-size:12px}.header{border-bottom:3px solid #00F0FF;padding-bottom:20px;margin-bottom:30px}.header h1{margin:0;color:#000C18;font-family:Montserrat,sans-serif}.header p{margin:5px 0;color:#666}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#000C18;color:#00F0FF;text-align:left;padding:12px;font-size:12px;font-family:Montserrat,sans-serif}td{padding:10px 12px;border-bottom:1px solid #ddd;font-size:11px}.totals{margin-top:30px;padding:20px;background:#f9f9f9;border:2px solid #000C18}.totals div{display:flex;justify-content:space-between;margin:10px 0;font-size:14px}.totals .grand{font-size:18px;font-weight:bold;border-top:2px solid #000C18;padding-top:15px;margin-top:15px}.footer{margin-top:40px;text-align:center;color:#999;font-size:10px;border-top:1px solid #ddd;padding-top:20px}</style></head><body>
<div class="header"><h1>PicSea Bill of Materials</h1><p>Generated: ${new Date().toLocaleString()}</p><p>by 7-SENSE Marine</p></div>
<table><thead><tr><th>Qty</th><th>Manufacturer</th><th>Part #</th><th>Description</th><th>Dealer</th><th>List</th><th>Subtotal</th><th>Stock</th></tr></thead><tbody>
${parts.map(p => {
  const l = p.listings?.[0]; const qty = p.quantity || 1;
  const dp = l ? (l.price_cents / 100) : 0; const lp = l ? (l.list_price_cents / 100) : 0;
  return `<tr><td>${qty}</td><td>${p.manufacturer}</td><td>${p.mpn}</td><td>${p.name}</td><td>$${dp.toFixed(2)}</td><td>$${lp.toFixed(2)}</td><td>$${(dp * qty).toFixed(2)}</td><td>${l?.in_stock ? `✓ (${l.stock_qty})` : '✗ Out'}</td></tr>`;
}).join('')}
</tbody></table>
<div class="totals"><div><span>Total Items:</span><span>${parts.reduce((s, p) => s + (p.quantity || 1), 0)}</span></div><div><span>List Price Total:</span><span>$${listTotal.toFixed(2)}</span></div><div><span>Your Savings:</span><span style="color:#34D399">-$${savings.toFixed(2)}</span></div><div class="grand"><span>Dealer Price Total:</span><span style="color:#00F0FF">$${dealerTotal.toFixed(2)}</span></div></div>
<div class="footer"><p>PicSea by 7-SENSE Marine</p><p>Pricing subject to confirmation.</p></div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) win.onload = () => setTimeout(() => win.print(), 500);
  };

  const totals = calculateTotals();

  if (parts.length === 0) return null;

  return (
    <>
      {/* Floating BOM Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => setShowBOM(!showBOM)}
        className="fixed bottom-8 right-8 z-50 p-4 rounded-full transition-all duration-200"
        style={{
          background: '#00F0FF',
          color: '#000C18',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(0, 240, 255, 0.15)',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(0, 240, 255, 0.6), 0 0 80px rgba(0, 240, 255, 0.2)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(0, 240, 255, 0.15)')}
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {parts.length > 0 && (
            <span
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
              style={{ background: '#000C18', color: '#00F0FF', border: '1px solid rgba(0, 240, 255, 0.3)' }}
            >
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
            className="fixed inset-0 z-40 flex items-end md:items-center justify-center p-4"
            style={{ background: 'rgba(0, 6, 14, 0.88)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl"
              style={{
                background: 'rgba(0, 18, 34, 0.97)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                boxShadow: '0 0 60px rgba(0, 240, 255, 0.1), 0 30px 80px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Header */}
              <div
                className="p-6 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.12)' }}
              >
                <div>
                  <h2
                    className="text-2xl font-black text-white flex items-center gap-3"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <Package className="w-6 h-6" style={{ color: '#00F0FF' }} />
                    Bill of Materials
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {parts.length} part{parts.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportCSV}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 flex items-center gap-2"
                    style={{
                      background: 'rgba(0, 43, 69, 0.5)',
                      border: '1px solid rgba(0, 240, 255, 0.15)',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = '#00F0FF';
                      el.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = 'rgba(255,255,255,0.7)';
                      el.style.borderColor = 'rgba(0, 240, 255, 0.15)';
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={exportPDF}
                    className="px-4 py-2 rounded-xl text-sm font-black transition-all duration-150 flex items-center gap-2"
                    style={{
                      background: '#00F0FF',
                      color: '#000C18',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-sm)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
                  >
                    <FileDown className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>

              {/* Parts list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {parts.map((part) => (
                  <div
                    key={part.id}
                    className="p-4 rounded-xl transition-all duration-150"
                    style={{
                      background: 'rgba(0, 12, 24, 0.6)',
                      border: '1px solid rgba(0, 240, 255, 0.08)',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.15)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.08)')}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span
                            className="text-xs font-mono"
                            style={{ color: 'rgba(0, 240, 255, 0.6)' }}
                          >
                            {part.mpn}
                          </span>
                          {part.listings?.[0]?.in_stock ? (
                            <span className="text-xs flex items-center gap-1" style={{ color: '#34D399' }}>
                              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#34D399', animation: 'status-pulse-success 2.5s ease-in-out infinite' }} />
                              In Stock ({part.listings[0].stock_qty})
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: '#F87171' }}>Out of Stock</span>
                          )}
                        </div>
                        <h4 className="text-white font-bold mb-0.5">{part.name}</h4>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{part.manufacturer}</p>
                        {part.listings?.[0] && (
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                              Dealer:{' '}
                              <span
                                className="font-black"
                                style={{ color: '#00F0FF', fontFamily: 'Montserrat, sans-serif' }}
                              >
                                ${(part.listings[0].price_cents / 100).toFixed(2)}
                              </span>
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                              List:{' '}
                              <span className="font-semibold text-white">
                                ${(part.listings[0].list_price_cents / 100).toFixed(2)}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2.5">
                        <button
                          onClick={() => removePart(part.id)}
                          className="transition-colors"
                          style={{ color: 'rgba(255,255,255,0.3)' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#F87171')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div
                          className="flex items-center gap-1 rounded-xl p-1"
                          style={{
                            background: 'rgba(0, 43, 69, 0.6)',
                            border: '1px solid rgba(0, 240, 255, 0.12)',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(part.id, -1)}
                            className="p-1 rounded-lg transition-colors"
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0, 240, 255, 0.1)')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                          >
                            <Minus className="w-3.5 h-3.5 text-white" />
                          </button>
                          <span
                            className="text-white font-black w-7 text-center text-sm"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {part.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(part.id, 1)}
                            className="p-1 rounded-lg transition-colors"
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0, 240, 255, 0.1)')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Totals */}
              <div
                className="p-6"
                style={{
                  borderTop: '1px solid rgba(0, 240, 255, 0.1)',
                  background: 'rgba(0, 8, 18, 0.5)',
                }}
              >
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <span>List Price Total</span>
                    <span>${totals.listTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold" style={{ color: '#34D399' }}>
                    <span>Your Savings</span>
                    <span>-${totals.savings.toFixed(2)}</span>
                  </div>
                  <div
                    className="flex justify-between text-xl font-black pt-2"
                    style={{
                      color: '#00F0FF',
                      borderTop: '1px solid rgba(0, 240, 255, 0.15)',
                      fontFamily: 'Montserrat, sans-serif',
                      textShadow: '0 0 12px rgba(0, 240, 255, 0.4)',
                    }}
                  >
                    <span>Dealer Total</span>
                    <span>${totals.dealerTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={clearBOM}
                    className="flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-150"
                    style={{
                      background: 'rgba(248, 113, 113, 0.08)',
                      border: '1px solid rgba(248, 113, 113, 0.2)',
                      color: '#F87171',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(248, 113, 113, 0.15)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(248, 113, 113, 0.08)')}
                  >
                    Clear All
                  </button>
                  <button
                    className="flex-1 px-4 py-3 rounded-xl font-black transition-all duration-150"
                    style={{
                      background: '#00F0FF',
                      color: '#000C18',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-sm)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
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
