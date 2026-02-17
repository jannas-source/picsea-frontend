'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Package, Check, Loader } from 'lucide-react';

interface PhotoAnalysisProps {
  visible: boolean;
  filename: string;
  onComplete: () => void;
}

const STAGES = [
  { label: 'Processing image...', icon: Scan, duration: 1200 },
  { label: 'Detecting parts...', icon: Package, duration: 1800 },
  { label: 'Matching against 29,000+ records...', icon: Loader, duration: 2000 },
  { label: 'Cross-checking compatibility...', icon: Check, duration: 1000 },
];

export function PhotoAnalysis({ visible, filename, onComplete }: PhotoAnalysisProps) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setStage(0);
      setProgress(0);
      return;
    }

    let totalElapsed = 0;
    const totalDuration = STAGES.reduce((s, st) => s + st.duration, 0);

    const progressInterval = setInterval(() => {
      totalElapsed += 50;
      setProgress(Math.min(100, (totalElapsed / totalDuration) * 100));
    }, 50);

    let stageTimeout: NodeJS.Timeout;
    const advanceStage = (s: number) => {
      if (s >= STAGES.length) {
        setTimeout(onComplete, 400);
        return;
      }
      setStage(s);
      stageTimeout = setTimeout(() => advanceStage(s + 1), STAGES[s].duration);
    };

    advanceStage(0);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stageTimeout);
    };
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'rgba(0, 6, 12, 0.92)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="text-center px-8 max-w-sm">
            {/* Sonar animation */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              {/* Rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                  }}
                  animate={{
                    scale: [0.6, 1.8],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)',
                  }}
                >
                  <Scan className="w-7 h-7" style={{ color: '#00F0FF' }} />
                </motion.div>
              </div>
            </div>

            {/* Stage text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6"
              >
                <div
                  className="text-base font-bold mb-1"
                  style={{ color: '#00F0FF', fontFamily: 'var(--font-montserrat)' }}
                >
                  {STAGES[Math.min(stage, STAGES.length - 1)].label}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {filename}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress bar */}
            <div className="w-full max-w-xs mx-auto">
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #00F0FF, #4DFAFF)',
                    boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)',
                    width: `${progress}%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div
                className="text-[10px] mt-2 font-medium"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
