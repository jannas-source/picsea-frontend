'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, CreditCard, Zap, ChevronUp } from 'lucide-react';
import { useAuth, getCheckoutUrl, getBillingPortalUrl } from '@/lib/auth';

interface AccountButtonProps {
  onSignIn: () => void;
}

export function AccountButton({ onSignIn }: AccountButtonProps) {
  const { user, token, logout, scansRemaining, scanLimit } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
        style={{
          background: 'rgba(0, 240, 255, 0.08)',
          color: '#00F0FF',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          fontFamily: 'var(--font-montserrat)',
        }}
      >
        <User className="w-3 h-3" />
        Sign In
      </button>
    );
  }

  const isPaid = user.plan !== 'free';

  const handleUpgrade = async () => {
    if (!token) return;
    setUpgrading(true);
    setUpgradeError('');
    try {
      const url = await getCheckoutUrl(token, 'pro');
      window.location.href = url;
    } catch (err: any) {
      setUpgradeError(err?.message || 'Upgrade failed — try again');
      setTimeout(() => setUpgradeError(''), 5000);
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!token) return;
    try {
      const url = await getBillingPortalUrl(token);
      window.location.href = url;
    } catch (err) {
      console.error('Billing portal error:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-95"
        style={{
          background: menuOpen ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${menuOpen ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        {/* Scan counter for free users */}
        {!isPaid && scanLimit > 0 && (
          <span
            className="text-[10px] font-bold"
            style={{
              color: scansRemaining <= 1 ? '#F87171' : scansRemaining <= 2 ? '#FBBF24' : '#00F0FF',
              fontFamily: 'var(--font-montserrat)',
            }}
          >
            {scansRemaining}/{scanLimit}
          </span>
        )}
        {isPaid && (
          <span
            className="text-[10px] font-bold uppercase"
            style={{ color: '#34D399', fontFamily: 'var(--font-montserrat)' }}
          >
            {user.plan}
          </span>
        )}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
          style={{
            background: 'rgba(0, 240, 255, 0.1)',
            color: '#00F0FF',
            fontFamily: 'var(--font-montserrat)',
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-full mt-2 w-56 rounded-xl z-50 overflow-hidden"
              style={{
                background: 'rgba(0, 18, 34, 0.97)',
                border: '1px solid rgba(0, 240, 255, 0.12)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* User info */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.company}</p>
              </div>

              {/* Scan counter for free */}
              {!isPaid && (
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Free Scans
                    </span>
                    <span
                      className="text-[11px] font-bold"
                      style={{
                        color: scansRemaining <= 1 ? '#F87171' : scansRemaining <= 2 ? '#FBBF24' : '#00F0FF',
                      }}
                    >
                      {scansRemaining} of {scanLimit} remaining
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${((scanLimit - scansRemaining) / scanLimit) * 100}%`,
                        background: scansRemaining <= 1 ? '#F87171' : scansRemaining <= 2 ? '#FBBF24' : '#00F0FF',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full mt-3 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    style={{
                      background: upgradeError ? 'rgba(248, 113, 113, 0.1)' : 'rgba(0, 240, 255, 0.1)',
                      color: upgradeError ? '#F87171' : '#00F0FF',
                      border: `1px solid ${upgradeError ? 'rgba(248, 113, 113, 0.2)' : 'rgba(0, 240, 255, 0.2)'}`,
                      fontFamily: 'var(--font-montserrat)',
                    }}
                  >
                    <Zap className="w-3 h-3" />
                    {upgradeError || (upgrading ? 'Loading...' : 'Upgrade to Pro — $9/mo')}
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="py-1">
                {isPaid && (
                  <button
                    onClick={handleManageBilling}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 text-left text-sm transition-colors hover:bg-white/5"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    <CreditCard className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    Manage Billing
                  </button>
                )}
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full px-4 py-2.5 flex items-center gap-2.5 text-left text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  <LogOut className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
