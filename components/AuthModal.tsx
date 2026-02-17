'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Anchor, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ open, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, signup, error, clearError } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState('');

  const reset = () => {
    setEmail('');
    setPassword('');
    setName('');
    setCompany('');
    setPhone('');
    setLocalError('');
    clearError();
  };

  const switchMode = () => {
    reset();
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password.length < 8) {
          setLocalError('Password must be at least 8 characters');
          setSubmitting(false);
          return;
        }
        await signup({ email, password, name, company, phone: phone || undefined });
      }
      reset();
      onClose();
    } catch {
      // error is set by auth context
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 6, 12, 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-full max-w-md rounded-2xl relative overflow-hidden"
            style={{
              background: 'rgba(0, 18, 34, 0.95)',
              border: '1px solid rgba(0, 240, 255, 0.12)',
              boxShadow: '0 0 60px rgba(0, 240, 255, 0.06), 0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                }}
              >
                <Anchor className="w-5 h-5" style={{ color: '#00F0FF' }} />
              </div>
              <h2
                className="text-xl font-black text-white mb-1"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {mode === 'login'
                  ? 'Sign in to access your jobs and parts data'
                  : '5 free part IDs per month. No credit card required.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="auth-label">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="auth-input"
                    />
                  </div>
                  <div>
                    <label className="auth-label">Company / Shop</label>
                    <input
                      required
                      type="text"
                      placeholder="Your shop or business name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="auth-input"
                    />
                  </div>
                  <div>
                    <label className="auth-label">Phone <span style={{ color: 'rgba(255,255,255,0.25)' }}>(optional)</span></label>
                    <input
                      type="tel"
                      placeholder="(207) 555-0100"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="auth-input"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="auth-label">Email</label>
                <input
                  required
                  type="email"
                  placeholder="you@yourshop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="auth-label">Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? '8 characters minimum' : 'Your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input pr-10"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {displayError && (
                <div
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(248, 113, 113, 0.1)',
                    border: '1px solid rgba(248, 113, 113, 0.2)',
                    color: '#F87171',
                  }}
                >
                  {displayError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                style={{
                  background: '#00F0FF',
                  color: '#000C18',
                  fontFamily: 'var(--font-montserrat)',
                  boxShadow: submitting ? 'none' : '0 0 20px rgba(0, 240, 255, 0.2)',
                }}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Free Account'
                )}
              </button>

              {/* Switch mode */}
              <p className="text-center text-xs pt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-bold"
                  style={{ color: '#00F0FF' }}
                >
                  {mode === 'login' ? 'Sign Up Free' : 'Sign In'}
                </button>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
