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
      <header className="h-16 flex items-center justify-between px-8 border-b border-[var(--border)] glass-light flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-dim)] flex items-center justify-center">
              <Anchor className="w-4.5 h-4.5 text-[var(--primary-light)]" />
            </div>
            <span className="font-bold text-base tracking-tight">PicSea</span>
          </button>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1 ml-8">
            {navItems.map(item => {
              const isActive = view === item.view || (view === 'job' && item.view === 'dashboard');
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-[var(--primary)]/15 text-[var(--primary-light)]' 
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Breadcrumb for job view */}
          {view === 'job' && jobName && (
            <div className="flex items-center gap-2 text-sm ml-4">
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-secondary)] font-medium">{jobName}</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
