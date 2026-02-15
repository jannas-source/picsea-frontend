"use client";

import React, { useState, useEffect } from "react";
import { User, LogOut, ArrowLeft } from "lucide-react";

interface NavbarProps {
  onAuthClick?: () => void;
}

export function Navbar({ onAuthClick }: NavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

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

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('picsea_user');
    localStorage.removeItem('picsea_token');
    setUser(null);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 transition-all duration-300 ${
      scrolled ? 'bg-[#000C18]/95 backdrop-blur-xl shadow-lg shadow-black/20' : 'bg-[#000C18]/80 backdrop-blur-md'
    } border-b border-white/[0.06]`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="https://7sense.net"
            className="flex items-center gap-1.5 text-white/30 hover:text-[#00F0FF] transition-colors text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">7-SENSE</span>
          </a>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00F0FF]/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#00F0FF]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 10.189V14" />
                <path d="M12 2v3" />
                <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76" />
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
              </svg>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">PicSea</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-white/30 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button 
              onClick={onAuthClick}
              className="px-4 py-1.5 text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
