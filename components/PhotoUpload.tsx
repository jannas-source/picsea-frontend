"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Loader2, X, CheckCircle } from "lucide-react";

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

      if (!res.ok) {
        throw new Error('Identification failed');
      }

      const data = await res.json();
      setResults(data.parts || []);
      
      if (onPartsIdentified) {
        onPartsIdentified(data.parts || []);
      }
    } catch (err) {
      setError('Failed to identify parts. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResults([]);
    setError(null);
  };

  return (
    <div className="w-full">
      {!preview && (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-16 transition-all ${
            dragActive
              ? 'border-[#00F0FF] bg-[#00F0FF]/5'
              : 'border-white/20 hover:border-white/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
              ) : (
                <Camera className="w-8 h-8 text-white/40" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">
              {uploading ? 'Analyzing...' : 'Upload a photo'}
            </h3>
            
            <p className="text-white/40 text-sm mb-8">
              JPG, PNG, or HEIC • Max 10MB
            </p>

            <button
              disabled={uploading}
              className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50"
            >
              Choose File
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <img
              src={preview}
              alt="Uploaded part"
              className="w-full h-auto max-h-96 object-contain bg-black/20"
            />
            <button
              onClick={reset}
              className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-black/80 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {uploading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-[#00F0FF] animate-spin mx-auto mb-4" />
                  <p className="text-white font-semibold">Analyzing...</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  Found {results.length} match{results.length !== 1 ? 'es' : ''}
                </h3>
                <button
                  onClick={reset}
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  Upload Another
                </button>
              </div>

              {results.map((part) => (
                <div
                  key={part.id}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-white/50">{part.mpn}</span>
                        <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400 font-bold">
                          {Math.round(part.confidence * 100)}% match
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">{part.name}</h4>
                      <p className="text-white/50">{part.manufacturer}</p>
                    </div>
                  </div>

                  {part.listings && part.listings.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Price</p>
                        <p className="text-lg font-bold text-[#00F0FF]">
                          ${(part.listings[0].price_cents / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">List</p>
                        <p className="text-lg font-bold text-white">
                          ${(part.listings[0].list_price_cents / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Stock</p>
                        <div className="flex items-center gap-2">
                          {part.listings[0].in_stock ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-white font-bold">{part.listings[0].stock_qty}</span>
                            </>
                          ) : (
                            <span className="text-red-400">Out</span>
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
