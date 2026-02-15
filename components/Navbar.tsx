"use client";

import React, { useState, useEffect } from "react";
import { Ship, User, LogOut, ArrowLeft } from "lucide-react";

interface NavbarProps {
  onAuthClick?: () => void;
}

export function Navbar({ onAuthClick }: NavbarProps) {
  const [user, setUser] = useState<any>(null);

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
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-[#000C18]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-8">
          <a
            href="https://7sense.net"
            className="flex items-center gap-2 text-white/40 hover:text-[#00F0FF] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>7-SENSE</span>
          </a>
          
          <div className="h-6 w-px bg-white/10" />
          
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-[#00F0FF]" />
            <span className="text-lg font-bold text-white">PicSea</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-white/40 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={onAuthClick}
              className="px-4 py-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
