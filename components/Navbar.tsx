"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ship, User, LogOut } from "lucide-react";

interface NavbarProps {
  onAuthClick?: () => void;
}

export function Navbar({ onAuthClick }: NavbarProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('picsea_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('picsea_user');
        localStorage.removeItem('picsea_token');
      }
    }

    // Listen for auth changes
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
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 bg-deep-abyss-blue/80 backdrop-blur-md border-b border-bioluminescent-cyan/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bioluminescent-cyan/10 border border-bioluminescent-cyan/30 flex items-center justify-center">
            <Ship className="w-6 h-6 text-bioluminescent-cyan" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-pure-white tracking-tight">PicSea</h1>
            <p className="text-xs text-bioluminescent-cyan/70">by 7-SENSE</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-pure-white/70 hover:text-bioluminescent-cyan transition-colors text-sm font-medium">
            Features
          </a>
          <a href="#how-it-works" className="text-pure-white/70 hover:text-bioluminescent-cyan transition-colors text-sm font-medium">
            How It Works
          </a>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-bioluminescent-cyan/10 border border-bioluminescent-cyan/30 rounded-md">
                <User className="w-4 h-4 text-bioluminescent-cyan" />
                <span className="text-pure-white text-sm font-medium">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="px-3 py-2 text-pure-white/70 hover:text-red-400 transition-colors flex items-center gap-2"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="px-4 py-2 bg-bioluminescent-cyan/10 border border-bioluminescent-cyan/30 text-bioluminescent-cyan font-bold text-sm rounded-md hover:bg-bioluminescent-cyan/20 transition-all"
            >
              Dealer Login
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
