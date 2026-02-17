"use client";

import React, { useState, useEffect } from "react";
import { View } from "@/lib/types";
import { Briefcase, BarChart3, Wrench, Search, Menu, X } from "lucide-react";
import { Command } from "cmdk";
import Image from "next/image";

interface AppShellProps {
  children: React.ReactNode;
  view: View;
  onNavigate: (view: View) => void;
  jobName?: string;
}

const navItems: { view: View; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Jobs', icon: Briefcase },
  { view: 'maintenance', label: 'Maintenance', icon: Wrench },
  { view: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function AppShell({ children, view, onNavigate, jobName }: AppShellProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--abyss)' }}>
      
      {/* === COMMAND PALETTE === */}
      <Command.Dialog
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        label="Global Command Menu"
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
        style={{ background: 'rgba(0, 8, 18, 0.92)', backdropFilter: 'blur(24px)' }}
      >
        <div
          className="w-full max-w-xl overflow-hidden mx-4 rounded-2xl"
          style={{
            background: 'rgba(0, 18, 34, 0.95)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            boxShadow: '0 0 60px rgba(0, 240, 255, 0.12), 0 25px 80px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div className="flex items-center px-4 border-b" style={{ borderColor: 'rgba(0, 240, 255, 0.1)' }}>
            <Search className="w-4 h-4 mr-3" style={{ color: 'rgba(0, 240, 255, 0.5)' }} />
            <Command.Input
              placeholder="Search jobs, navigate..."
              className="w-full h-14 bg-transparent text-white text-sm outline-none placeholder:text-white/30 font-['Inter']"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="p-8 text-center text-sm text-white/30">
              No results found.
            </Command.Empty>
            <Command.Group
              heading="Navigation"
              className="text-[9px] uppercase tracking-[0.2em] font-black px-3 py-3"
              style={{ color: 'rgba(0, 240, 255, 0.4)', fontFamily: 'Montserrat, sans-serif' }}
            >
              {navItems.map(item => (
                <Command.Item
                  key={item.view}
                  onSelect={() => { onNavigate(item.view); setCmdOpen(false); }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all text-white aria-selected:text-[#00F0FF]"
                  style={{
                    ['--tw-bg-opacity' as any]: undefined,
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>

      {/* === HEADER / NAVBAR === */}
      <header
        className="h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 transition-all duration-300"
        style={{
          background: 'rgba(0, 10, 20, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
          boxShadow: '0 1px 0 rgba(0, 240, 255, 0.06), 0 4px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 group"
          >
            <div className="relative w-8 h-8 flex-shrink-0">
              <div
                className="absolute inset-0 rounded-full transition-all duration-300 group-hover:opacity-100 opacity-70"
                style={{ boxShadow: '0 0 12px rgba(0, 240, 255, 0.5), 0 0 24px rgba(0, 240, 255, 0.2)' }}
              />
              <Image
                src="/logo-primary-circle.jpg"
                alt="7-SENSE"
                width={32}
                height={32}
                className="rounded-full object-cover relative z-10"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span
                className="font-black text-sm tracking-widest uppercase text-white"
                style={{ fontFamily: 'Montserrat, sans-serif', textShadow: '0 0 10px rgba(0, 240, 255, 0.25)' }}
              >
                PicSea
              </span>
              <span
                className="text-[8px] tracking-[0.2em] uppercase"
                style={{ color: 'rgba(0, 240, 255, 0.55)', fontFamily: 'Montserrat, sans-serif' }}
              >
                by 7-SENSE
              </span>
            </div>
          </button>

          {/* Divider */}
          <div className="hidden lg:block w-px h-6 mx-2" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = view === item.view || (view === 'job' && item.view === 'dashboard');
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                    ${isActive
                      ? 'text-[#00F0FF]'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    ...(isActive ? {
                      background: 'rgba(0, 240, 255, 0.08)',
                      boxShadow: '0 0 0 1px rgba(0, 240, 255, 0.15), 0 0 12px rgba(0, 240, 255, 0.06)',
                    } : {}),
                  }}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1/2 h-px rounded-full"
                      style={{
                        background: '#00F0FF',
                        boxShadow: '0 0 6px rgba(0, 240, 255, 0.8)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Job indicator + search + menu */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Current job pill (desktop) */}
          {view === 'job' && jobName && (
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: 'rgba(0, 240, 255, 0.06)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
              }}
            >
              <span className="text-white/30 uppercase tracking-widest font-black text-[9px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>JOB</span>
              <span className="text-[#00F0FF] font-semibold truncate max-w-[140px]">{jobName}</span>
            </div>
          )}

          {/* Command search */}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#00F0FF';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0, 240, 255, 0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono hidden sm:block">⌘K</span>
          </button>

          {/* 7-SENSE wordmark (xl screens) */}
          <span
            className="hidden xl:block text-[9px] font-black tracking-[0.25em] uppercase px-2"
            style={{ color: 'rgba(0, 240, 255, 0.35)', fontFamily: 'Montserrat, sans-serif' }}
          >
            7-SENSE
          </span>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: menuOpen ? '#00F0FF' : 'rgba(255,255,255,0.5)' }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* === MOBILE MENU OVERLAY === */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 pt-20 px-6 fade-in"
          style={{ background: 'rgba(0, 8, 18, 0.97)', backdropFilter: 'blur(20px)' }}
        >
          {/* Sonar grid bg */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(0, 240, 255, 0.06) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          
          <nav className="relative flex flex-col gap-3">
            {navItems.map((item, i) => {
              const isActive = view === item.view || (view === 'job' && item.view === 'dashboard');
              return (
                <button
                  key={item.view}
                  onClick={() => { onNavigate(item.view); setMenuOpen(false); }}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 fade-in"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    background: isActive ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,255,255,0.06)'}`,
                    ...(isActive ? { boxShadow: '0 0 16px rgba(0, 240, 255, 0.1)' } : {}),
                  }}
                >
                  <item.icon
                    className="w-5 h-5"
                    style={{ color: isActive ? '#00F0FF' : 'rgba(255,255,255,0.5)' }}
                  />
                  <span
                    className="font-bold text-base tracking-wide uppercase"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      color: isActive ? '#00F0FF' : 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
          
          {/* Tagline at bottom */}
          <div
            className="absolute bottom-12 left-6 right-6 text-center text-xs tracking-[0.3em] uppercase fade-in"
            style={{ color: 'rgba(0, 240, 255, 0.3)', fontFamily: 'Montserrat, sans-serif', animationDelay: '200ms' }}
          >
            Sense. Navigate. Act.
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
