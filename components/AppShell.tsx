"use client";

import React, { useState, useEffect } from "react";
import { View } from "@/lib/types";
import { ChevronRight, Anchor, Briefcase, BarChart3, Wrench, Search } from "lucide-react";
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
    <div className="min-h-screen flex flex-col">
      {/* Command Palette */}
      <Command.Dialog 
        open={cmdOpen} 
        onOpenChange={setCmdOpen}
        label="Global Command Menu"
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-[var(--abyss)]/80 backdrop-blur-sm"
      >
        <div className="glass rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border-[var(--border-active)]">
          <div className="flex items-center px-4 border-b border-[var(--border)]">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] mr-3" />
            <Command.Input 
              placeholder="Search jobs, navigate..." 
              className="w-full h-12 bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)]"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="p-4 text-center text-xs text-[var(--text-tertiary)]">
              No results found.
            </Command.Empty>
            
            <Command.Group heading="Navigate" className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold px-3 py-2">
              {navItems.map(item => (
                <Command.Item 
                  key={item.view}
                  onSelect={() => { 
                    onNavigate(item.view); 
                    setCmdOpen(false); 
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-[var(--surface-hover)] text-sm aria-selected:bg-[var(--cyan-dim)] aria-selected:text-[var(--cyan)] transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>

      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-[var(--border)] glass-light flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--cyan-dim)] flex items-center justify-center">
              <Anchor className="w-4 h-4 text-[var(--cyan)]" />
            </div>
            <span className="font-bold text-sm tracking-tight">PicSea</span>
          </button>

          <div className="flex items-center gap-1 ml-6">
            {navItems.map(item => {
              const isActive = view === item.view || (view === 'job' && item.view === 'dashboard');
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${isActive ? 'bg-[var(--cyan)]/10 text-[var(--cyan)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'}
                  `}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {view === 'job' && jobName && (
            <div className="flex items-center gap-2 text-sm ml-4">
              <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-secondary)] font-medium">{jobName}</span>
            </div>
          )}

          <kbd className="ml-4 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-[10px] text-[var(--text-tertiary)] font-mono">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-[var(--cyan)] font-semibold opacity-60">
            7-SENSE
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
