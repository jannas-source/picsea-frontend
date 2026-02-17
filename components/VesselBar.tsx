'use client';

import React, { useState } from 'react';
import { VesselContext } from '@/lib/types';
import { Ship, ChevronDown, ChevronUp, Pencil, X, Check } from 'lucide-react';

interface VesselBarProps {
  vessel: VesselContext;
  jobName: string;
  onUpdate: (vessel: VesselContext) => void;
}

export function VesselBar({ vessel, jobName, onUpdate }: VesselBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<VesselContext>(vessel);

  const vesselLine = [
    vessel.year,
    vessel.make,
    vessel.model,
    vessel.voltage ? `${vessel.voltage}V` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const handleSave = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(vessel);
    setEditing(false);
  };

  return (
    <div
      className="mx-3 mt-2 rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(0, 26, 46, 0.5)',
        border: '1px solid rgba(0, 240, 255, 0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Compact bar */}
      <button
        onClick={() => !editing && setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        style={{ minHeight: '52px' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
          }}
        >
          <Ship className="w-4 h-4" style={{ color: '#00F0FF' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white truncate">
            {vessel.name || jobName}
          </div>
          <div
            className="text-[11px] truncate"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {vesselLine || 'Tap to add vessel details'}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!editing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
                setExpanded(true);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div
          className="px-4 pb-4 pt-1 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {editing ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Vessel Name', placeholder: 'Black Bear' },
                { key: 'make', label: 'Make', placeholder: 'Boston Whaler' },
                { key: 'model', label: 'Model', placeholder: '270 Dauntless' },
                { key: 'year', label: 'Year', placeholder: '2015', type: 'number' },
                { key: 'voltage', label: 'Voltage', placeholder: '12', type: 'number' },
                { key: 'engine', label: 'Engine', placeholder: 'Mercury Verado 300' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label
                    className="text-[9px] uppercase tracking-[0.12em] font-bold block mb-1"
                    style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-montserrat)' }}
                  >
                    {label}
                  </label>
                  <input
                    type={type || 'text'}
                    placeholder={placeholder}
                    value={(draft as any)[key] ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        [key]: type === 'number' ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value,
                      })
                    }
                    className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none"
                    style={{
                      background: 'rgba(0, 26, 46, 0.6)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      minHeight: '40px',
                    }}
                  />
                </div>
              ))}
              <div className="col-span-2 flex gap-2 mt-1">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                  style={{
                    background: '#00F0FF',
                    color: '#000C18',
                    minHeight: '44px',
                  }}
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    minHeight: '44px',
                  }}
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[11px]">
              {[
                { label: 'Engine', value: vessel.engine },
                { label: 'Fuel', value: vessel.fuel_type },
                { label: 'Hull', value: vessel.hull_material },
              ]
                .filter((d) => d.value)
                .map((d) => (
                  <div key={d.label}>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>{d.label}</span>
                    <div className="text-white font-medium">{d.value}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
