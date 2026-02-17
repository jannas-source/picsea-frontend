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
  Ship, Download, CheckCircle, ShieldCheck, ClipboardList,
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
          pushFeed(`Identified: ${result.parts[0].name} (${result.parts[0].manufacturer})`, 'success');
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
    onUpdate({ ...job, photos: job.photos.filter(p => p.id !== photoId) });
  };

  // --- BOM handling ---
  const updateBOMItem = (itemId: string, changes: Partial<BOMItem>) => {
    onUpdate({ ...job, bom: job.bom.map(item => item.id === itemId ? { ...item, ...changes } : item) });
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

  const updateStatus = (status: Job['status']) => {
    onUpdate({ ...job, status });
  };

  const bomTotals = job.bom.reduce((acc, item) => {
    const listing = item.listings?.[0];
    if (listing) {
      acc.dealer += (listing.price_cents / 100) * item.quantity;
      acc.list += (listing.list_price_cents / 100) * item.quantity;
    }
    acc.items += item.quantity;
    return acc;
  }, { dealer: 0, list: 0, items: 0 });

  const exportCSV = () => {
    const headers = ['Qty', 'Manufacturer', 'Part Number', 'Description', 'Dealer Price', 'List Price', 'Subtotal', 'Supplier', 'SKU', 'In Stock', 'Notes'];
    const rows = job.bom.map(item => {
      const l = item.listings?.[0];
      const dp = l ? (l.price_cents / 100) : 0;
      const lp = l ? (l.list_price_cents / 100) : 0;
      return [item.quantity, item.manufacturer, item.mpn, `"${item.name}"`, dp.toFixed(2), lp.toFixed(2), (dp * item.quantity).toFixed(2), l?.supplier || '', l?.sku || '', l?.in_stock ? 'Yes' : 'No', `"${item.notes}"`].join(',');
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
.header h1{margin:0;font-size:20px;color:#000C18;font-family:Montserrat,sans-serif}
.header .meta{text-align:right;color:#666;font-size:11px}
.info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.info-block{background:#f8f9fa;padding:12px;border-radius:6px}
.info-block h3{font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#666;margin-bottom:6px;font-family:Montserrat,sans-serif}
table{width:100%;border-collapse:collapse;margin:20px 0}
th{background:#000C18;color:#00F0FF;text-align:left;padding:8px 12px;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;font-family:Montserrat,sans-serif}
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
    { key: 'photos',  label: 'Capture', icon: Camera,     count: job.photos.length },
    { key: 'bom',     label: 'BOM',     icon: Package,    count: job.bom.length },
    { key: 'install', label: 'Verify',  icon: ShieldCheck,count: installedCount },
    { key: 'export',  label: 'Export',  icon: FileText },
  ];

  const feedColors: Record<FeedMessage['type'], string> = {
    success: '#34D399',
    warning: '#FBBF24',
    ai: '#00F0FF',
    info: 'rgba(255,255,255,0.5)',
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--abyss)', minHeight: 'calc(100vh - 64px)' }}
    >
      {/* ===== JOB SUB-HEADER ===== */}
      <div
        className="sticky top-0 z-30 px-4 py-4"
        style={{
          background: 'rgba(0, 10, 20, 0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg transition-all duration-200"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#00F0FF')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="text-base font-black text-white truncate"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {job.name}
                </h1>
                <span
                  className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex-shrink-0"
                  style={{
                    background: 'rgba(0, 240, 255, 0.1)',
                    color: '#00F0FF',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {job.status}
                </span>
              </div>
              <p
                className="text-[10px] font-medium mt-0.5 flex items-center gap-1"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                <Ship className="w-2.5 h-2.5" style={{ color: 'rgba(0, 240, 255, 0.4)' }} />
                {job.vessel || (job as any).vesselContext?.name || 'Unassigned Vessel'}
              </p>
            </div>
          </div>

          {/* Job value badge */}
          <div
            className="px-3 py-2 rounded-xl text-right"
            style={{
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.1)',
            }}
          >
            <span
              className="text-[9px] uppercase tracking-widest font-black block leading-none mb-1"
              style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}
            >
              Value
            </span>
            <span
              className="text-sm font-black tabular-nums"
              style={{
                color: '#00F0FF',
                fontFamily: 'Montserrat, sans-serif',
                textShadow: bomTotals.dealer > 0 ? '0 0 8px rgba(0, 240, 255, 0.4)' : 'none',
              }}
            >
              ${bomTotals.dealer.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* ===== TAB BAR ===== */}
      <div
        className="px-4 py-2.5 sticky z-20"
        style={{
          top: '73px',
          background: 'rgba(0, 8, 16, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          className="flex p-1 rounded-2xl max-w-md"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 relative"
              style={{
                background: tab === t.key ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                boxShadow: tab === t.key ? 'inset 0 1px 1px rgba(0, 240, 255, 0.15), 0 0 12px rgba(0, 240, 255, 0.05)' : 'none',
                border: tab === t.key ? '1px solid rgba(0, 240, 255, 0.15)' : '1px solid transparent',
              }}
            >
              <t.icon
                className="w-3.5 h-3.5 mb-1"
                style={{ color: tab === t.key ? '#00F0FF' : 'rgba(255,255,255,0.25)' }}
              />
              <span
                className="text-[9px] font-black uppercase tracking-tight"
                style={{
                  color: tab === t.key ? '#00F0FF' : 'rgba(255,255,255,0.3)',
                  fontFamily: 'Montserrat, sans-serif',
                  textShadow: tab === t.key ? '0 0 8px rgba(0, 240, 255, 0.4)' : 'none',
                }}
              >
                {t.label}
              </span>
              {t.count !== undefined && t.count > 0 && (
                <span
                  className="absolute top-1 right-1.5 text-[7px] px-1 rounded-full font-black shadow-lg"
                  style={{
                    background: tab === t.key ? '#00F0FF' : 'rgba(0, 240, 255, 0.6)',
                    color: '#000C18',
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 max-w-5xl mx-auto w-full">

        {/* ==================== PHOTOS TAB ==================== */}
        {tab === 'photos' && (
          <div className="space-y-6 fade-in">
            {/* Upload zone — submarine viewport */}
            <div
              className="hidden lg:block rounded-3xl p-12 text-center cursor-pointer relative overflow-hidden transition-all duration-300 scan-line-parent"
              onClick={() => document.getElementById('batch-upload')?.click()}
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, rgba(0, 240, 255, 0.04) 0%, rgba(0, 12, 24, 0.6) 70%)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                el.style.boxShadow = 'inset 0 0 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 240, 255, 0.06)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(0, 240, 255, 0.15)';
                el.style.boxShadow = 'inset 0 0 40px rgba(0, 0, 0, 0.3)';
              }}
            >
              {/* Viewport ring */}
              <div
                className="absolute inset-6 rounded-[40px] pointer-events-none"
                style={{ border: '1px solid rgba(0, 240, 255, 0.08)' }}
              />
              {/* Corner accents */}
              {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-4 h-4 pointer-events-none`}
                  style={{
                    borderColor: 'rgba(0, 240, 255, 0.3)',
                    borderStyle: 'solid',
                    borderWidth: i < 2 ? '1px 0 0 1px' : i === 2 ? '0 0 1px 1px' : '0 1px 1px 0',
                    ...(i === 1 ? { borderWidth: '1px 1px 0 0' } : {}),
                  }}
                />
              ))}

              <Upload className="w-10 h-10 mx-auto mb-4" style={{ color: 'rgba(0, 240, 255, 0.3)' }} />
              <h3
                className="text-sm font-bold text-white mb-1"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Drop photos or click to upload
              </h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Powered by 7-SENSE Marine Intelligence
              </p>
            </div>

            <input
              id="batch-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />

            {/* Mobile FAB */}
            <button
              onClick={() => document.getElementById('batch-upload')?.click()}
              className="lg:hidden fixed bottom-24 right-6 w-16 h-16 rounded-full flex items-center justify-center z-50 active:scale-90 transition-transform"
              style={{
                background: '#00F0FF',
                color: '#000C18',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2)',
              }}
            >
              <Camera className="w-7 h-7" />
            </button>

            {/* Photo grid */}
            {job.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {job.photos.map(photo => (
                  <div
                    key={photo.id}
                    className="rounded-2xl overflow-hidden group relative"
                    style={{
                      border: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(0, 12, 24, 0.8)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <img src={photo.file} alt={photo.filename} className="w-full aspect-square object-cover" />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-3"
                      style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
                    >
                      <div className="flex items-center justify-between">
                        {photo.status === 'identifying' ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase" style={{ color: '#00F0FF', fontFamily: 'Montserrat, sans-serif' }}>
                            <div className="oceanic-spinner" style={{ width: 12, height: 12, transform: 'scale(0.7)' }} />
                            Scanning
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase" style={{ color: '#34D399', fontFamily: 'Montserrat, sans-serif' }}>
                            <CheckCircle className="w-3 h-3" />
                            {photo.identifiedParts?.length || 0} Parts
                          </div>
                        )}
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="p-1 rounded transition-colors"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#F87171')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)')}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Camera className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.1)' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  No photos captured yet.
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.15)' }}>
                  Tap the cyan button to capture or upload
                </p>
              </div>
            )}

            {/* Intelligence Feed */}
            {feed.length > 0 && (
              <div
                className="rounded-2xl p-4"
                style={{
                  background: 'rgba(0, 18, 34, 0.85)',
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#00F0FF', animation: 'glow-pulse 2s ease-in-out infinite' }}
                  />
                  <h3
                    className="text-[9px] uppercase tracking-[0.2em] font-black"
                    style={{ color: 'rgba(0, 240, 255, 0.5)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Diagnostic Feed
                  </h3>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2 font-mono">
                  {feed.map(msg => (
                    <div key={msg.id} className="flex gap-3 text-[11px] leading-tight">
                      <span style={{ color: 'rgba(255,255,255,0.2)' }} className="flex-shrink-0">
                        {msg.timestamp.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span style={{ color: feedColors[msg.type] }}>{msg.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== BOM TAB ==================== */}
        {tab === 'bom' && (
          <div className="space-y-4 fade-in">
            {job.bom.length > 0 ? (
              <div className="space-y-2">
                {job.bom.map(item => (
                  <div
                    key={item.id}
                    className="rounded-xl p-4 transition-all duration-200"
                    style={{
                      background: 'rgba(0, 26, 46, 0.5)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(12px)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'rgba(0, 240, 255, 0.15)';
                      el.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.03)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'rgba(255,255,255,0.06)';
                      el.style.boxShadow = 'none';
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded"
                            style={{
                              color: '#00F0FF',
                              background: 'rgba(0, 240, 255, 0.1)',
                              border: '1px solid rgba(0, 240, 255, 0.2)',
                              fontFamily: 'Montserrat, sans-serif',
                            }}
                          >
                            {item.mpn}
                          </span>
                          <span
                            className="text-[10px] uppercase font-bold tracking-wider"
                            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {item.manufacturer}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white leading-tight">{item.name}</h4>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div
                          className="text-sm font-black"
                          style={{
                            color: '#00F0FF',
                            fontFamily: 'Montserrat, sans-serif',
                            textShadow: '0 0 8px rgba(0, 240, 255, 0.3)',
                          }}
                        >
                          ${((item.listings?.[0]?.price_cents || 0) / 100).toFixed(0)}
                        </div>
                        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          QTY: {item.quantity}
                        </div>
                      </div>
                    </div>
                    {item.intelligence && (
                      <IntelligencePanel intelligence={item.intelligence} partName={item.name} compact />
                    )}
                  </div>
                ))}

                <div
                  className="pt-4 flex justify-between items-center px-2"
                  style={{ borderTop: '1px solid rgba(0, 240, 255, 0.1)' }}
                >
                  <span
                    className="text-xs font-black uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Job Total
                  </span>
                  <span
                    className="text-2xl font-black"
                    style={{
                      color: '#00F0FF',
                      fontFamily: 'Montserrat, sans-serif',
                      textShadow: '0 0 12px rgba(0, 240, 255, 0.4)',
                    }}
                  >
                    ${bomTotals.dealer.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No items in BOM yet.</p>
                <p className="text-xs mt-1">Upload photos to auto-identify parts.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== INSTALL TAB ==================== */}
        {tab === 'install' && (
          <div className="space-y-6 fade-in">
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: 'rgba(0, 26, 46, 0.4)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(0, 240, 255, 0.3)' }} />
              <h3
                className="text-lg font-bold text-white mb-1"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Installation & Verification
              </h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Mobile verification workflow coming next.
              </p>
            </div>
          </div>
        )}

        {/* ==================== EXPORT TAB ==================== */}
        {tab === 'export' && (
          <div className="space-y-4 fade-in">
            <button
              onClick={exportPDF}
              className="w-full p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-200 active:scale-95"
              style={{
                background: 'var(--cyan)',
                color: '#000C18',
                fontFamily: 'Montserrat, sans-serif',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(0, 240, 255, 0.5)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.3)')}
            >
              <FileText className="w-6 h-6" />
              Generate Purchase Order
            </button>
            
            <button
              onClick={exportCSV}
              className="w-full p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-200 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(0, 240, 255, 0.2)';
                el.style.color = '#00F0FF';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(255,255,255,0.08)';
                el.style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>

            {/* Summary */}
            {bomTotals.dealer > 0 && (
              <div
                className="rounded-xl p-4 mt-2"
                style={{
                  background: 'rgba(0, 26, 46, 0.4)',
                  border: '1px solid rgba(0, 240, 255, 0.1)',
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>List Total</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    ${bomTotals.list.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: 'rgba(52, 211, 153, 0.8)' }}>Savings</span>
                  <span className="text-sm font-semibold" style={{ color: '#34D399' }}>
                    -${(bomTotals.list - bomTotals.dealer).toFixed(2)}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center pt-2"
                  style={{ borderTop: '1px solid rgba(0, 240, 255, 0.1)' }}
                >
                  <span
                    className="text-xs font-black uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Dealer Total
                  </span>
                  <span
                    className="text-xl font-black"
                    style={{ color: '#00F0FF', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    ${bomTotals.dealer.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder to keep compilation happy
function VendorBreakdown({ bom }: { bom: BOMItem[] }) {
  return null;
}
