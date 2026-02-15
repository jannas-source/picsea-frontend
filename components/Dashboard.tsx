"use client";

import React, { useState } from "react";
import { Job, JobTemplate } from "@/lib/types";
import { createJob, loadTemplates, calculateJobProgress } from "@/lib/store";
import { TemplateSelector } from "./TemplateSelector";
import { VesselContextForm, VesselContext, EMPTY_VESSEL, loadSavedVessels, saveVessel } from "./VesselContextForm";
import {
  Plus, Ship, Package, Clock, CheckCircle, Trash2,
  Briefcase, FileText, Camera, AlertTriangle, TrendingUp,
  Wrench, ChevronDown, ChevronUp
} from "lucide-react";

interface DashboardProps {
  jobs: Job[];
  onOpenJob: (jobId: string) => void;
  onAddJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; dotClass: string }> = {
  draft: { label: 'Draft', color: 'var(--text-tertiary)', dotClass: 'status-draft' },
  active: { label: 'Active', color: 'var(--success)', dotClass: 'status-active' },
  ordered: { label: 'Ordered', color: 'var(--warning)', dotClass: 'status-pending' },
  installing: { label: 'Installing', color: 'var(--primary-light)', dotClass: 'status-active' },
  complete: { label: 'Complete', color: 'var(--text-tertiary)', dotClass: 'status-draft' },
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
    // Attach vessel context if filled
    if (vesselContext.make || vesselContext.electrical_voltage) {
      (job as any).vesselContext = vesselContext;
      // Auto-save vessel if it has a name
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
  const totalParts = jobs.reduce((sum, j) => sum + j.bom.length, 0);
  const warningCount = jobs.reduce((s, j) => s + j.bom.reduce((ws, b) => ws + (b.warnings?.length || 0), 0), 0);
  const completedJobs = jobs.filter(j => j.status === 'complete');

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1.5">Jobs</h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Manage procurement across all active projects
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setShowTemplates(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white font-semibold text-sm rounded-lg hover:bg-[var(--primary-light)] hover:shadow-[0_0_24px_var(--primary-glow)] transition-all"
        >
          <Plus className="w-4 h-4" />
          New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        {[
          { icon: Briefcase, label: 'Active Jobs', value: activeJobs.length, color: 'var(--success)' },
          { icon: CheckCircle, label: 'Completed', value: completedJobs.length, color: 'var(--primary-light)' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
            <span className="text-4xl font-bold tracking-tight">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* New Job Form */}
      {showNew && (
        <div className="glass rounded-xl p-5 mb-6 fade-in">
          <h3 className="text-sm font-semibold mb-4 text-[var(--primary-light)]">New Job</h3>
          
          {/* Template selector */}
          {showTemplates && templates.length > 0 && (
            <div className="mb-5">
              <TemplateSelector
                templates={templates}
                onSelect={handleTemplateSelect}
                onSkip={() => setShowTemplates(false)}
              />
            </div>
          )}

          {/* Selected template badge */}
          {selectedTemplate && (
            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/20">
              <FileText className="w-4 h-4 text-[var(--primary-light)]" />
              <span className="text-xs">Template: <strong>{selectedTemplate.name}</strong> ({selectedTemplate.defaultParts.length} parts)</span>
              <button onClick={() => setSelectedTemplate(undefined)} className="text-xs text-[var(--text-tertiary)] ml-auto">×</button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">Job Name *</label>
              <input
                type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. BLACK BEAR Engine Service" className="w-full" autoFocus
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">Vessel</label>
              <input type="text" value={newVessel} onChange={e => setNewVessel(e.target.value)} placeholder="e.g. BLACK BEAR" className="w-full" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium block mb-1.5">Client</label>
              <input type="text" value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="e.g. John Smith" className="w-full" />
            </div>
          </div>
          {/* Vessel Context (Competitive Moat) */}
          <div className="mb-4">
            <button
              onClick={() => setShowVesselForm(!showVesselForm)}
              className="flex items-center gap-2 text-xs text-[var(--primary-light)] hover:underline mb-2"
            >
              <Ship className="w-3 h-3" />
              {showVesselForm ? 'Hide' : 'Add'} vessel details (enables compatibility checks)
              {showVesselForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            {/* Quick-select saved vessels */}
            {!showVesselForm && savedVessels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {savedVessels.map(v => (
                  <button
                    key={v.name}
                    onClick={() => handleSelectSavedVessel(v)}
                    className="text-[10px] px-2 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary-light)] transition-all"
                  >
                    {v.name || `${v.make} ${v.model}`}
                  </button>
                ))}
              </div>
            )}
            
            {showVesselForm && (
              <div className="mt-2 fade-in">
                <VesselContextForm
                  vessel={vesselContext}
                  onChange={setVesselContext}
                  compact
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newName.trim()}
              className="px-4 py-2 bg-[var(--primary)] text-white font-semibold text-sm rounded-lg disabled:opacity-30 hover:bg-[var(--primary-light)] hover:shadow-[0_0_16px_var(--primary-glow)] transition-all">
              Create Job
            </button>
            <button onClick={() => { setShowNew(false); setShowTemplates(false); setSelectedTemplate(undefined); setShowVesselForm(false); }}
              className="px-4 py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Job List */}
      {jobs.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary-dim)] flex items-center justify-center mx-auto mb-6">
            <Camera className="w-8 h-8 text-[var(--primary-light)]" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">Ready to identify your first part?</h3>
          <p className="text-sm text-[var(--text-tertiary)] mb-8 max-w-sm mx-auto">Snap a photo, get instant part identification and sourcing across top marine suppliers.</p>
          <button onClick={() => { setShowNew(true); setShowTemplates(true); }}
            className="px-6 py-3 bg-[var(--primary)] text-white font-semibold text-sm rounded-lg hover:bg-[var(--primary-light)] hover:shadow-[0_0_24px_var(--primary-glow)] transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4 inline mr-2" />Start First Job
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map(job => {
            const sc = statusConfig[job.status] || statusConfig.active;
            const progress = calculateJobProgress(job);
            const bomTotal = job.bom.reduce((sum, item) => {
              const price = item.listings?.[0]?.price_cents || 0;
              return sum + (price / 100) * item.quantity;
            }, 0);
            const jobWarnings = job.bom.reduce((s, b) => s + (b.warnings?.length || 0), 0);

            return (
              <div key={job.id} onClick={() => onOpenJob(job.id)}
                className="glass rounded-2xl p-5 cursor-pointer hover:border-[var(--border-active)] transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`status-dot flex-shrink-0 ${sc.dotClass}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-0.5">
                        <h3 className="font-semibold text-sm truncate">{job.name}</h3>
                        <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full"
                          style={{ color: sc.color, background: `color-mix(in srgb, ${sc.color} 15%, transparent)` }}>
                          {sc.label}
                        </span>
                        {job.priority === 'critical' && (
                          <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                            Critical
                          </span>
                        )}
                        {jobWarnings > 0 && (
                          <span className="text-[10px] flex items-center gap-1 text-amber-400">
                            <AlertTriangle className="w-3 h-3" />{jobWarnings}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                        {job.vessel && <span className="flex items-center gap-1"><Ship className="w-3 h-3" />{job.vessel}</span>}
                        {job.client && <span>{job.client}</span>}
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(job.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {/* Progress bar */}
                      {job.bom.length > 0 && job.status !== 'complete' && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-[var(--surface-2)] overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--primary-light)] transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[10px] text-[var(--text-tertiary)]">{progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-[var(--text-tertiary)]">
                    <div className="text-center">
                      <div className="font-semibold text-[var(--text-secondary)] text-sm">{job.photos.length}</div>
                      <div>photos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[var(--text-secondary)] text-sm">{job.bom.length}</div>
                      <div>parts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[var(--primary-light)] text-sm">${bomTotal.toFixed(0)}</div>
                      <div>est.</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${job.name}"?`)) onDeleteJob(job.id); }}
                      className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors opacity-0 group-hover:opacity-100">
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
