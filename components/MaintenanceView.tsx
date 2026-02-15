"use client";

import React, { useState } from "react";
import { MaintenanceSchedule } from "@/lib/types";
import {
  Calendar, AlertTriangle, Clock, CheckCircle, Plus, Ship, Wrench
} from "lucide-react";

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
    onAddSchedule({
      description: newDesc,
      vesselName: newVessel,
      intervalMonths: parseInt(newInterval),
    });
    setNewDesc(''); setNewVessel(''); setNewInterval('12');
    setShowAdd(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Maintenance</h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Preventive schedules across your fleet
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white font-semibold text-sm rounded-lg hover:bg-[var(--primary-light)] hover:shadow-[0_0_20px_var(--primary-glow)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Schedule
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Overdue</span>
          </div>
          <span className="text-2xl font-bold text-red-400">{overdue.length}</span>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Due Soon</span>
          </div>
          <span className="text-2xl font-bold text-amber-400">{dueSoon.length}</span>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[var(--primary-light)]" />
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Scheduled</span>
          </div>
          <span className="text-2xl font-bold">{schedules.length}</span>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass rounded-xl p-5 mb-6 fade-in">
          <h3 className="text-sm font-semibold mb-4 text-[var(--primary-light)]">New Maintenance Schedule</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">Description *</label>
              <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Replace raw water impeller" className="w-full" autoFocus />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">Vessel</label>
              <input type="text" value={newVessel} onChange={e => setNewVessel(e.target.value)} placeholder="BLACK BEAR" className="w-full" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">Interval (months)</label>
              <input type="number" value={newInterval} onChange={e => setNewInterval(e.target.value)} className="w-full" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-[var(--text-tertiary)]">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded-lg">Add</button>
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <Section title="OVERDUE" icon={<AlertTriangle className="w-4 h-4 text-red-400" />} items={overdue} onMarkPerformed={onMarkPerformed} urgencyColor="red" />
      )}

      {/* Due Soon */}
      {dueSoon.length > 0 && (
        <Section title="DUE WITHIN 30 DAYS" icon={<Clock className="w-4 h-4 text-amber-400" />} items={dueSoon} onMarkPerformed={onMarkPerformed} urgencyColor="amber" />
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Section title="UPCOMING" icon={<Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />} items={upcoming} onMarkPerformed={onMarkPerformed} urgencyColor="default" />
      )}

      {schedules.length === 0 && (
        <div className="text-center py-16 text-[var(--text-tertiary)]">
          <Wrench className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No maintenance schedules yet</p>
          <p className="text-xs mt-1">Add schedules manually or let the system detect patterns from your job history</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, items, onMarkPerformed, urgencyColor }: {
  title: string;
  icon: React.ReactNode;
  items: MaintenanceSchedule[];
  onMarkPerformed: (id: string) => void;
  urgencyColor: string;
}) {
  const borderColor = urgencyColor === 'red' ? 'border-red-500/20' : urgencyColor === 'amber' ? 'border-amber-500/20' : 'border-[var(--border)]';
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{title}</span>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className={`glass rounded-lg p-4 border ${borderColor} flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <Ship className="w-4 h-4 text-[var(--text-tertiary)]" />
              <div>
                <p className="text-sm font-medium">{item.description}</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {item.vesselName}
                  {item.partName && ` · ${item.partName}`}
                  {item.intervalMonths && ` · Every ${item.intervalMonths} months`}
                  {item.nextDueAt && ` · Due: ${new Date(item.nextDueAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => onMarkPerformed(item.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium rounded-lg hover:bg-[var(--success)]/20 transition-all"
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
