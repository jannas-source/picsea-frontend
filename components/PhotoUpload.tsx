"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";

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
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB');
      return;
    }

    setError(null);
    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to API
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
      console.error('Upload error:', err);
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
    <div className="w-full max-w-4xl mx-auto">
      {/* Upload Area */}
      {!preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative border-2 border-dashed rounded-xl p-12 transition-all ${
            dragActive
              ? 'border-bioluminescent-cyan bg-bioluminescent-cyan/5'
              : 'border-bioluminescent-cyan/20 hover:border-bioluminescent-cyan/40'
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
            <div className="w-20 h-20 rounded-full bg-bioluminescent-cyan/10 border border-bioluminescent-cyan/30 flex items-center justify-center mb-6">
              {uploading ? (
                <Loader2 className="w-10 h-10 text-bioluminescent-cyan animate-spin" />
              ) : (
                <Camera className="w-10 h-10 text-bioluminescent-cyan" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-pure-white mb-2">
              {uploading ? 'Analyzing...' : 'Upload Part Photo'}
            </h3>
            
            <p className="text-pure-white/60 mb-6 max-w-md">
              Drop an image here or click to browse. We'll identify the manufacturer, model, and find exact matches.
            </p>

            <div className="flex gap-4">
              <button
                disabled={uploading}
                className="px-6 py-3 bg-bioluminescent-cyan text-deep-abyss-blue font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Choose File
              </button>
            </div>

            <p className="text-xs text-pure-white/40 mt-4">
              Supported: JPG, PNG, HEIC • Max 10MB
            </p>
          </div>
        </motion.div>
      )}

      {/* Preview + Results */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Image Preview */}
          <div className="relative rounded-xl overflow-hidden border border-bioluminescent-cyan/20">
            <img
              src={preview}
              alt="Uploaded part"
              className="w-full h-auto max-h-96 object-contain bg-oceanic-navy/20"
            />
            <button
              onClick={reset}
              className="absolute top-4 right-4 p-2 bg-deep-abyss-blue/80 backdrop-blur-sm border border-bioluminescent-cyan/30 rounded-lg hover:bg-deep-abyss-blue transition-all"
            >
              <X className="w-5 h-5 text-pure-white" />
            </button>

            {uploading && (
              <div className="absolute inset-0 bg-deep-abyss-blue/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-bioluminescent-cyan animate-spin mx-auto mb-4" />
                  <p className="text-pure-white font-bold">Analyzing with AI Vision...</p>
                  <p className="text-pure-white/60 text-sm mt-2">This may take a few seconds</p>
                </div>
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-bold">Identification Failed</p>
                <p className="text-red-400/70 text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-pure-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  Identified Parts ({results.length})
                </h3>
                <button
                  onClick={reset}
                  className="text-sm text-pure-white/60 hover:text-bioluminescent-cyan transition-colors"
                >
                  Upload Another
                </button>
              </div>

              <div className="grid gap-4">
                {results.map((part) => (
                  <div
                    key={part.id}
                    className="p-6 bg-oceanic-navy/40 border border-bioluminescent-cyan/20 rounded-lg hover:border-bioluminescent-cyan/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-bioluminescent-cyan/70">{part.mpn}</span>
                          <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400 font-bold">
                            {Math.round(part.confidence * 100)}% Match
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-pure-white mb-1">{part.name}</h4>
                        <p className="text-pure-white/60">{part.manufacturer}</p>
                        {part.category_name && (
                          <p className="text-sm text-pure-white/40 mt-2">Category: {part.category_name}</p>
                        )}
                      </div>
                    </div>

                    {part.listings && part.listings.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-bioluminescent-cyan/10">
                        <div>
                          <p className="text-xs text-pure-white/50 mb-1">Dealer Price</p>
                          <p className="text-lg font-bold text-bioluminescent-cyan">
                            ${(part.listings[0].price_cents / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-pure-white/50 mb-1">List Price</p>
                          <p className="text-lg font-bold text-pure-white">
                            ${(part.listings[0].list_price_cents / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-pure-white/50 mb-1">Stock</p>
                          <div className="flex items-center gap-2">
                            {part.listings[0].in_stock ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-pure-white font-bold">{part.listings[0].stock_qty}</span>
                              </>
                            ) : (
                              <span className="text-red-400">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
