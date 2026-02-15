"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ship, User, LogOut, Menu, X, ArrowLeft } from "lucide-react";

interface NavbarProps {
  onAuthClick?: () => void;
}

export function Navbar({ onAuthClick }: NavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('picsea_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('picsea_user');
        localStorage.removeItem('picsea_token');
      }
    }

    const handleStorage = () => {
      const storedUser = localStorage.getItem('picsea_user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('picsea_user');
    localStorage.removeItem('picsea_token');
    setUser(null);
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 bg-deep-abyss-blue/80 backdrop-blur-md border-b border-bioluminescent-cyan/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <a
            href="https://7sense.net"
            className="hidden md:flex items-center gap-2 text-pure-white/40 hover:text-bioluminescent-cyan transition-colors text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>7-SENSE</span>
          </a>
          
          <div className="h-6 w-px bg-pure-white/10 hidden md:block" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-bioluminescent-cyan/10 border border-bioluminescent-cyan/30 flex items-center justify-center">
              <Ship className="w-5 h-5 text-bioluminescent-cyan" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-pure-white tracking-tight">PicSea</h1>
            </div>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-pure-white/60 hover:text-pure-white transition-colors text-sm font-medium">
            How It Works
          </a>
          <a href="#upload" className="text-pure-white/60 hover:text-pure-white transition-colors text-sm font-medium">
            Try It
          </a>
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-bioluminescent-cyan/10 border border-bioluminescent-cyan/30 rounded-md">
                <User className="w-4 h-4 text-bioluminescent-cyan" />
                <span className="text-pure-white text-sm font-medium">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-pure-white/60 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="px-4 py-2 bg-pure-white text-deep-abyss-blue font-bold text-sm rounded-lg hover:bg-pure-white/90 transition-all"
            >
              Dealer Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-pure-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden mt-4 pb-4 border-t border-bioluminescent-cyan/10"
        >
          <div className="flex flex-col gap-4 pt-4">
            <a
              href="https://7sense.net"
              className="flex items-center gap-2 text-pure-white/60 hover:text-bioluminescent-cyan transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to 7-SENSE
            </a>
            
            <div className="h-px bg-pure-white/10 my-2" />
            
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-pure-white/60 hover:text-pure-white transition-colors text-sm font-medium"
            >
              How It Works
            </a>
            <a 
              href="#upload" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-pure-white/60 hover:text-pure-white transition-colors text-sm font-medium"
            >
              Try It
            </a>
            
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-bioluminescent-cyan/10 border border-bioluminescent-cyan/30 rounded-md">
                  <User className="w-4 h-4 text-bioluminescent-cyan" />
                  <span className="text-pure-white text-sm font-medium">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-pure-white/60 hover:text-red-400 transition-colors flex items-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  onAuthClick?.();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-3 bg-pure-white text-deep-abyss-blue font-bold text-sm rounded-lg hover:bg-pure-white/90 transition-all"
              >
                Dealer Login
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
