"use client";

import React, { useState, useCallback } from "react";
import { Camera, Loader2, X, CheckCircle, Upload } from "lucide-react";

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

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('https://api.picsea.app/api/identify', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Identification failed');
      }

      setResults(data.parts || []);
      if (data.analysis?.notes) {
        setAnalysisNotes(data.analysis.notes);
      }
      
      if (onPartsIdentified && data.parts?.length) {
        onPartsIdentified(data.parts);
      }
    } catch (err: any) {
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
  };

  return (
    <div className="w-full">
      {!preview && (
        <div
          className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
            dragActive
              ? 'ring-2 ring-[#00F0FF] bg-[#00F0FF]/[0.03]'
              : 'bg-white/[0.02] hover:bg-white/[0.04]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Subtle border gradient */}
          <div className="absolute inset-0 rounded-2xl border border-white/[0.08] pointer-events-none" />
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={uploading}
          />

          <div className="flex flex-col items-center text-center py-20 px-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
              dragActive ? 'bg-[#00F0FF]/10' : 'bg-white/[0.04]'
            }`}>
              {uploading ? (
                <Loader2 className="w-6 h-6 text-[#00F0FF] animate-spin" />
              ) : (
                <Camera className={`w-6 h-6 transition-colors ${dragActive ? 'text-[#00F0FF]' : 'text-white/30'}`} />
              )}
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              {uploading ? 'Analyzing...' : 'Upload a photo'}
            </h3>
            
            <p className="text-white/30 text-sm mb-8">
              JPG, PNG, or HEIC · Max 10MB
            </p>

            <button
              disabled={uploading}
              className="px-6 py-2.5 bg-white text-[#000C18] text-sm font-semibold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-black/20 border border-white/[0.08]">
            <img
              src={preview}
              alt="Uploaded part"
              className="w-full h-auto max-h-96 object-contain"
            />
            <button
              onClick={reset}
              className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-black/80 transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {uploading && (
              <div className="absolute inset-0 bg-[#000C18]/90 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-[#00F0FF]/20 flex items-center justify-center mx-auto mb-4">
                      <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
                    </div>
                  </div>
                  <p className="text-white/80 font-medium text-sm">Identifying parts...</p>
                  <p className="text-white/30 text-xs mt-1">This may take a few seconds</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/[0.06] border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {!uploading && results.length === 0 && !error && analysisNotes && (
            <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <p className="text-white/50 text-sm">{analysisNotes}</p>
              <button
                onClick={reset}
                className="mt-3 text-sm text-[#00F0FF] hover:text-[#00F0FF]/80 transition-colors"
              >
                Try another photo →
              </button>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  {results.length} match{results.length !== 1 ? 'es' : ''} found
                </h3>
                <button
                  onClick={reset}
                  className="text-sm text-white/30 hover:text-white transition-colors"
                >
                  Upload Another
                </button>
              </div>

              {results.map((part) => (
                <div
                  key={part.id}
                  className="p-5 bg-white/[0.02] border border-white/[0.08] rounded-xl hover:border-white/[0.15] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-xs font-mono text-white/40">{part.mpn}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400 font-medium">
                          {Math.round(part.confidence * 100)}%
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-white mb-0.5">{part.name}</h4>
                      <p className="text-white/40 text-sm">{part.manufacturer}</p>
                    </div>
                  </div>

                  {part.listings && part.listings.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-white/[0.06]">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Dealer</p>
                        <p className="text-base font-semibold text-[#00F0FF]">
                          ${(part.listings[0].price_cents / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">List</p>
                        <p className="text-base font-semibold text-white/70">
                          ${(part.listings[0].list_price_cents / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Stock</p>
                        <div className="flex items-center gap-1.5">
                          {part.listings[0].in_stock ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-white text-sm font-medium">{part.listings[0].stock_qty}</span>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              <span className="text-red-400 text-sm">Out</span>
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
