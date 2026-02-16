"use client";

import React, { useState, useEffect } from "react";
import { View } from "@/lib/types";
import { ChevronRight, Anchor, Briefcase, BarChart3, Wrench, Search, Menu, X } from "lucide-react";
import { Command } from "cmdk";

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

  // Cmd+K / Ctrl+K hotkey
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
    <div className="min-h-screen flex flex-col bg-[var(--abyss)]">
      {/* Command Palette */}
      <Command.Dialog 
        open={cmdOpen} 
        onOpenChange={setCmdOpen}
        label="Global Command Menu"
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-[#000C18]/90 backdrop-blur-md"
      >
        <div className="bg-[#001529] border border-[#00F0FF]/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.15)] mx-4">
          <div className="flex items-center px-4 border-b border-[#00F0FF]/10">
            <Search className="w-4 h-4 text-[#00F0FF]/60 mr-3" />
            <Command.Input 
              placeholder="Search jobs, navigate..." 
              className="w-full h-14 bg-transparent text-white text-base outline-none placeholder:text-white/30"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="p-8 text-center text-sm text-white/40">
              No results found.
            </Command.Empty>
            
            <Command.Group heading="Navigation" className="text-[10px] uppercase tracking-widest text-[#00F0FF]/40 font-bold px-3 py-3">
              {navItems.map(item => (
                <Command.Item 
                  key={item.view}
                  onSelect={() => { 
                    onNavigate(item.view); 
                    setCmdOpen(false); 
                  }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-[#00F0FF]/10 text-white aria-selected:bg-[#00F0FF]/20 aria-selected:text-[#00F0FF] transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>

      {/* Responsive Header */}
      <header className="h-16 flex items-center justify-between px-4 border-b border-[#00F0FF]/20 bg-[#000C18]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#0066FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Anchor className="w-5 h-5 text-[#000C18]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white hidden sm:block">PicSea</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            {navItems.map(item => {
              const isActive = view === item.view || (view === 'job' && item.view === 'dashboard');
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${isActive ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20' : 'text-white/60 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile indicator for current job */}
          {view === 'job' && jobName && (
            <div className="hidden md:flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="text-white/40 font-mono text-[10px] uppercase">Job:</span>
              <span className="text-[#00F0FF] font-semibold">{jobName}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-all"
            >
              <Search className="w-4 h-4" />
              <span className="text-[10px] font-mono hidden sm:block">⌘K</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-white/60 hover:text-[#00F0FF]"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <span className="hidden xl:block text-[10px] font-black tracking-[0.2em] text-[#00F0FF]/40 uppercase">
            7-SENSE
          </span>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#000C18] pt-20 px-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => { onNavigate(item.view); setMenuOpen(false); }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-lg font-medium text-white hover:bg-[#00F0FF]/10 transition-all"
              >
                <item.icon className="w-6 h-6 text-[#00F0FF]" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
