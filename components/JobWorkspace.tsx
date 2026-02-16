"use client";

import React, { useState, useCallback } from "react";
import { Job, BOMItem, JobPhoto, IdentifiedPart, ItemStatus } from "@/lib/types";
import { createPhoto, partToBOMItem, identifyPhoto, searchParts, calculateJobProgress, createTemplateFromJob } from "@/lib/store";
import { WarningBadge, ConfidenceIndicator, ItemStatusTracker, InstallCapture, IntelligencePanel } from "./ValidationPanel";
import { OrderingPanel } from "./OrderingPanel";
import { VesselContextForm, VesselContext, EMPTY_VESSEL, vesselContextToAPI, loadSavedVessels, saveVessel } from "./VesselContextForm";
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

interface FeedMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'ai';
  timestamp: Date;
}

export function JobWorkspace({ job, onUpdate, onBack }: JobWorkspaceProps) {
  const [tab, setTab] = useState<Tab>('photos');
  const [feed, setFeed] = useState<FeedMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IdentifiedPart[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [capturingInstall, setCapturingInstall] = useState<string | null>(null);
  const [lessonsLearned, setLessonsLearned] = useState(job.lessonsLearned || '');
  const [jobNotes, setJobNotes] = useState(job.notes || '');
  const [actualHours, setActualHours] = useState(job.actualHours?.toString() || '');
  const [aiDisclaimerAcknowledged, setAiDisclaimerAcknowledged] = useState(false);

  // --- Photo handling ---
  const handleFiles = useCallback(async (files: FileList) => {
    const newPhotos: JobPhoto[] = [];
    const pushFeed = (text: string, type: FeedMessage['type'] = 'info') => {
      setFeed(prev => [{ id: Math.random().toString(), text, type, timestamp: new Date() }, ...prev].slice(0, 50));
    };

    pushFeed(`Initializing scan for ${files.length} uploads...`, 'info');

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

    for (const photo of newPhotos) {
      try {
        pushFeed(`Analyzing ${photo.filename}...`, 'ai');
        const updatedPhoto = { ...photo, status: 'identifying' as const };
        onUpdate({
          ...updated,
          photos: updated.photos.map(p => p.id === photo.id ? updatedPhoto : p),
        });

        const vesselCtx = (job as any).vesselContext ? vesselContextToAPI((job as any).vesselContext) : undefined;
        const result = await identifyPhoto(photo.file, vesselCtx);
        
        if (result.parts?.length > 0) {
          pushFeed(`Success: Detected ${result.parts[0].name} (${result.parts[0].manufacturer})`, 'success');
        }

        const identified: JobPhoto = {
          ...photo,
          status: 'identified',
          identifiedParts: result.parts,
          notes: result.notes || '',
        };

        const newBomItems = result.parts.map(p => partToBOMItem(p, photo.id));
        updated.photos = updated.photos.map(p => p.id === photo.id ? identified : p);
        updated.bom = [...updated.bom, ...newBomItems];
        onUpdate({ ...updated });
      } catch (err) {
        pushFeed(`Error identifying ${photo.filename}: Check connection`, 'warning');
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
    { key: 'install', label: 'Verify', icon: ShieldCheck, count: installedCount },
    { key: 'export', label: 'Export', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full bg-[#000C18] font-sans">
      {/* Job Sub-Header: Mobile-First Edge-to-Edge */}
      <div className="sticky top-0 z-30 bg-[#000C18]/95 backdrop-blur-xl border-b border-[#00F0FF]/15 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white truncate tracking-tight">{job.name}</h1>
                <span className="px-1.5 py-0.5 rounded-[4px] text-[8px] font-black bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 uppercase tracking-widest">
                  {job.status}
                </span>
              </div>
              <p className="text-[10px] text-white/40 font-medium truncate mt-0.5 flex items-center gap-1">
                <Ship className="w-2.5 h-2.5 text-[#00F0FF]/40" /> 
                {job.vessel || job.vesselContext?.name || "Unassigned Vessel"}
              </p>
            </div>
          </div>
          <div className="text-right bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <span className="text-[9px] text-white/30 block leading-none mb-1 font-bold uppercase tracking-widest">Job Value</span>
            <span className="text-sm font-black text-[#00F0FF] tabular-nums tracking-tight">
              ${bomTotals.dealer.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation: High-Density Mobile HUD */}
      <div className="px-4 py-2 bg-[#000C18] sticky top-[73px] z-20 border-b border-white/5 shadow-2xl">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all relative
                ${tab === t.key ? 'bg-[#00F0FF]/10 text-[#00F0FF] shadow-[inset_0_1px_1px_rgba(0,240,255,0.2)]' : 'text-white/30 hover:text-white/50'}
              `}
            >
              <t.icon className={`w-4 h-4 mb-1.5 ${tab === t.key ? 'text-[#00F0FF]' : 'text-white/20'}`} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className="absolute top-1 right-2 text-[8px] px-1 rounded-full bg-[#00F0FF] text-[#000C18] font-black shadow-lg">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {/* ==================== PHOTOS TAB ==================== */}
        {tab === 'photos' && (
          <div className="space-y-6 fade-in">
            {/* Desktop-only upload zone (hidden on mobile, replaced by FAB) */}
            <div
              className="hidden lg:block glass rounded-2xl p-12 text-center cursor-pointer hover:border-[#00F0FF]/30 transition-all"
              onClick={() => document.getElementById('batch-upload')?.click()}
            >
              <Upload className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-white mb-1">Drop photos or click to upload</h3>
              <p className="text-xs text-white/40">Powered by 7-SENSE Marine Intelligence</p>
            </div>
            
            <input
              id="batch-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />

            {/* Floating Action Button for Mobile Capture */}
            <button 
              onClick={() => document.getElementById('batch-upload')?.click()}
              className="lg:hidden fixed bottom-24 right-6 w-16 h-16 bg-[#00F0FF] text-[#000C18] rounded-full shadow-[0_0_30px_rgba(0,240,255,0.5)] flex items-center justify-center z-50 active:scale-90 transition-transform"
            >
              <Camera className="w-8 h-8" />
            </button>

            {/* Photo grid: More compact for mobile */}
            {job.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {job.photos.map(photo => (
                  <div key={photo.id} className="bg-white/5 rounded-2xl overflow-hidden group relative border border-white/5 shadow-xl">
                    <img src={photo.file} alt={photo.filename} className="w-full aspect-square object-cover" />
                    <div className="p-3 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
                      <div className="flex items-center justify-between">
                        {photo.status === 'identifying' ? (
                          <div className="flex items-center gap-1.5 text-[#00F0FF] text-[10px] font-bold">
                            <Loader2 className="w-3 h-3 animate-spin" /> SCANNING
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-green-400 text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3" /> {photo.identifiedParts?.length || 0} PARTS
                          </div>
                        )}
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="text-white/40 hover:text-red-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Camera className="w-8 h-8 text-white/10" />
                </div>
                <p className="text-sm text-white/30 font-medium">No photos captured yet.</p>
              </div>
            )}

            {/* Intelligence Feed: Mobile-Optimized Collapsible */}
            {feed.length > 0 && (
              <div className="bg-[#001529]/80 border border-[#00F0FF]/20 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-[#00F0FF]/60">Diagnostic Feed</h3>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2 font-mono scrollbar-none">
                  {feed.map(msg => (
                    <div key={msg.id} className="flex gap-3 text-[11px] leading-tight">
                      <span className="text-white/20 shrink-0">{msg.timestamp.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}</span>
                      <span className={`${
                        msg.type === 'success' ? 'text-green-400' :
                        msg.type === 'warning' ? 'text-amber-400' :
                        msg.type === 'ai' ? 'text-[#00F0FF]' : 'text-white/60'
                      }`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== OTHER TABS ==================== */}
        {tab === 'bom' && (
          <div className="space-y-4 fade-in">
             {/* Simplified BOM list for Mobile */}
             {job.bom.length > 0 ? (
                <div className="space-y-3">
                  {job.bom.map(item => (
                    <div key={item.id} className="bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded border border-[#00F0FF]/20">
                              {item.mpn}
                            </span>
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{item.manufacturer}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-tight mb-1">{item.name}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-white">${((item.listings?.[0]?.price_cents || 0) / 100).toFixed(0)}</div>
                          <div className="text-[10px] text-white/30 font-bold">QTY: {item.quantity}</div>
                        </div>
                      </div>
                      {item.intelligence && (
                        <IntelligencePanel intelligence={item.intelligence} partName={item.name} compact />
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center px-2">
                    <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Job Total</span>
                    <span className="text-xl font-black text-[#00F0FF]">${bomTotals.dealer.toFixed(2)}</span>
                  </div>
                </div>
             ) : (
                <div className="text-center py-20 text-white/20 text-sm">No items in BOM.</div>
             )}
          </div>
        )}

        {tab === 'install' && (
          <div className="space-y-6 fade-in">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
              <ShieldCheck className="w-12 h-12 text-[#00F0FF]/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">Installation & Verification</h3>
              <p className="text-sm text-white/40">Mobile verification workflow coming next.</p>
            </div>
          </div>
        )}

        {tab === 'export' && (
          <div className="space-y-4 fade-in">
            <button onClick={exportPDF} className="w-full bg-[#00F0FF] text-[#000C18] p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-transform">
              <FileText className="w-6 h-6" /> GENERATE PURCHASE ORDER
            </button>
            <button onClick={exportCSV} className="w-full bg-white/5 text-white p-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 border border-white/10 active:scale-95 transition-transform">
              <Download className="w-5 h-5" /> EXPORT CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal placeholder for VendorBreakdown to satisfy compilation
function VendorBreakdown({ bom }: { bom: BOMItem[] }) {
  return null;
}
