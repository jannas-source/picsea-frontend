'use client';

import React from 'react';
import Image from 'next/image';
import { Camera, ClipboardList, Clock } from 'lucide-react';

export type AppView = 'capture' | 'review' | 'status';

interface AppShellProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  activeJobName?: string;
  bomCount?: number;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: AppView; label: string; icon: typeof Camera }[] = [
  { id: 'capture', label: 'Capture', icon: Camera },
  { id: 'review', label: 'Review', icon: ClipboardList },
  { id: 'status', label: 'Status', icon: Clock },
];

export function AppShell({ view, onNavigate, activeJobName, bomCount, children }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative" style={{ background: 'var(--abyss)' }}>
      {/* Top bar — minimal */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{
          height: '56px',
          background: 'rgba(0, 6, 12, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.06)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)' }}
            />
            <Image
              src="/logo-primary-circle.jpg"
              alt="PicSea"
              width={28}
              height={28}
              className="rounded-full object-cover relative z-10"
              priority
            />
          </div>
          <span
            className="text-xs font-black tracking-[0.15em] uppercase"
            style={{
              fontFamily: 'var(--font-montserrat)',
              color: '#FFFFFF',
            }}
          >
            PicSea
          </span>
        </div>
        {activeJobName && view === 'review' && (
          <span
            className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full truncate max-w-[200px]"
            style={{
              background: 'rgba(0, 240, 255, 0.06)',
              color: 'rgba(0, 240, 255, 0.6)',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              fontFamily: 'var(--font-montserrat)',
            }}
          >
            {activeJobName}
          </span>
        )}
      </header>

      {/* Main content */}
      <main
        className="flex-1"
        style={{
          paddingTop: '56px',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {children}
      </main>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(0, 6, 12, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(0, 240, 255, 0.06)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.12) 40%, rgba(0, 240, 255, 0.18) 50%, rgba(0, 240, 255, 0.12) 60%, transparent)',
          }}
        />

        <div className="flex items-center justify-around h-[72px] px-4 max-w-md mx-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="flex flex-col items-center gap-1 relative transition-colors"
                style={{
                  minWidth: '64px',
                  minHeight: '60px',
                  paddingTop: '8px',
                  color: active ? '#00F0FF' : 'rgba(255,255,255,0.35)',
                }}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.5} />
                  {/* BOM count badge on Review */}
                  {id === 'review' && bomCount !== undefined && bomCount > 0 && (
                    <div
                      className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                      style={{
                        background: '#00F0FF',
                        color: '#000C18',
                        boxShadow: '0 0 8px rgba(0, 240, 255, 0.4)',
                      }}
                    >
                      {bomCount > 9 ? '9+' : bomCount}
                    </div>
                  )}
                </div>
                <span
                  className="text-[10px] font-bold tracking-wider"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  {label}
                </span>
                {/* Active indicator */}
                {active && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{
                      background: '#00F0FF',
                      boxShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
