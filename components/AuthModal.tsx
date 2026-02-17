"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Building, Loader2 } from "lucide-react";
import Image from "next/image";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', company: '', cwrAccount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(`https://api.picsea.app${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Authentication failed');
      }
      const data = await res.json();
      localStorage.setItem('picsea_token', data.token);
      localStorage.setItem('picsea_user', JSON.stringify(data.user));
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full py-3 rounded-xl text-white text-sm outline-none transition-all duration-150";
  const inputStyle: React.CSSProperties = {
    background: 'rgba(0, 12, 24, 0.7)',
    border: '1px solid rgba(0, 240, 255, 0.12)',
  };

  const fields = [
    ...(mode === 'signup' ? [
      { label: 'Full Name', icon: User, type: 'text', field: 'name', placeholder: 'John Smith', required: true },
      { label: 'Company', icon: Building, type: 'text', field: 'company', placeholder: 'Marine Supply Co.', required: true },
    ] : []),
    { label: 'Email', icon: Mail, type: 'email', field: 'email', placeholder: 'you@company.com', required: true },
    { label: 'Password', icon: Lock, type: 'password', field: 'password', placeholder: '••••••••', required: true },
  ] as const;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 6, 14, 0.92)', backdropFilter: 'blur(16px)' }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(0, 18, 34, 0.97)',
            border: '1px solid rgba(0, 240, 255, 0.18)',
            boxShadow: '0 0 60px rgba(0, 240, 255, 0.08), 0 30px 80px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Header */}
          <div
            className="p-6 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)' }}
                />
                <Image
                  src="/logo-primary-circle.jpg"
                  alt="7-SENSE"
                  width={32}
                  height={32}
                  className="rounded-full object-cover relative z-10"
                />
              </div>
              <div>
                <h2
                  className="text-xl font-black text-white"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {mode === 'login' ? 'Dealer Login' : 'Create Account'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {mode === 'login' ? 'Access your PicSea portal' : 'Join the beta program'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'signup' && (
              <>
                {/* Name */}
                <div>
                  <label className="label-upper block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(0, 240, 255, 0.4)' }} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                      className={`${inputClass} pl-10 pr-4`}
                      style={inputStyle}
                      placeholder="John Smith"
                      onFocus={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.35)')}
                      onBlur={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.12)')}
                    />
                  </div>
                </div>
                {/* Company */}
                <div>
                  <label className="label-upper block mb-1.5">Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(0, 240, 255, 0.4)' }} />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      required
                      className={`${inputClass} pl-10 pr-4`}
                      style={inputStyle}
                      placeholder="Marine Supply Co."
                      onFocus={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.35)')}
                      onBlur={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.12)')}
                    />
                  </div>
                </div>
                {/* CWR Account */}
                <div>
                  <label className="label-upper block mb-1.5">CWR Account # (Optional)</label>
                  <input
                    type="text"
                    value={formData.cwrAccount}
                    onChange={e => setFormData({ ...formData, cwrAccount: e.target.value })}
                    className={`${inputClass} px-4`}
                    style={inputStyle}
                    placeholder="12345"
                    onFocus={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.35)')}
                    onBlur={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.12)')}
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="label-upper block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(0, 240, 255, 0.4)' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  className={`${inputClass} pl-10 pr-4`}
                  style={inputStyle}
                  placeholder="you@company.com"
                  onFocus={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.35)')}
                  onBlur={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.12)')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label-upper block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(0, 240, 255, 0.4)' }} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className={`${inputClass} pl-10 pr-4`}
                  style={inputStyle}
                  placeholder="••••••••"
                  onFocus={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.35)')}
                  onBlur={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.12)')}
                />
              </div>
              {mode === 'signup' && (
                <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Minimum 8 characters
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div
                className="p-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(248, 113, 113, 0.08)',
                  border: '1px solid rgba(248, 113, 113, 0.2)',
                  color: '#F87171',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: 'var(--cyan)',
                color: '#000C18',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '14px',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-md)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>

            {/* Toggle mode */}
            <div
              className="text-center pt-4"
              style={{ borderTop: '1px solid rgba(0, 240, 255, 0.08)' }}
            >
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                className="text-sm transition-colors"
                style={{ color: 'rgba(0, 240, 255, 0.7)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#00F0FF')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(0, 240, 255, 0.7)')}
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
