'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Job } from '@/lib/types';
import {
  Camera, Mic, ImagePlus, Scan, ChevronRight,
  Zap, Anchor,
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
    e.target.value = '';
  };

  const recentJobs = jobs
    .filter((j) => j.status === 'active')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100dvh - 64px - 80px - env(safe-area-inset-bottom, 0px))' }}>
      {/* Viewfinder area */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: '55dvh' }}>
        {/* Ocean depth background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(0, 43, 69, 0.25) 0%, rgba(0, 12, 24, 0.95) 70%)',
          }}
        >
          {/* Subtle grid — reduced opacity */}
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.04,
              backgroundImage:
                'linear-gradient(rgba(0, 240, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />

          {/* Sonar pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute rounded-full"
                style={{
                  width: `${ring * 180}px`,
                  height: `${ring * 180}px`,
                  border: `1px solid rgba(0, 240, 255, ${0.06 / ring})`,
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3 / ring, 0.1 / ring, 0.3 / ring],
                }}
                transition={{
                  duration: 4 + ring,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: ring * 0.8,
                }}
              />
            ))}
          </div>

          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 10%, rgba(0, 240, 255, 0.2) 50%, transparent 90%)',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
            }}
            animate={{ top: ['15%', '85%', '15%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Corner markers — brighter */}
          {[
            'top-6 left-6 border-t-2 border-l-2',
            'top-6 right-6 border-t-2 border-r-2',
            'bottom-28 left-6 border-b-2 border-l-2',
            'bottom-28 right-6 border-b-2 border-r-2',
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-10 h-10 pointer-events-none`}
              style={{ borderColor: 'rgba(0, 240, 255, 0.25)' }}
            />
          ))}
        </div>

        {/* Center prompt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center"
          >
            {/* Scan icon with glow */}
            <div
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center relative"
              style={{
                background: 'rgba(0, 240, 255, 0.04)',
                border: '1.5px solid rgba(0, 240, 255, 0.12)',
                boxShadow: '0 0 40px rgba(0, 240, 255, 0.06), inset 0 0 30px rgba(0, 240, 255, 0.03)',
              }}
            >
              <Scan className="w-10 h-10" style={{ color: 'rgba(0, 240, 255, 0.5)' }} />
            </div>

            <h2
              className="text-2xl font-black text-white mb-2"
              style={{ fontFamily: 'var(--font-montserrat)', letterSpacing: '-0.01em' }}
            >
              Point at a part or system
            </h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: '1.5' }}>
              Take a photo to identify parts and build your order
            </p>

            {/* Demo button — bigger, more visible */}
            <button
              onClick={onTryDemo}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(0, 240, 255, 0.05))',
                color: '#00F0FF',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                minHeight: '48px',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.06)',
                fontFamily: 'var(--font-montserrat)',
              }}
            >
              <Zap className="w-4 h-4" />
              Try Demo Analysis
            </button>
          </motion.div>
        </div>

        {/* Camera controls — at bottom of viewfinder */}
        <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-10">
          {/* Voice note */}
          <button
            onClick={() => setRecording(!recording)}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: recording
                ? 'rgba(248, 113, 113, 0.15)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              border: `1.5px solid ${recording ? 'rgba(248, 113, 113, 0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: recording ? '#F87171' : 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(12px)',
              minHeight: '60px',
              minWidth: '60px',
            }}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Shutter button — hero element */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative transition-transform active:scale-90"
            style={{ minHeight: '76px', minWidth: '76px' }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-[-4px] rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 240, 255, 0.05))',
                filter: 'blur(6px)',
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Outer ring */}
            <div
              className="w-[76px] h-[76px] rounded-full flex items-center justify-center relative"
              style={{
                border: '3px solid rgba(0, 240, 255, 0.45)',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.15), inset 0 0 20px rgba(0, 240, 255, 0.05)',
              }}
            >
              {/* Inner circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 43, 69, 0.3))',
                  border: '2px solid rgba(0, 240, 255, 0.3)',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.1)',
                }}
              >
                <Camera className="w-6 h-6" style={{ color: '#00F0FF' }} />
              </div>
            </div>
          </button>

          {/* Gallery */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              border: '1.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(12px)',
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
          className="px-5 py-4"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 26, 46, 0.5) 0%, rgba(0, 12, 24, 0.8) 100%)',
            borderTop: '1px solid rgba(0, 240, 255, 0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Anchor className="w-3 h-3" style={{ color: 'rgba(0, 240, 255, 0.4)' }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: 'rgba(0, 240, 255, 0.5)', fontFamily: 'var(--font-montserrat)' }}
              >
                Recent Jobs
              </span>
            </div>
            <span
              className="text-[10px] font-semibold"
              style={{ color: 'rgba(0, 240, 255, 0.3)' }}
            >
              {recentJobs.length} active
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {recentJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onOpenJob(job.id)}
                className="flex-shrink-0 rounded-2xl p-4 transition-all group active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 43, 69, 0.4), rgba(0, 26, 46, 0.3))',
                  border: '1px solid rgba(0, 240, 255, 0.08)',
                  minWidth: '160px',
                  minHeight: '64px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-sm font-bold text-white truncate max-w-[120px]"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    {job.vessel || job.name}
                  </span>
                  <ChevronRight
                    className="w-3.5 h-3.5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#00F0FF' }}
                  />
                </div>
                <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
