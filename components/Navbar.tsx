"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
      const u = localStorage.getItem('picsea_user');
      setUser(u ? JSON.parse(u) : null);
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
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(0, 10, 20, 0.92)'
          : 'rgba(0, 10, 20, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.08)',
        boxShadow: scrolled
          ? '0 1px 0 rgba(0, 240, 255, 0.08), 0 4px 30px rgba(0, 0, 0, 0.4)'
          : 'none',
      }}
    >
      {/* Bottom glow edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.2) 30%, rgba(0, 240, 255, 0.3) 50%, rgba(0, 240, 255, 0.2) 70%, transparent 100%)',
          opacity: scrolled ? 1 : 0.5,
        }}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="https://7sense.net"
            className="flex items-center gap-1.5 text-xs transition-all duration-200 group"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(0, 240, 255, 0.7)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)')}
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.15em' }}>
              7-SENSE
            </span>
          </a>

          <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Logo + wordmark */}
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7">
              <div
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)' }}
              />
              <Image
                src="/logo-primary-circle.jpg"
                alt="7-SENSE"
                width={28}
                height={28}
                className="rounded-full object-cover relative z-10"
              />
            </div>
            <div>
              <span
                className="text-sm font-black tracking-wide text-white block"
                style={{ fontFamily: 'Montserrat, sans-serif', textShadow: '0 0 10px rgba(0, 240, 255, 0.2)' }}
              >
                PicSea
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#F87171')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)')}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={onAuthClick}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200"
              style={{
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'Montserrat, sans-serif',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = '#00F0FF';
                el.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                el.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.1)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'rgba(255,255,255,0.5)';
                el.style.borderColor = 'rgba(255,255,255,0.1)';
                el.style.boxShadow = 'none';
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
