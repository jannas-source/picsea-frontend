'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { useAuth, getCheckoutUrl } from '@/lib/auth';

export function ScanLimitBanner() {
  const { user, token, scansRemaining, scanLimit, canScan } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  // Don't show if: no user, paid user, plenty of scans left, or dismissed
  if (!user || user.plan !== 'free' || dismissed) return null;
  if (scansRemaining > 2) return null;

  const isExhausted = scansRemaining <= 0;

  const handleUpgrade = async () => {
    if (!token) return;
    setUpgrading(true);
    try {
      const url = await getCheckoutUrl(token, 'pro');
      window.location.href = url;
    } catch (err) {
      console.error('Upgrade error:', err);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mx-4 mb-3 rounded-xl px-4 py-3 flex items-center gap-3 relative"
        style={{
          background: isExhausted
            ? 'rgba(248, 113, 113, 0.08)'
            : 'rgba(251, 191, 36, 0.08)',
          border: `1px solid ${isExhausted ? 'rgba(248, 113, 113, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`,
        }}
      >
        <Zap className="w-4 h-4 flex-shrink-0" style={{ color: isExhausted ? '#F87171' : '#FBBF24' }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: isExhausted ? '#F87171' : '#FBBF24' }}>
            {isExhausted
              ? 'Monthly scan limit reached'
              : `${scansRemaining} free scan${scansRemaining === 1 ? '' : 's'} remaining`}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {isExhausted
              ? 'Upgrade for unlimited part identification'
              : 'Upgrade to Pro for unlimited scans'}
          </p>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
          style={{
            background: '#00F0FF',
            color: '#000C18',
            fontFamily: 'var(--font-montserrat)',
          }}
        >
          {upgrading ? '...' : 'Upgrade'}
        </button>
        {!isExhausted && (
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
