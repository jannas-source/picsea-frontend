"use client";

import React from "react";
import { View } from "@/lib/types";
import { ChevronRight, Anchor, Briefcase, BarChart3, Wrench } from "lucide-react";

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
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-[var(--border)] glass-light flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--cyan-dim)] flex items-center justify-center">
              <Anchor className="w-4 h-4 text-[var(--cyan)]" />
            </div>
            <span className="font-bold text-sm tracking-tight">PicSea</span>
          </button>

          {/* Nav tabs */}
          <div className="flex items-center gap-1 ml-6">
            {navItems.map(item => {
              const isActive = view === item.view || (view === 'job' && item.view === 'dashboard');
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${isActive 
                      ? 'bg-[var(--cyan)]/10 text-[var(--cyan)]' 
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                    }
                  `}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Breadcrumb for job view */}
          {view === 'job' && jobName && (
            <div className="flex items-center gap-2 text-sm ml-4">
              <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-secondary)] font-medium">{jobName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-[var(--cyan)] font-semibold opacity-60">
            7-SENSE
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
