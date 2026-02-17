'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Job } from '@/lib/types';
import {
  Camera, Mic, ImagePlus, Scan, ChevronRight,
  Zap,
} from 'lucide-react';

interface CaptureViewProps {
  jobs: Job[];
  onPhotoCapture: (dataUrl: string, filename: string) => void;
  onOpenJob: (jobId: string) => void;
  onTryDemo: () => void;
}

export function CaptureView({ jobs, onPhotoCapture, onOpenJob, onTryDemo }: CaptureViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      onPhotoCapture(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const recentJobs = jobs
    .filter((j) => j.status === 'active')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100dvh - 56px - 72px - env(safe-area-inset-bottom, 0px))' }}>
      {/* Viewfinder area */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: '60dvh' }}>
        {/* Dark viewfinder background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 26, 46, 0.3) 0%, rgba(0, 6, 12, 0.9) 100%)',
          }}
        >
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 240, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.25), transparent)',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.15)',
            }}
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Corner markers */}
          {[
            'top-8 left-8 border-t-2 border-l-2',
            'top-8 right-8 border-t-2 border-r-2',
            'bottom-32 left-8 border-b-2 border-l-2',
            'bottom-32 right-8 border-b-2 border-r-2',
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-8 h-8 pointer-events-none`}
              style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }}
            />
          ))}
        </div>

        {/* Center prompt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: 'rgba(0, 240, 255, 0.06)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
              }}
            >
              <Scan className="w-8 h-8" style={{ color: 'rgba(0, 240, 255, 0.4)' }} />
            </div>
            <h2
              className="text-lg font-bold text-white mb-1"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Point at a part or system
            </h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Take a photo to identify parts and build your order
            </p>

            {/* Demo button */}
            <button
              onClick={onTryDemo}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: 'rgba(0, 240, 255, 0.08)',
                color: '#00F0FF',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                minHeight: '44px',
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              Try Demo Analysis
            </button>
          </motion.div>
        </div>

        {/* Camera controls */}
        <div
          className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-8"
        >
          {/* Voice note */}
          <button
            onClick={() => setRecording(!recording)}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
            style={{
              background: recording ? 'rgba(248, 113, 113, 0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${recording ? 'rgba(248, 113, 113, 0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: recording ? '#F87171' : 'rgba(255,255,255,0.4)',
              minHeight: '60px',
              minWidth: '60px',
            }}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Shutter button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative transition-transform active:scale-95"
            style={{ minHeight: '72px', minWidth: '72px' }}
          >
            {/* Outer ring */}
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
              style={{
                border: '3px solid rgba(0, 240, 255, 0.5)',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.2), inset 0 0 20px rgba(0, 240, 255, 0.05)',
              }}
            >
              {/* Inner circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 240, 255, 0.05))',
                  border: '2px solid rgba(0, 240, 255, 0.3)',
                }}
              >
                <Camera className="w-6 h-6" style={{ color: '#00F0FF' }} />
              </div>
            </div>
          </button>

          {/* Gallery */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
              minHeight: '60px',
              minWidth: '60px',
            }}
          >
            <ImagePlus className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Recent jobs strip */}
      {recentJobs.length > 0 && (
        <div
          className="px-4 py-3"
          style={{
            background: 'rgba(0, 6, 12, 0.8)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.15em]"
              style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-montserrat)' }}
            >
              Recent Jobs
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {recentJobs.length} active
            </span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {recentJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onOpenJob(job.id)}
                className="flex-shrink-0 rounded-xl p-3 transition-all group"
                style={{
                  background: 'rgba(0, 26, 46, 0.4)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  minWidth: '140px',
                  minHeight: '60px',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">
                    {job.vessel || job.name}
                  </span>
                  <ChevronRight
                    className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#00F0FF' }}
                  />
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {job.bom.length} parts · {job.bom.filter((b) => b.confirmed).length} confirmed
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
