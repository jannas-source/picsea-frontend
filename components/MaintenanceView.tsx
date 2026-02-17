"use client";

import React, { useState } from "react";
import { MaintenanceSchedule } from "@/lib/types";
import { Calendar, AlertTriangle, Clock, CheckCircle, Plus, Ship, Wrench } from "lucide-react";

interface MaintenanceViewProps {
  schedules: MaintenanceSchedule[];
  onMarkPerformed: (id: string) => void;
  onAddSchedule: (schedule: Partial<MaintenanceSchedule>) => void;
}

export function MaintenanceView({ schedules, onMarkPerformed, onAddSchedule }: MaintenanceViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newVessel, setNewVessel] = useState('');
  const [newInterval, setNewInterval] = useState('12');

  const overdue = schedules.filter(s => s.urgency === 'overdue');
  const dueSoon = schedules.filter(s => s.urgency === 'due_soon');
  const upcoming = schedules.filter(s => s.urgency === 'upcoming');

  const handleAdd = () => {
    if (!newDesc.trim()) return;
    onAddSchedule({ description: newDesc, vesselName: newVessel, intervalMonths: parseInt(newInterval) });
    setNewDesc(''); setNewVessel(''); setNewInterval('12');
    setShowAdd(false);
  };

  const statsData = [
    {
      label: 'Overdue',
      value: overdue.length,
      color: '#F87171',
      icon: AlertTriangle,
      bg: 'rgba(248, 113, 113, 0.08)',
      border: 'rgba(248, 113, 113, 0.2)',
      animation: overdue.length > 0 ? 'status-pulse-danger 2s ease-in-out infinite' : 'none',
    },
    {
      label: 'Due Soon',
      value: dueSoon.length,
      color: '#FBBF24',
      icon: Clock,
      bg: 'rgba(251, 191, 36, 0.08)',
      border: 'rgba(251, 191, 36, 0.2)',
      animation: dueSoon.length > 0 ? 'status-pulse-warning 2.5s ease-in-out infinite' : 'none',
    },
    {
      label: 'Scheduled',
      value: schedules.length,
      color: 'var(--cyan)',
      icon: Calendar,
      bg: 'rgba(0, 240, 255, 0.06)',
      border: 'rgba(0, 240, 255, 0.12)',
      animation: 'none',
    },
  ];

  return (
    <div
      className="max-w-5xl mx-auto px-5 py-8 fade-in"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-black tracking-tight mb-1.5 text-white"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Maintenance
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Preventive schedules across your fleet
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-px w-20" style={{ background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.4), transparent)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px rgba(0, 240, 255, 0.8)', animation: 'glow-pulse 2s ease-in-out infinite' }} />
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
          style={{ background: 'var(--cyan)', color: 'var(--abyss)', fontFamily: 'Montserrat, sans-serif' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-sm)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
        >
          <Plus className="w-4 h-4" />
          Add Schedule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 stagger-children">
        {statsData.map(s => (
          <div
            key={s.label}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span
                className="text-[10px] uppercase tracking-wider font-bold"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'Montserrat, sans-serif' }}
              >
                {s.label}
              </span>
            </div>
            <span
              className="text-3xl font-black"
              style={{
                color: s.color,
                fontFamily: 'Montserrat, sans-serif',
                textShadow: s.value > 0 ? `0 0 10px ${s.border}` : 'none',
              }}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div
          className="rounded-2xl p-5 mb-6 fade-in"
          style={{
            background: 'rgba(0, 18, 34, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <h3
            className="text-sm font-black uppercase tracking-wider mb-4"
            style={{ color: 'var(--cyan)', fontFamily: 'Montserrat, sans-serif' }}
          >
            New Maintenance Schedule
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="label-upper block mb-1.5">Description *</label>
              <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Replace raw water impeller" className="w-full" autoFocus />
            </div>
            <div>
              <label className="label-upper block mb-1.5">Vessel</label>
              <input type="text" value={newVessel} onChange={e => setNewVessel(e.target.value)} placeholder="BLACK BEAR" className="w-full" />
            </div>
            <div>
              <label className="label-upper block mb-1.5">Interval (months)</label>
              <input type="number" value={newInterval} onChange={e => setNewInterval(e.target.value)} className="w-full" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs transition-colors" style={{ color: 'var(--text-tertiary)' }}>
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150"
              style={{ background: 'var(--cyan)', color: 'var(--abyss)', fontFamily: 'Montserrat, sans-serif' }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <ScheduleSection
          title="OVERDUE"
          icon={<AlertTriangle className="w-4 h-4" style={{ color: '#F87171' }} />}
          items={overdue}
          onMarkPerformed={onMarkPerformed}
          borderColor="rgba(248, 113, 113, 0.2)"
          rowBg="rgba(248, 113, 113, 0.04)"
        />
      )}

      {/* Due Soon */}
      {dueSoon.length > 0 && (
        <ScheduleSection
          title="DUE WITHIN 30 DAYS"
          icon={<Clock className="w-4 h-4" style={{ color: '#FBBF24' }} />}
          items={dueSoon}
          onMarkPerformed={onMarkPerformed}
          borderColor="rgba(251, 191, 36, 0.2)"
          rowBg="rgba(251, 191, 36, 0.04)"
        />
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <ScheduleSection
          title="UPCOMING"
          icon={<Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />}
          items={upcoming}
          onMarkPerformed={onMarkPerformed}
          borderColor="var(--border)"
          rowBg="rgba(0, 26, 46, 0.3)"
        />
      )}

      {/* Empty state */}
      {schedules.length === 0 && (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: 'rgba(0, 26, 46, 0.3)', border: '1px solid var(--border)' }}
        >
          <Wrench className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-white/40 font-medium">No maintenance schedules yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Add schedules manually or detect patterns from job history
          </p>
        </div>
      )}
    </div>
  );
}

function ScheduleSection({
  title, icon, items, onMarkPerformed, borderColor, rowBg
}: {
  title: string;
  icon: React.ReactNode;
  items: MaintenanceSchedule[];
  onMarkPerformed: (id: string) => void;
  borderColor: string;
  rowBg: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span
          className="text-[9px] uppercase tracking-[0.2em] font-black"
          style={{ color: 'var(--text-tertiary)', fontFamily: 'Montserrat, sans-serif' }}
        >
          {title}
        </span>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            className="rounded-xl p-4 flex items-center justify-between transition-all duration-200"
            style={{
              background: rowBg,
              border: `1px solid ${borderColor}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex items-center gap-4">
              <Ship className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <p className="text-sm font-semibold text-white">{item.description}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {item.vesselName}
                  {item.partName && ` · ${item.partName}`}
                  {item.intervalMonths && ` · Every ${item.intervalMonths} months`}
                  {item.nextDueAt && ` · Due: ${new Date(item.nextDueAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => onMarkPerformed(item.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex-shrink-0"
              style={{
                background: 'rgba(52, 211, 153, 0.1)',
                color: '#34D399',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                fontFamily: 'Montserrat, sans-serif',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(52, 211, 153, 0.18)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(52, 211, 153, 0.1)')}
            >
              <CheckCircle className="w-3 h-3" />
              Done
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
