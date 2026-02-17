'use client';

import React from 'react';
import Image from 'next/image';
import { Camera, ClipboardList, Clock } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import { AccountButton } from './AccountButton';

export type AppView = 'capture' | 'review' | 'status';

interface AppShellProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  activeJobName?: string;
  bomCount?: number;
  onSignIn: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: AppView; label: string; icon: typeof Camera }[] = [
  { id: 'capture', label: 'Capture', icon: Camera },
  { id: 'review', label: 'Review', icon: ClipboardList },
  { id: 'status', label: 'Status', icon: Clock },
];

export function AppShell({ view, onNavigate, activeJobName, bomCount, onSignIn, children }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative" style={{ background: 'var(--abyss)' }}>
      {/* Top bar */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5"
        style={{
          height: '64px',
          background: 'linear-gradient(180deg, rgba(0, 12, 24, 0.95) 0%, rgba(0, 12, 24, 0.85) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.08)',
        }}
      >
        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 10%, rgba(0, 240, 255, 0.15) 50%, transparent 90%)',
          }}
        />

        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div
              className="absolute inset-[-3px] rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(0, 240, 255, 0.05))',
                filter: 'blur(4px)',
              }}
            />
            <Image
              src="/logo-primary-circle.jpg"
              alt="PicSea"
              width={36}
              height={36}
              className="rounded-full object-cover relative z-10"
              style={{ border: '2px solid rgba(0, 240, 255, 0.2)' }}
              priority
            />
          </div>
          <div className="flex flex-col">
            <span
              className="text-sm font-black tracking-[0.12em] uppercase leading-tight"
              style={{
                fontFamily: 'var(--font-montserrat)',
                color: '#FFFFFF',
              }}
            >
              PicSea
            </span>
            <span
              className="text-[8px] font-semibold tracking-[0.2em] uppercase"
              style={{
                color: 'rgba(0, 240, 255, 0.5)',
                fontFamily: 'var(--font-montserrat)',
              }}
            >
              by 7-SENSE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeJobName && view === 'review' && (
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full truncate max-w-[120px] hidden sm:block"
              style={{
                background: 'rgba(0, 240, 255, 0.08)',
                color: '#00F0FF',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                fontFamily: 'var(--font-montserrat)',
                boxShadow: '0 0 12px rgba(0, 240, 255, 0.06)',
              }}
            >
              {activeJobName}
            </span>
          )}
          <ConnectionStatus />
          <AccountButton onSignIn={onSignIn} />
        </div>
      </header>

      {/* Main content */}
      <main
        className="flex-1"
        style={{
          paddingTop: '64px',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {children}
      </main>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'linear-gradient(0deg, rgba(0, 6, 12, 0.98) 0%, rgba(0, 12, 24, 0.92) 100%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderTop: '1px solid rgba(0, 240, 255, 0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 5%, rgba(0, 240, 255, 0.2) 30%, rgba(0, 240, 255, 0.35) 50%, rgba(0, 240, 255, 0.2) 70%, transparent 95%)',
          }}
        />

        <div className="flex items-center justify-around h-[80px] px-6 max-w-md mx-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="flex flex-col items-center gap-1.5 relative transition-all duration-200"
                style={{
                  minWidth: '72px',
                  minHeight: '64px',
                  paddingTop: '10px',
                  color: active ? '#00F0FF' : 'rgba(255,255,255,0.4)',
                }}
              >
                {/* Active background glow */}
                {active && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at center top, rgba(0, 240, 255, 0.08) 0%, transparent 70%)',
                    }}
                  />
                )}

                <div className="relative">
                  <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.5} />
                  {active && (
                    <div
                      className="absolute inset-[-4px] rounded-full pointer-events-none"
                      style={{ boxShadow: '0 0 12px rgba(0, 240, 255, 0.2)' }}
                    />
                  )}
                  {/* BOM count badge on Review */}
                  {id === 'review' && bomCount !== undefined && bomCount > 0 && (
                    <div
                      className="absolute -top-1.5 -right-2.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-black"
                      style={{
                        background: 'linear-gradient(135deg, #00F0FF, #00C8D6)',
                        color: '#000C18',
                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {bomCount > 9 ? '9+' : bomCount}
                    </div>
                  )}
                </div>
                <span
                  className="text-[11px] font-bold tracking-wider relative z-10"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  {label}
                </span>
                {/* Active indicator bar */}
                {active && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #00F0FF, transparent)',
                      boxShadow: '0 0 12px rgba(0, 240, 255, 0.6)',
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
