"use client";

import React, { useState, useCallback } from "react";
import { Job, BOMItem, JobPhoto, IdentifiedPart, ItemStatus } from "@/lib/types";
import { createPhoto, partToBOMItem, identifyPhoto, searchParts, calculateJobProgress, createTemplateFromJob } from "@/lib/store";
import { WarningBadge, ConfidenceIndicator, ItemStatusTracker, InstallCapture } from "./ValidationPanel";
import {
  ArrowLeft, Camera, Package, FileText, Upload, Loader2, X, Plus,
  Check, Search, Trash2, Minus, ChevronDown, ChevronUp, AlertCircle,
  Ship, Download, CheckCircle, ShieldCheck, ClipboardList, BookOpen,
  Clock, Save
} from "lucide-react";

interface JobWorkspaceProps {
  job: Job;
  onUpdate: (job: Job) => void;
  onBack: () => void;
}

type Tab = 'photos' | 'bom' | 'install' | 'export';

export function JobWorkspace({ job, onUpdate, onBack }: JobWorkspaceProps) {
  const [tab, setTab] = useState<Tab>('photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IdentifiedPart[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [capturingInstall, setCapturingInstall] = useState<string | null>(null);
  const [lessonsLearned, setLessonsLearned] = useState(job.lessonsLearned || '');
  const [jobNotes, setJobNotes] = useState(job.notes || '');
  const [actualHours, setActualHours] = useState(job.actualHours?.toString() || '');

  // --- Photo handling ---
  const handleFiles = useCallback(async (files: FileList) => {
    const newPhotos: JobPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      newPhotos.push(createPhoto(dataUrl, file.name));
    }
    const updated = { ...job, photos: [...job.photos, ...newPhotos] };
    onUpdate(updated);

    // Auto-identify each photo
    for (const photo of newPhotos) {
      try {
        const updatedPhoto = { ...photo, status: 'identifying' as const };
        onUpdate({
          ...updated,
          photos: updated.photos.map(p => p.id === photo.id ? updatedPhoto : p),
        });

        const result = await identifyPhoto(photo.file);
        const identified: JobPhoto = {
          ...photo,
          status: 'identified',
          identifiedParts: result.parts,
          notes: result.notes || '',
        };

        // Auto-add to BOM
        const newBomItems = result.parts.map(p => partToBOMItem(p, photo.id));
        updated.photos = updated.photos.map(p => p.id === photo.id ? identified : p);
        updated.bom = [...updated.bom, ...newBomItems];
        onUpdate({ ...updated });
      } catch {
        updated.photos = updated.photos.map(p =>
          p.id === photo.id ? { ...p, status: 'failed' as const } : p
        );
        onUpdate({ ...updated });
      }
    }
  }, [job, onUpdate]);

  const removePhoto = (photoId: string) => {
    onUpdate({
      ...job,
      photos: job.photos.filter(p => p.id !== photoId),
    });
  };

  // --- BOM handling ---
  const updateBOMItem = (itemId: string, changes: Partial<BOMItem>) => {
    onUpdate({
      ...job,
      bom: job.bom.map(item => item.id === itemId ? { ...item, ...changes } : item),
    });
  };

  const removeBOMItem = (itemId: string) => {
    onUpdate({ ...job, bom: job.bom.filter(item => item.id !== itemId) });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchParts(searchQuery);
      setSearchResults(results);
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  const addSearchResult = (part: IdentifiedPart) => {
    const bomItem = partToBOMItem(part);
    onUpdate({ ...job, bom: [...job.bom, bomItem] });
    setSearchResults(prev => prev.filter(p => p.id !== part.id));
  };

  // --- Status ---
  const updateStatus = (status: Job['status']) => {
    onUpdate({ ...job, status });
  };

  // --- Calculations ---
  const bomTotals = job.bom.reduce((acc, item) => {
    const listing = item.listings?.[0];
    if (listing) {
      acc.dealer += (listing.price_cents / 100) * item.quantity;
      acc.list += (listing.list_price_cents / 100) * item.quantity;
    }
    acc.items += item.quantity;
    return acc;
  }, { dealer: 0, list: 0, items: 0 });

  // --- Export ---
  const exportCSV = () => {
    const headers = ['Qty', 'Manufacturer', 'Part Number', 'Description', 'Dealer Price', 'List Price', 'Subtotal', 'Supplier', 'SKU', 'In Stock', 'Notes'];
    const rows = job.bom.map(item => {
      const l = item.listings?.[0];
      const dp = l ? (l.price_cents / 100) : 0;
      const lp = l ? (l.list_price_cents / 100) : 0;
      return [
        item.quantity,
        item.manufacturer,
        item.mpn,
        `"${item.name}"`,
        dp.toFixed(2),
        lp.toFixed(2),
        (dp * item.quantity).toFixed(2),
        l?.supplier || '',
        l?.sku || '',
        l?.in_stock ? 'Yes' : 'No',
        `"${item.notes}"`
      ].join(',');
    });
    rows.push('');
    rows.push(`${bomTotals.items},,,TOTAL,${bomTotals.dealer.toFixed(2)},${bomTotals.list.toFixed(2)},${(bomTotals.list - bomTotals.dealer).toFixed(2)}`);

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `PicSea_PO_${job.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportPDF = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Purchase Order - ${job.name}</title>
<style>
body{font-family:Inter,-apple-system,sans-serif;padding:40px;color:#000;font-size:12px}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #00F0FF;padding-bottom:16px;margin-bottom:24px}
.header h1{margin:0;font-size:20px;color:#000C18}
.header .meta{text-align:right;color:#666;font-size:11px}
.info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.info-block{background:#f8f9fa;padding:12px;border-radius:6px}
.info-block h3{font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#666;margin-bottom:6px}
table{width:100%;border-collapse:collapse;margin:20px 0}
th{background:#000C18;color:#00F0FF;text-align:left;padding:8px 12px;font-size:10px;text-transform:uppercase;letter-spacing:0.05em}
td{padding:8px 12px;border-bottom:1px solid #eee;font-size:11px}
.totals{margin-top:20px;text-align:right}
.totals div{margin:4px 0;font-size:13px}
.totals .grand{font-size:18px;font-weight:bold;color:#000C18;border-top:2px solid #000C18;padding-top:8px;margin-top:8px}
.footer{margin-top:40px;text-align:center;color:#999;font-size:9px;border-top:1px solid #ddd;padding-top:16px}
</style></head><body>
<div class="header">
  <div><h1>Purchase Order</h1><p style="color:#666;margin:4px 0 0">${job.name}</p></div>
  <div class="meta"><div>PicSea by 7-SENSE Marine</div><div>${new Date().toLocaleDateString()}</div><div>Job #${job.id.toUpperCase()}</div></div>
</div>
<div class="info">
  <div class="info-block"><h3>Vessel</h3><div>${job.vessel || '—'}</div></div>
  <div class="info-block"><h3>Client</h3><div>${job.client || '—'}</div></div>
</div>
<table><thead><tr><th>Qty</th><th>Manufacturer</th><th>Part #</th><th>Description</th><th>Unit Price</th><th>Subtotal</th><th>Stock</th></tr></thead><tbody>
${job.bom.map(item => {
  const l = item.listings?.[0]; const dp = l ? (l.price_cents / 100) : 0;
  return `<tr><td>${item.quantity}</td><td>${item.manufacturer}</td><td>${item.mpn}</td><td>${item.name}</td><td>$${dp.toFixed(2)}</td><td>$${(dp * item.quantity).toFixed(2)}</td><td>${l?.in_stock ? '✓' : '✗'}</td></tr>`;
}).join('')}
</tbody></table>
<div class="totals">
  <div>Items: ${bomTotals.items}</div>
  <div>List Total: $${bomTotals.list.toFixed(2)}</div>
  <div style="color:#34D399">Savings: -$${(bomTotals.list - bomTotals.dealer).toFixed(2)}</div>
  <div class="grand">Total: $${bomTotals.dealer.toFixed(2)}</div>
</div>
<div class="footer">PicSea by 7-SENSE Marine &bull; Generated ${new Date().toLocaleString()} &bull; Pricing subject to confirmation</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) win.onload = () => setTimeout(() => win.print(), 300);
  };

  function downloadBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const installedCount = job.bom.filter(b => b.status === 'installed' || b.status === 'verified').length;
  
  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'photos', label: 'Capture', icon: Camera, count: job.photos.length },
    { key: 'bom', label: 'BOM', icon: Package, count: job.bom.length },
    { key: 'install', label: 'Install & Verify', icon: ShieldCheck, count: installedCount },
    { key: 'export', label: 'Export / PO', icon: FileText },
  ];

  return (
    <div className="fade-in">
      {/* Job Header */}
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold">{job.name}</h2>
              <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                {job.vessel && <span className="flex items-center gap-1"><Ship className="w-3 h-3" />{job.vessel}</span>}
                {job.client && <span>{job.client}</span>}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-[var(--text-tertiary)]">Est. Total</div>
              <div className="text-lg font-bold text-[var(--cyan)] glow-text">${bomTotals.dealer.toFixed(2)}</div>
            </div>
            <select
              value={job.status}
              onChange={e => updateStatus(e.target.value as Job['status'])}
              className="text-xs font-medium rounded-lg px-3 py-1.5"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="ordered">Ordered</option>
              <option value="installing">Installing</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] px-5">
        <div className="max-w-5xl mx-auto flex gap-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === t.key
                  ? 'border-[var(--cyan)] text-[var(--cyan)]'
                  : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface)] font-semibold">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-5 py-6">
        {/* ==================== PHOTOS TAB ==================== */}
        {tab === 'photos' && (
          <div className="space-y-6 fade-in">
            {/* Batch upload */}
            <div
              className="glass rounded-xl p-8 text-center cursor-pointer hover:border-[var(--border-active)] transition-all relative"
              onClick={() => document.getElementById('batch-upload')?.click()}
            >
              <input
                id="batch-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => e.target.files && handleFiles(e.target.files)}
              />
              <Upload className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
              <h3 className="text-sm font-semibold mb-1">Drop photos or click to upload</h3>
              <p className="text-xs text-[var(--text-tertiary)]">
                Upload multiple photos — each will be auto-identified and added to BOM
              </p>
            </div>

            {/* Photo grid */}
            {job.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {job.photos.map(photo => (
                  <div key={photo.id} className="glass rounded-xl overflow-hidden group relative">
                    <img src={photo.file} alt={photo.filename} className="w-full h-40 object-cover" />
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[var(--text-tertiary)] truncate">{photo.filename}</span>
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {photo.status === 'identifying' && (
                        <div className="flex items-center gap-1.5 text-[var(--cyan)] text-xs">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Identifying...
                        </div>
                      )}
                      {photo.status === 'identified' && (
                        <div className="flex items-center gap-1.5 text-[var(--success)] text-xs">
                          <CheckCircle className="w-3 h-3" />
                          {photo.identifiedParts.length} part{photo.identifiedParts.length !== 1 ? 's' : ''}
                        </div>
                      )}
                      {photo.status === 'failed' && (
                        <div className="flex items-center gap-1.5 text-[var(--danger)] text-xs">
                          <AlertCircle className="w-3 h-3" />
                          Failed
                        </div>
                      )}
                      {photo.status === 'pending' && (
                        <div className="text-xs text-[var(--text-tertiary)]">Pending</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {job.photos.length === 0 && (
              <div className="text-center py-12 text-[var(--text-tertiary)] text-sm">
                No photos yet. Upload photos of parts to auto-identify them.
              </div>
            )}
          </div>
        )}

        {/* ==================== BOM TAB ==================== */}
        {tab === 'bom' && (
          <div className="space-y-4 fade-in">
            {/* Search to add parts */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search parts to add (name, part number, brand...)"
                  className="w-full pl-9"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 bg-[var(--cyan)] text-[var(--abyss)] font-semibold text-sm rounded-lg disabled:opacity-50 hover:shadow-[0_0_16px_var(--cyan-glow)] transition-all flex items-center gap-2"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="glass rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Search Results</h4>
                {searchResults.map(part => (
                  <div key={part.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--cyan)]">{part.mpn}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">{part.manufacturer}</span>
                      </div>
                      <div className="text-sm truncate">{part.name}</div>
                      {part.listings?.[0] && (
                        <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          ${(part.listings[0].price_cents / 100).toFixed(2)} dealer
                          {part.listings[0].in_stock ? ` • In stock (${part.listings[0].stock_qty})` : ' • Out of stock'}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => addSearchResult(part)}
                      className="px-3 py-1.5 text-xs font-semibold text-[var(--cyan)] border border-[var(--border-active)] rounded-lg hover:bg-[var(--cyan-dim)] transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSearchResults([])}
                  className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  Clear results
                </button>
              </div>
            )}

            {/* BOM Table */}
            {job.bom.length > 0 ? (
              <div className="glass rounded-xl overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Qty</th>
                      <th>Part</th>
                      <th>Manufacturer</th>
                      <th>Dealer</th>
                      <th>List</th>
                      <th>Subtotal</th>
                      <th>Stock</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.bom.map(item => {
                      const l = item.listings?.[0];
                      const dp = l ? (l.price_cents / 100) : 0;
                      const lp = l ? (l.list_price_cents / 100) : 0;

                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateBOMItem(item.id, { quantity: Math.max(1, item.quantity - 1) })} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                              <button onClick={() => updateBOMItem(item.id, { quantity: item.quantity + 1 })} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="text-xs font-mono text-[var(--cyan)] mb-0.5">{item.mpn}</div>
                            <div className="text-sm font-medium truncate max-w-[240px]">{item.name}</div>
                          </td>
                          <td className="text-[var(--text-secondary)]">{item.manufacturer}</td>
                          <td className="text-[var(--cyan)] font-semibold">${dp.toFixed(2)}</td>
                          <td className="text-[var(--text-tertiary)]">${lp.toFixed(2)}</td>
                          <td className="font-semibold">${(dp * item.quantity).toFixed(2)}</td>
                          <td>
                            {l?.in_stock ? (
                              <span className="flex items-center gap-1 text-[var(--success)] text-xs">
                                <div className="status-dot status-active" style={{ width: 6, height: 6 }} />
                                {l.stock_qty}
                              </span>
                            ) : (
                              <span className="text-[var(--danger)] text-xs">Out</span>
                            )}
                          </td>
                          <td>
                            <button onClick={() => removeBOMItem(item.id)} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
                  <div className="flex justify-end gap-8 text-sm">
                    <div className="text-[var(--text-tertiary)]">
                      {bomTotals.items} items • List: ${bomTotals.list.toFixed(2)} •
                      <span className="text-[var(--success)] ml-1">Save ${(bomTotals.list - bomTotals.dealer).toFixed(2)}</span>
                    </div>
                    <div className="font-bold text-[var(--cyan)] text-base glow-text">
                      Total: ${bomTotals.dealer.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <Package className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3 opacity-40" />
                <h3 className="text-sm font-semibold mb-1 text-[var(--text-secondary)]">No parts in BOM</h3>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Upload photos to auto-identify parts, or search manually above.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== INSTALL & VERIFY TAB ==================== */}
        {tab === 'install' && (
          <div className="space-y-6 fade-in">
            {/* Progress overview */}
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[var(--cyan)]" />
                  Installation Progress
                </h3>
                <span className="text-sm font-bold text-[var(--cyan)]">{calculateJobProgress(job)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden mb-4">
                <div className="h-full rounded-full bg-[var(--cyan)] transition-all" style={{ width: `${calculateJobProgress(job)}%` }} />
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {(['pending', 'ordered', 'received', 'installed', 'verified'] as ItemStatus[]).map(s => {
                  const count = job.bom.filter(b => b.status === s).length;
                  return (
                    <div key={s} className="glass rounded-lg p-2">
                      <div className="font-bold text-lg">{count}</div>
                      <div className="text-[var(--text-tertiary)] capitalize">{s}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parts checklist with status pipeline */}
            {job.bom.length > 0 ? (
              <div className="space-y-2">
                {job.bom.map(item => (
                  <div key={item.id} className="glass rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[var(--cyan)]">{item.mpn}</span>
                          <span className="text-xs text-[var(--text-tertiary)]">{item.manufacturer}</span>
                          {item.confidence && <ConfidenceIndicator score={item.confidence} showLabel={false} />}
                          {item.warnings && item.warnings.length > 0 && <WarningBadge warnings={item.warnings} />}
                        </div>
                        <p className="text-sm font-medium mt-0.5">{item.name} ×{item.quantity}</p>
                      </div>
                    </div>
                    
                    <ItemStatusTracker
                      status={item.status}
                      onStatusChange={(status) => updateBOMItem(item.id, { status: status as ItemStatus })}
                    />
                    
                    {/* Install capture button */}
                    {item.status === 'received' && (
                      <button
                        onClick={() => setCapturingInstall(item.id)}
                        className="mt-2 text-xs text-[var(--cyan)] flex items-center gap-1 hover:underline"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        Record installation details
                      </button>
                    )}
                    
                    {/* Installer notes */}
                    {item.installerNotes && (
                      <div className="mt-2 text-xs text-[var(--text-secondary)] bg-[var(--surface)] rounded p-2">
                        📝 {item.installerNotes}
                      </div>
                    )}
                    
                    {/* Install capture form */}
                    {capturingInstall === item.id && (
                      <div className="mt-3">
                        <InstallCapture
                          itemId={item.id}
                          partName={item.name}
                          onSubmit={({ hoursTaken, outcome, notes }) => {
                            updateBOMItem(item.id, { 
                              status: outcome === 'failed' ? 'failed' : 'installed' as ItemStatus,
                              installerNotes: notes,
                            });
                            setCapturingInstall(null);
                          }}
                          onCancel={() => setCapturingInstall(null)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--text-tertiary)] text-sm">
                Add parts to the BOM first, then track installation here.
              </div>
            )}

            {/* Time & Cost Tracking */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[var(--cyan)]" />
                Time & Cost Tracking
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">Estimated Hours</label>
                  <input type="number" step="0.5" value={job.estimatedHours || ''} 
                    onChange={e => onUpdate({ ...job, estimatedHours: parseFloat(e.target.value) || undefined })}
                    placeholder="8" className="w-full" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">Actual Hours</label>
                  <input type="number" step="0.5" value={actualHours}
                    onChange={e => { setActualHours(e.target.value); onUpdate({ ...job, actualHours: parseFloat(e.target.value) || undefined }); }}
                    placeholder="—" className="w-full" />
                </div>
              </div>
              {job.estimatedHours && job.actualHours && (
                <div className={`text-xs p-2 rounded ${
                  job.actualHours > job.estimatedHours * 1.2 ? 'bg-red-500/10 text-red-400' :
                  job.actualHours > job.estimatedHours ? 'bg-amber-500/10 text-amber-400' :
                  'bg-green-500/10 text-green-400'
                }`}>
                  {job.actualHours > job.estimatedHours 
                    ? `⚠ ${((job.actualHours / job.estimatedHours - 1) * 100).toFixed(0)}% over estimate — adjust template for next time`
                    : `✓ ${((1 - job.actualHours / job.estimatedHours) * 100).toFixed(0)}% under estimate`
                  }
                </div>
              )}
            </div>

            {/* Lessons Learned */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-[var(--cyan)]" />
                Lessons Learned
              </h3>
              <textarea
                value={lessonsLearned}
                onChange={e => { setLessonsLearned(e.target.value); }}
                onBlur={() => onUpdate({ ...job, lessonsLearned })}
                placeholder="What went well? What would you do differently? Any tips for next time?"
                rows={4}
                className="w-full mb-3"
              />
              <textarea
                value={jobNotes}
                onChange={e => { setJobNotes(e.target.value); }}
                onBlur={() => onUpdate({ ...job, notes: jobNotes })}
                placeholder="General job notes..."
                rows={2}
                className="w-full"
              />
              
              {/* Save as template */}
              {job.status === 'complete' && job.bom.length > 0 && (
                <button
                  onClick={() => {
                    const name = prompt('Template name:', job.name);
                    if (name) {
                      const template = createTemplateFromJob(job, name);
                      // Save to localStorage
                      const existing = JSON.parse(localStorage.getItem('picsea_templates') || '[]');
                      existing.push(template);
                      localStorage.setItem('picsea_templates', JSON.stringify(existing));
                      alert(`Template "${name}" saved with ${template.defaultParts.length} parts!`);
                    }
                  }}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-[var(--cyan)]/10 text-[var(--cyan)] text-xs font-semibold rounded-lg hover:bg-[var(--cyan)]/20 transition-all"
                >
                  <Save className="w-3 h-3" />
                  Save as Template (reuse on future jobs)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ==================== EXPORT TAB ==================== */}
        {tab === 'export' && (
          <div className="space-y-6 fade-in">
            {/* Summary */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--cyan)] uppercase tracking-wider mb-4">Order Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">Job</div>
                  <div className="font-semibold">{job.name}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">Vessel</div>
                  <div className="font-semibold">{job.vessel || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">Line Items</div>
                  <div className="font-semibold">{job.bom.length} ({bomTotals.items} units)</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">Dealer Total</div>
                  <div className="font-bold text-[var(--cyan)] text-xl glow-text">${bomTotals.dealer.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Vendor breakdown */}
            {job.bom.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--cyan)] uppercase tracking-wider mb-4">Vendor Breakdown</h3>
                <VendorBreakdown bom={job.bom} />
              </div>
            )}

            {/* Export buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={exportCSV}
                disabled={job.bom.length === 0}
                className="glass rounded-xl p-6 text-left hover:border-[var(--border-active)] transition-all disabled:opacity-30 group"
              >
                <FileText className="w-8 h-8 text-[var(--cyan)] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Export CSV</h3>
                <p className="text-xs text-[var(--text-tertiary)]">Download spreadsheet for vendor ordering or import into accounting</p>
              </button>
              <button
                onClick={exportPDF}
                disabled={job.bom.length === 0}
                className="glass rounded-xl p-6 text-left hover:border-[var(--border-active)] transition-all disabled:opacity-30 group"
              >
                <Download className="w-8 h-8 text-[var(--cyan)] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Purchase Order PDF</h3>
                <p className="text-xs text-[var(--text-tertiary)]">Print-ready PO with job details, parts list, and pricing</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Vendor breakdown component
function VendorBreakdown({ bom }: { bom: BOMItem[] }) {
  // Group by supplier
  const vendors: Record<string, { items: number; total: number; inStock: number; outOfStock: number }> = {};

  bom.forEach(item => {
    const supplier = item.listings?.[0]?.supplier || 'Unknown';
    if (!vendors[supplier]) vendors[supplier] = { items: 0, total: 0, inStock: 0, outOfStock: 0 };
    vendors[supplier].items += item.quantity;
    vendors[supplier].total += ((item.listings?.[0]?.price_cents || 0) / 100) * item.quantity;
    if (item.listings?.[0]?.in_stock) vendors[supplier].inStock += item.quantity;
    else vendors[supplier].outOfStock += item.quantity;
  });

  return (
    <div className="space-y-3">
      {Object.entries(vendors).map(([vendor, data]) => (
        <div key={vendor} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface)]">
          <div>
            <div className="font-semibold text-sm">{vendor}</div>
            <div className="text-xs text-[var(--text-tertiary)]">
              {data.items} items •
              <span className="text-[var(--success)]"> {data.inStock} in stock</span>
              {data.outOfStock > 0 && <span className="text-[var(--danger)]"> • {data.outOfStock} out</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-[var(--cyan)]">${data.total.toFixed(2)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
