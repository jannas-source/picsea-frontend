"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ship, User, LogOut, Menu, X } from "lucide-react";

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
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:py-4 bg-[#000C18]/90 backdrop-blur-md border-b border-[#00F0FF]/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center">
            <Ship className="w-5 h-5 md:w-6 md:h-6 text-[#00F0FF]" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">PicSea</h1>
            <p className="text-[10px] md:text-xs text-[#00F0FF]/70">by 7-SENSE</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#upload" className="text-white/70 hover:text-[#00F0FF] transition-colors text-sm font-medium">
            Upload
          </a>
          <a href="#search" className="text-white/70 hover:text-[#00F0FF] transition-colors text-sm font-medium">
            Search
          </a>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-md">
                <User className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-white text-sm font-medium">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="px-3 py-2 text-white/70 hover:text-red-400 transition-colors flex items-center gap-2"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="px-4 py-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] font-bold text-sm rounded-md hover:bg-[#00F0FF]/20 transition-all"
            >
              Dealer Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white"
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
          className="md:hidden mt-4 pb-4 border-t border-[#00F0FF]/10"
        >
          <div className="flex flex-col gap-4 pt-4">
            <a 
              href="#upload" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/70 hover:text-[#00F0FF] transition-colors text-sm font-medium"
            >
              Upload Photo
            </a>
            <a 
              href="#search" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/70 hover:text-[#00F0FF] transition-colors text-sm font-medium"
            >
              Search Parts
            </a>
            
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-md">
                  <User className="w-4 h-4 text-[#00F0FF]" />
                  <span className="text-white text-sm font-medium">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-white/70 hover:text-red-400 transition-colors flex items-center gap-2 text-sm"
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
                className="px-4 py-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] font-bold text-sm rounded-md hover:bg-[#00F0FF]/20 transition-all"
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
