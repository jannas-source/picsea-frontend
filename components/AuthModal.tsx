"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Building, Loader2 } from "lucide-react";

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
    email: '',
    password: '',
    name: '',
    company: '',
    cwrAccount: '',
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
      
      // Store token
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-deep-abyss-blue/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-oceanic-navy border border-bioluminescent-cyan/30 rounded-xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-bioluminescent-cyan/20 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-pure-white">
                {mode === 'login' ? 'Dealer Login' : 'Create Account'}
              </h2>
              <p className="text-pure-white/60 text-sm mt-1">
                {mode === 'login' ? 'Access your PicSea portal' : 'Join the beta program'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-pure-white/60 hover:text-pure-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-pure-white/70 text-sm mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bioluminescent-cyan/50" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-deep-abyss-blue/50 border border-bioluminescent-cyan/20 rounded-lg text-pure-white placeholder-pure-white/40 focus:outline-none focus:border-bioluminescent-cyan/50"
                      placeholder="John Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-pure-white/70 text-sm mb-2">Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bioluminescent-cyan/50" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-deep-abyss-blue/50 border border-bioluminescent-cyan/20 rounded-lg text-pure-white placeholder-pure-white/40 focus:outline-none focus:border-bioluminescent-cyan/50"
                      placeholder="Marine Supply Co."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-pure-white/70 text-sm mb-2">CWR Account # (Optional)</label>
                  <input
                    type="text"
                    value={formData.cwrAccount}
                    onChange={(e) => setFormData({ ...formData, cwrAccount: e.target.value })}
                    className="w-full px-4 py-3 bg-deep-abyss-blue/50 border border-bioluminescent-cyan/20 rounded-lg text-pure-white placeholder-pure-white/40 focus:outline-none focus:border-bioluminescent-cyan/50"
                    placeholder="12345"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-pure-white/70 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bioluminescent-cyan/50" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-deep-abyss-blue/50 border border-bioluminescent-cyan/20 rounded-lg text-pure-white placeholder-pure-white/40 focus:outline-none focus:border-bioluminescent-cyan/50"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-pure-white/70 text-sm mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bioluminescent-cyan/50" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full pl-11 pr-4 py-3 bg-deep-abyss-blue/50 border border-bioluminescent-cyan/20 rounded-lg text-pure-white placeholder-pure-white/40 focus:outline-none focus:border-bioluminescent-cyan/50"
                  placeholder="••••••••"
                />
              </div>
              {mode === 'signup' && (
                <p className="text-pure-white/40 text-xs mt-2">Minimum 8 characters</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-bioluminescent-cyan text-deep-abyss-blue font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>

            <div className="text-center pt-4 border-t border-bioluminescent-cyan/10">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                }}
                className="text-bioluminescent-cyan hover:underline text-sm"
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
