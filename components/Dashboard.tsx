"use client";

import React, { useState } from "react";
import { Job, JobTemplate } from "@/lib/types";
import { createJob, loadTemplates, calculateJobProgress } from "@/lib/store";
import { TemplateSelector } from "./TemplateSelector";
import { VesselContextForm, VesselContext, EMPTY_VESSEL, loadSavedVessels, saveVessel } from "./VesselContextForm";
import {
  Plus, Ship, Clock, CheckCircle, Trash2,
  Briefcase, FileText, Camera, AlertTriangle,
  ChevronDown, ChevronUp, Activity
} from "lucide-react";

interface DashboardProps {
  jobs: Job[];
  onOpenJob: (jobId: string) => void;
  onAddJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; dotClass: string; glow: string }> = {
  draft:      { label: 'Draft',      color: 'var(--text-tertiary)', dotClass: 'status-draft',   glow: 'rgba(255,255,255,0.1)' },
  active:     { label: 'Active',     color: 'var(--success)',       dotClass: 'status-active',  glow: 'rgba(52, 211, 153, 0.15)' },
  ordered:    { label: 'Ordered',    color: 'var(--warning)',       dotClass: 'status-pending', glow: 'rgba(251, 191, 36, 0.15)' },
  installing: { label: 'Installing', color: 'var(--cyan)',          dotClass: 'status-active',  glow: 'rgba(0, 240, 255, 0.15)' },
  complete:   { label: 'Complete',   color: 'var(--text-tertiary)', dotClass: 'status-draft',   glow: 'rgba(255,255,255,0.05)' },
};

export function Dashboard({ jobs, onOpenJob, onAddJob, onDeleteJob }: DashboardProps) {
  const [showNew, setShowNew] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newName, setNewName] = useState('');
  const [newVessel, setNewVessel] = useState('');
  const [newClient, setNewClient] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | undefined>();
  const [showVesselForm, setShowVesselForm] = useState(false);
  const [vesselContext, setVesselContext] = useState<VesselContext>({ ...EMPTY_VESSEL });
  const [savedVessels] = useState(() => loadSavedVessels());

  const templates = loadTemplates();

  const handleCreate = () => {
    if (!newName.trim()) return;
    const job = createJob(newName.trim(), newVessel.trim(), newClient.trim(), selectedTemplate);
    if (vesselContext.make || vesselContext.electrical_voltage) {
      (job as any).vesselContext = vesselContext;
      if (vesselContext.name) saveVessel(vesselContext);
    }
    onAddJob(job);
    setNewName(''); setNewVessel(''); setNewClient('');
    setShowNew(false); setShowTemplates(false); setSelectedTemplate(undefined);
    setShowVesselForm(false); setVesselContext({ ...EMPTY_VESSEL });
  };

  const handleSelectSavedVessel = (v: VesselContext) => {
    setVesselContext(v);
    setNewVessel(v.name);
    setShowVesselForm(true);
  };

  const handleTemplateSelect = (template: JobTemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
    if (!newName) setNewName(template.name);
  };

  const activeJobs = jobs.filter(j => j.status === 'active' || j.status === 'installing');
  const completedJobs = jobs.filter(j => j.status === 'complete');
  const warningCount = jobs.reduce((s, j) => s + j.bom.reduce((ws, b) => ws + (b.warnings?.length || 0), 0), 0);
  const totalParts = jobs.reduce((sum, j) => sum + j.bom.length, 0);

  const stats = [
    { label: 'Active Jobs',  value: activeJobs.length,   color: 'var(--success)', glow: 'rgba(52, 211, 153, 0.5)',  icon: Activity },
    { label: 'Completed',    value: completedJobs.length, color: 'var(--cyan)',    glow: 'rgba(0, 240, 255, 0.5)',   icon: CheckCircle },
    { label: 'Total Parts',  value: totalParts,           color: 'var(--text-secondary)', glow: 'rgba(255,255,255,0.3)', icon: Camera },
    { label: 'Warnings',     value: warningCount,         color: warningCount > 0 ? 'var(--warning)' : 'var(--text-tertiary)', glow: warningCount > 0 ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255,255,255,0.2)', icon: AlertTriangle },
  ];

  return (
    <div
      className="max-w-5xl mx-auto px-5 py-8 fade-in"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-black tracking-tight mb-2 text-white"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Jobs
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Manage procurement across all active projects
          </p>
          
          {/* Sonar line accent */}
          <div className="mt-3 flex items-center gap-2">
            <div
              className="h-px flex-1 max-w-[80px]"
              style={{ background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.4), transparent)' }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--cyan)', boxShadow: '0 0 6px rgba(0, 240, 255, 0.8)', animation: 'glow-pulse 2s ease-in-out infinite' }}
            />
          </div>
        </div>
        
        <button
          onClick={() => { setShowNew(true); setShowTemplates(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
          style={{
            background: 'var(--cyan)',
            color: 'var(--abyss)',
            fontFamily: 'Montserrat, sans-serif',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-md)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
        >
          <Plus className="w-4 h-4" />
          New Job
        </button>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger-children">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300"
            style={{
              background: 'var(--gradient-card)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Subtle glow in corner */}
            <div
              className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
              style={{
                background: `radial-gradient(circle at top right, ${stat.glow} 0%, transparent 70%)`,
              }}
            />
            <div className="flex items-center gap-2 mb-3">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span
                className="text-[10px] uppercase tracking-wider font-bold"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'Montserrat, sans-serif' }}
              >
                {stat.label}
              </span>
            </div>
            <span
              className="text-4xl font-black tracking-tight"
              style={{ color: stat.color, fontFamily: 'Montserrat, sans-serif' }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* ===== NEW JOB FORM ===== */}
      {showNew && (
        <div
          className="rounded-2xl p-6 mb-6 fade-in"
          style={{
            background: 'rgba(0, 18, 34, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.06)',
          }}
        >
          <h3
            className="text-sm font-black mb-4 uppercase tracking-wider"
            style={{ color: 'var(--cyan)', fontFamily: 'Montserrat, sans-serif' }}
          >
            New Job
          </h3>

          {showTemplates && templates.length > 0 && (
            <div className="mb-5">
              <TemplateSelector
                templates={templates}
                onSelect={handleTemplateSelect}
                onSkip={() => setShowTemplates(false)}
              />
            </div>
          )}

          {selectedTemplate && (
            <div
              className="flex items-center gap-2 mb-4 p-2.5 rounded-lg"
              style={{
                background: 'rgba(0, 240, 255, 0.06)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
              }}
            >
              <FileText className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
              <span className="text-xs text-white/70">
                Template: <strong className="text-white">{selectedTemplate.name}</strong>{' '}
                <span style={{ color: 'var(--text-tertiary)' }}>({selectedTemplate.defaultParts.length} parts)</span>
              </span>
              <button
                onClick={() => setSelectedTemplate(undefined)}
                className="text-xs ml-auto"
                style={{ color: 'var(--text-tertiary)' }}
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Job Name *', value: newName, onChange: setNewName, placeholder: 'e.g. BLACK BEAR Engine Service', autoFocus: true },
              { label: 'Vessel',     value: newVessel, onChange: setNewVessel, placeholder: 'e.g. BLACK BEAR' },
              { label: 'Client',     value: newClient, onChange: setNewClient, placeholder: 'e.g. John Smith' },
            ].map(f => (
              <div key={f.label}>
                <label
                  className="text-[10px] uppercase tracking-wider font-bold block mb-1.5"
                  style={{ color: 'var(--text-tertiary)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  {f.label}
                </label>
                <input
                  type="text"
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full"
                  autoFocus={f.autoFocus}
                  onKeyDown={f.label.includes('*') ? (e: React.KeyboardEvent) => e.key === 'Enter' && handleCreate() : undefined}
                />
              </div>
            ))}
          </div>

          {/* Vessel context toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowVesselForm(!showVesselForm)}
              className="flex items-center gap-2 text-xs transition-colors duration-200"
              style={{ color: 'var(--cyan)' }}
            >
              <Ship className="w-3 h-3" />
              {showVesselForm ? 'Hide' : 'Add'} vessel details (enables compatibility checks)
              {showVesselForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {!showVesselForm && savedVessels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {savedVessels.map(v => (
                  <button
                    key={v.name}
                    onClick={() => handleSelectSavedVessel(v)}
                    className="text-[10px] px-2.5 py-1 rounded-full transition-all duration-150"
                    style={{
                      background: 'rgba(0, 43, 69, 0.5)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = 'rgba(0, 240, 255, 0.08)';
                      el.style.color = 'var(--cyan)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = 'rgba(0, 43, 69, 0.5)';
                      el.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {v.name || `${v.make} ${v.model}`}
                  </button>
                ))}
              </div>
            )}

            {showVesselForm && (
              <div className="mt-3 fade-in">
                <VesselContextForm vessel={vesselContext} onChange={setVesselContext} compact />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-30"
              style={{
                background: 'var(--cyan)',
                color: 'var(--abyss)',
                fontFamily: 'Montserrat, sans-serif',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-sm)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
            >
              Create Job
            </button>
            <button
              onClick={() => { setShowNew(false); setShowTemplates(false); setSelectedTemplate(undefined); setShowVesselForm(false); }}
              className="px-4 py-2 text-sm transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== JOB LIST (sonar display) ===== */}
      {jobs.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center fade-in"
          style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Sonar rings */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(0, 240, 255, 0.1)',
                animation: 'sonar-ring 3s ease-out infinite',
              }}
            />
            <div
              className="absolute inset-2 rounded-full"
              style={{
                border: '1px solid rgba(0, 240, 255, 0.08)',
                animation: 'sonar-ring 3s ease-out infinite 1s',
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
            >
              <Ship className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.15)' }} />
            </div>
          </div>
          
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Montserrat, sans-serif' }}
          >
            No jobs yet
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
            Create your first job to start photographing and sourcing parts.
          </p>
          <button
            onClick={() => { setShowNew(true); setShowTemplates(true); }}
            className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
            style={{ background: 'var(--cyan)', color: 'var(--abyss)', fontFamily: 'Montserrat, sans-serif' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-cyan-md)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
          >
            <Plus className="w-4 h-4 inline mr-1.5" />
            Create First Job
          </button>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {/* Table header — sonar-style */}
          <div
            className="hidden md:grid grid-cols-[1fr_auto] gap-4 px-4 pb-2"
            style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.1)' }}
          >
            <span
              className="text-[9px] uppercase tracking-[0.15em] font-black"
              style={{ color: 'rgba(0, 240, 255, 0.5)', fontFamily: 'Montserrat, sans-serif' }}
            >
              Job — Vessel — Status
            </span>
            <span
              className="text-[9px] uppercase tracking-[0.15em] font-black"
              style={{ color: 'rgba(0, 240, 255, 0.5)', fontFamily: 'Montserrat, sans-serif' }}
            >
              Photos · Parts · Est. Value
            </span>
          </div>

          {jobs.map(job => {
            const sc = statusConfig[job.status] || statusConfig.active;
            const progress = calculateJobProgress(job);
            const bomTotal = job.bom.reduce((sum, item) => {
              const price = item.listings?.[0]?.price_cents || 0;
              return sum + (price / 100) * item.quantity;
            }, 0);
            const jobWarnings = job.bom.reduce((s, b) => s + (b.warnings?.length || 0), 0);

            return (
              <div
                key={job.id}
                onClick={() => onOpenJob(job.id)}
                className="rounded-xl p-4 cursor-pointer group transition-all duration-200 fade-in"
                style={{
                  background: 'rgba(0, 26, 46, 0.5)',
                  border: '1px solid var(--border)',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(0, 240, 255, 0.2)';
                  el.style.background = 'rgba(0, 43, 69, 0.4)';
                  el.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.04)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--border)';
                  el.style.background = 'rgba(0, 26, 46, 0.5)';
                  el.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`status-dot flex-shrink-0 ${sc.dotClass}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
                        <h3
                          className="font-bold text-sm text-white truncate"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          {job.name}
                        </h3>
                        
                        <span
                          className="text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            color: sc.color,
                            background: sc.glow,
                            border: `1px solid ${sc.color}30`,
                            fontFamily: 'Montserrat, sans-serif',
                          }}
                        >
                          {sc.label}
                        </span>

                        {job.priority === 'critical' && (
                          <span
                            className="text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              background: 'rgba(248, 113, 113, 0.15)',
                              color: 'var(--danger)',
                              border: '1px solid rgba(248, 113, 113, 0.2)',
                              fontFamily: 'Montserrat, sans-serif',
                            }}
                          >
                            Critical
                          </span>
                        )}

                        {jobWarnings > 0 && (
                          <span
                            className="text-[10px] flex items-center gap-1 flex-shrink-0"
                            style={{ color: 'var(--warning)' }}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {jobWarnings}
                          </span>
                        )}
                      </div>

                      <div
                        className="flex items-center gap-4 text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {job.vessel && (
                          <span className="flex items-center gap-1">
                            <Ship className="w-3 h-3" />
                            {job.vessel}
                          </span>
                        )}
                        {job.client && <span>{job.client}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(job.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {job.bom.length > 0 && job.status !== 'complete' && (
                        <div className="mt-2 flex items-center gap-2">
                          <div
                            className="flex-1 h-1 rounded-full overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                                background: 'linear-gradient(90deg, var(--cyan), #4DFAFF)',
                                boxShadow: '0 0 6px rgba(0, 240, 255, 0.4)',
                              }}
                            />
                          </div>
                          <span
                            className="text-[10px] font-mono"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {progress}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div
                    className="flex items-center gap-5 text-xs ml-4 flex-shrink-0"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <div className="text-center hidden sm:block">
                      <div
                        className="font-bold text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {job.photos.length}
                      </div>
                      <div className="text-[10px]">photos</div>
                    </div>
                    <div className="text-center hidden sm:block">
                      <div
                        className="font-bold text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {job.bom.length}
                      </div>
                      <div className="text-[10px]">parts</div>
                    </div>
                    <div className="text-center">
                      <div
                        className="font-black text-sm"
                        style={{
                          color: 'var(--cyan)',
                          textShadow: bomTotal > 0 ? '0 0 8px rgba(0, 240, 255, 0.4)' : 'none',
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        ${bomTotal.toFixed(0)}
                      </div>
                      <div className="text-[10px]">est.</div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Delete "${job.name}"?`)) onDeleteJob(job.id);
                      }}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--danger)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
