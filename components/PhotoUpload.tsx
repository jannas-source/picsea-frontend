"use client";

import React, { useState, useCallback } from "react";
import { Camera, X, CheckCircle, Upload } from "lucide-react";

interface IdentifiedPart {
  id: string;
  manufacturer: string;
  mpn: string;
  name: string;
  confidence: number;
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

interface PhotoUploadProps {
  onPartsIdentified?: (parts: IdentifiedPart[]) => void;
}

export function PhotoUpload({ onPartsIdentified }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<IdentifiedPart[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisNotes, setAnalysisNotes] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB');
      return;
    }

    setError(null);
    setResults([]);
    setAnalysisNotes(null);
    setUploading(true);
    setScanProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Fake scan progress animation
    const tick = setInterval(() => {
      setScanProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 300);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('https://api.picsea.app/api/identify', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      clearInterval(tick);
      setScanProgress(100);

      if (!res.ok) throw new Error(data.error || data.details || 'Identification failed');

      setResults(data.parts || []);
      if (data.analysis?.notes) setAnalysisNotes(data.analysis.notes);
      if (onPartsIdentified && data.parts?.length) onPartsIdentified(data.parts);
    } catch (err: any) {
      clearInterval(tick);
      setError(err.message || 'Failed to identify parts. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResults([]);
    setError(null);
    setAnalysisNotes(null);
    setScanProgress(0);
  };

  return (
    <div className="w-full">
      {/* ===== DROP ZONE — submarine viewport ===== */}
      {!preview && (
        <div
          className="relative rounded-3xl overflow-hidden transition-all duration-400 cursor-pointer scan-line-parent"
          style={{
            background: dragActive
              ? 'radial-gradient(ellipse at 50% 50%, rgba(0, 240, 255, 0.08) 0%, rgba(0, 12, 24, 0.8) 70%)'
              : 'radial-gradient(ellipse at 50% 30%, rgba(0, 240, 255, 0.04) 0%, rgba(0, 8, 18, 0.8) 70%)',
            border: `1px solid ${dragActive ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.12)'}`,
            boxShadow: dragActive
              ? '0 0 30px rgba(0, 240, 255, 0.1), inset 0 0 40px rgba(0, 240, 255, 0.05)'
              : 'inset 0 0 30px rgba(0, 0, 0, 0.3)',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Viewport frame corners */}
          {[
            'top-4 left-4 border-t border-l rounded-tl-lg',
            'top-4 right-4 border-t border-r rounded-tr-lg',
            'bottom-4 left-4 border-b border-l rounded-bl-lg',
            'bottom-4 right-4 border-b border-r rounded-br-lg',
          ].map((classes, i) => (
            <div
              key={i}
              className={`absolute ${classes} w-6 h-6 pointer-events-none`}
              style={{ borderColor: dragActive ? 'rgba(0, 240, 255, 0.5)' : 'rgba(0, 240, 255, 0.2)' }}
            />
          ))}

          {/* Sonar grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(0, 240, 255, 0.04) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Floating particles */}
          {[
            { left: '15%', delay: '0s', duration: '5s' },
            { left: '50%', delay: '1.5s', duration: '6s' },
            { left: '80%', delay: '3s', duration: '4.5s' },
            { left: '35%', delay: '2s', duration: '7s' },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute bottom-8 pointer-events-none"
              style={{
                left: p.left,
                width: i % 2 === 0 ? '3px' : '2px',
                height: i % 2 === 0 ? '3px' : '2px',
                borderRadius: '50%',
                background: 'rgba(0, 240, 255, 0.6)',
                animation: `particle-drift ${p.duration} ease-in-out infinite`,
                animationDelay: p.delay,
              }}
            />
          ))}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={uploading}
          />

          <div className="flex flex-col items-center text-center py-16 px-8 relative z-0">
            {/* Camera icon ring */}
            <div
              className="relative w-20 h-20 mb-6"
              style={{ animation: dragActive ? 'ocean-float 2s ease-in-out infinite' : 'none' }}
            >
              {/* Pulse rings */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                  animation: 'sonar-ring 3s ease-out infinite',
                }}
              />
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  border: '1px solid rgba(0, 240, 255, 0.1)',
                  animation: 'sonar-ring 3s ease-out infinite 1.5s',
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: dragActive ? 'rgba(0, 240, 255, 0.12)' : 'rgba(0, 240, 255, 0.06)',
                    border: `1px solid ${dragActive ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.15)'}`,
                    transition: 'all 0.3s',
                  }}
                >
                  <Camera
                    className="w-6 h-6 transition-colors"
                    style={{ color: dragActive ? '#00F0FF' : 'rgba(0, 240, 255, 0.5)' }}
                  />
                </div>
              </div>
            </div>

            <h3
              className="text-lg font-bold text-white mb-2"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {dragActive ? 'Release to analyze' : 'Upload a photo'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
              JPG, PNG, or HEIC · Max 10MB
            </p>

            <button
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              style={{
                background: 'var(--cyan)',
                color: '#000C18',
                fontFamily: 'Montserrat, sans-serif',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-sm)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
            >
              <Upload className="w-4 h-4" />
              Choose File
            </button>
            
            <p
              className="text-[10px] mt-4 tracking-[0.15em] uppercase"
              style={{ color: 'rgba(0, 240, 255, 0.3)', fontFamily: 'Montserrat, sans-serif' }}
            >
              7-SENSE Marine Intelligence
            </p>
          </div>
        </div>
      )}

      {/* ===== PREVIEW + RESULTS ===== */}
      {preview && (
        <div className="space-y-5 fade-in">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgba(0, 240, 255, 0.15)',
              background: 'rgba(0, 12, 24, 0.8)',
            }}
          >
            <img src={preview} alt="Uploaded part" className="w-full h-auto max-h-96 object-contain" />
            
            <button
              onClick={reset}
              className="absolute top-3 right-3 p-2 rounded-lg transition-all"
              style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(248, 113, 113, 0.2)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0, 0, 0, 0.7)')}
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Oceanic scanning overlay */}
            {uploading && (
              <div
                className="absolute inset-0 flex items-center justify-center scan-line-parent"
                style={{ background: 'rgba(0, 12, 24, 0.88)', backdropFilter: 'blur(4px)' }}
              >
                <div className="text-center">
                  {/* Custom oceanic spinner */}
                  <div
                    className="relative mx-auto mb-5"
                    style={{ width: 64, height: 64 }}
                  >
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: '2px solid rgba(0, 240, 255, 0.15)',
                        animation: 'oceanic-spin 1.5s linear infinite',
                        borderTopColor: '#00F0FF',
                      }}
                    />
                    <div
                      className="absolute inset-3 rounded-full"
                      style={{
                        border: '1px solid rgba(0, 240, 255, 0.1)',
                        animation: 'oceanic-spin 2.5s linear infinite reverse',
                        borderTopColor: 'rgba(0, 240, 255, 0.5)',
                      }}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: '#00F0FF',
                          animation: 'glow-pulse 1s ease-in-out infinite',
                          boxShadow: '0 0 8px rgba(0, 240, 255, 0.8)',
                        }}
                      />
                    </div>
                  </div>

                  <p
                    className="text-white font-bold text-sm mb-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Scanning with 7-SENSE AI
                  </p>
                  
                  {/* Progress bar */}
                  <div
                    className="w-48 h-1 rounded-full mx-auto mb-1 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${scanProgress}%`,
                        background: 'linear-gradient(90deg, #00F0FF, #4DFAFF)',
                        boxShadow: '0 0 6px rgba(0, 240, 255, 0.5)',
                      }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    This may take a few seconds
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-4 rounded-xl text-sm"
              style={{
                background: 'rgba(248, 113, 113, 0.06)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                color: '#F87171',
              }}
            >
              {error}
            </div>
          )}

          {/* Notes (no results) */}
          {!uploading && results.length === 0 && !error && analysisNotes && (
            <div
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{analysisNotes}</p>
              <button
                onClick={reset}
                className="mt-3 text-sm transition-colors"
                style={{ color: '#00F0FF' }}
              >
                Try another photo →
              </button>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4 fade-in">
              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-bold text-white flex items-center gap-2"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <CheckCircle className="w-5 h-5" style={{ color: '#34D399' }} />
                  {results.length} match{results.length !== 1 ? 'es' : ''} found
                </h3>
                <button
                  onClick={reset}
                  className="text-xs transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)')}
                >
                  Upload Another
                </button>
              </div>

              {results.map((part, i) => (
                <div
                  key={part.id}
                  className="p-5 rounded-xl transition-all duration-200 fade-in"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    background: 'rgba(0, 26, 46, 0.5)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(0, 240, 255, 0.15)';
                    el.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.04)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(255,255,255,0.06)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {part.mpn}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            background: 'rgba(52, 211, 153, 0.1)',
                            border: '1px solid rgba(52, 211, 153, 0.2)',
                            color: '#34D399',
                            fontFamily: 'Montserrat, sans-serif',
                          }}
                        >
                          {Math.round(part.confidence * 100)}%
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-white mb-0.5">{part.name}</h4>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{part.manufacturer}</p>
                    </div>
                  </div>

                  {part.listings && part.listings.length > 0 && (
                    <div
                      className="grid grid-cols-3 gap-4 pt-3"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div>
                        <p
                          className="text-[10px] uppercase tracking-wider mb-1 font-bold"
                          style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}
                        >
                          Dealer
                        </p>
                        <p
                          className="text-base font-black"
                          style={{ color: '#00F0FF', fontFamily: 'Montserrat, sans-serif' }}
                        >
                          ${(part.listings[0].price_cents / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[10px] uppercase tracking-wider mb-1 font-bold"
                          style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}
                        >
                          List
                        </p>
                        <p className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          ${(part.listings[0].list_price_cents / 100).toFixed(2)}
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
                          {part.listings[0].in_stock ? (
                            <>
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background: '#34D399',
                                  animation: 'status-pulse-success 2.5s ease-in-out infinite',
                                }}
                              />
                              <span className="text-white text-sm font-medium">{part.listings[0].stock_qty}</span>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F87171' }} />
                              <span className="text-sm" style={{ color: '#F87171' }}>Out</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
