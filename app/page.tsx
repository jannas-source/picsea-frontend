"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Job, View, MaintenanceSchedule } from "@/lib/types";
import { loadJobs, saveJobs } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";
import { JobWorkspace } from "@/components/JobWorkspace";
import { AnalyticsView } from "@/components/AnalyticsView";
import { MaintenanceView } from "@/components/MaintenanceView";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);

  useEffect(() => {
    setJobs(loadJobs());
    // Load maintenance schedules from localStorage for now
    try {
      const raw = localStorage.getItem('picsea_maintenance');
      if (raw) setMaintenanceSchedules(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveJobs(jobs);
  }, [jobs, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('picsea_maintenance', JSON.stringify(maintenanceSchedules));
    }
  }, [maintenanceSchedules, loaded]);

  const updateJob = useCallback((updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? { ...updatedJob, updatedAt: new Date().toISOString() } : j));
  }, []);

  const openJob = (jobId: string) => {
    setActiveJobId(jobId);
    setView('job');
  };

  const addJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
    openJob(job.id);
  };

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    if (activeJobId === jobId) {
      setView('dashboard');
      setActiveJobId(null);
    }
  };

  const handleMarkPerformed = (scheduleId: string) => {
    setMaintenanceSchedules(prev => prev.map(s => {
      if (s.id !== scheduleId) return s;
      const next = new Date();
      if (s.intervalMonths) next.setMonth(next.getMonth() + s.intervalMonths);
      return { ...s, lastPerformedAt: new Date().toISOString(), nextDueAt: next.toISOString(), urgency: 'upcoming' as const };
    }));
  };

  const handleAddSchedule = (data: Partial<MaintenanceSchedule>) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const nextDue = new Date();
    if (data.intervalMonths) nextDue.setMonth(nextDue.getMonth() + data.intervalMonths);
    const schedule: MaintenanceSchedule = {
      id,
      vesselId: '',
      vesselName: data.vesselName || '',
      description: data.description || '',
      intervalMonths: data.intervalMonths,
      nextDueAt: nextDue.toISOString(),
      urgency: 'upcoming',
      basedOn: 'manual',
    };
    setMaintenanceSchedules(prev => [...prev, schedule]);
  };

  const activeJob = jobs.find(j => j.id === activeJobId) || null;

  const handleNavigate = (v: View) => {
    setView(v);
    if (v === 'dashboard') setActiveJobId(null);
  };

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--cyan)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <AppShell
      view={view}
      onNavigate={handleNavigate}
      jobName={activeJob?.name}
    >
      {view === 'dashboard' && (
        <Dashboard jobs={jobs} onOpenJob={openJob} onAddJob={addJob} onDeleteJob={deleteJob} />
      )}
      {view === 'job' && activeJob && (
        <JobWorkspace job={activeJob} onUpdate={updateJob} onBack={() => handleNavigate('dashboard')} />
      )}
      {view === 'analytics' && (
        <AnalyticsView jobs={jobs} />
      )}
      {view === 'maintenance' && (
        <MaintenanceView 
          schedules={maintenanceSchedules} 
          onMarkPerformed={handleMarkPerformed}
          onAddSchedule={handleAddSchedule}
        />
      )}
    </AppShell>
  );
}
