'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Job } from '@/lib/types';
import { loadJobs, saveJobs, createJob, createPhoto, partToBOMItem, identifyPhoto } from '@/lib/store';
import { ensureDemoData, getDemoJobs } from '@/lib/demo-data';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AppShell, AppView } from '@/components/AppShell';
import { CaptureView } from '@/components/CaptureView';
import { ReviewView } from '@/components/ReviewView';
import { StatusView } from '@/components/StatusView';
import { PhotoAnalysis } from '@/components/PhotoAnalysis';
import { AuthModal } from '@/components/AuthModal';
import { ScanLimitBanner } from '@/components/ScanLimitBanner';

export default function Home() {
  return (
    <AuthProvider>
      <PicSeaApp />
    </AuthProvider>
  );
}

function PicSeaApp() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, canScan } = useAuth();

  const openSignIn = () => { setAuthMode('login'); setAuthOpen(true); };
  const openSignUp = () => { setAuthMode('signup'); setAuthOpen(true); };
  const [jobs, setJobs] = useState<Job[]>([]);
  const [view, setView] = useState<AppView>('capture');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingFilename, setAnalyzingFilename] = useState('');

  // Load jobs from localStorage, seed with demo data if empty
  useEffect(() => {
    const stored = loadJobs();
    const seeded = ensureDemoData(stored);
    setJobs(seeded);
    if (seeded !== stored) saveJobs(seeded);

    // Auto-select the first active job
    const active = seeded.find((j) => j.status === 'active');
    if (active) setActiveJobId(active.id);

    setLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (loaded) saveJobs(jobs);
  }, [jobs, loaded]);

  const activeJob = jobs.find((j) => j.id === activeJobId) || null;

  const updateJob = useCallback((updatedJob: Job) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === updatedJob.id
          ? { ...updatedJob, updatedAt: new Date().toISOString() }
          : j
      )
    );
  }, []);

  // Handle photo capture → create or update job → analyze
  const handlePhotoCapture = useCallback(
    async (dataUrl: string, filename: string) => {
      setAnalyzing(true);
      setAnalyzingFilename(filename);

      let targetJob = activeJob;

      // If no active job, create one
      if (!targetJob) {
        const now = new Date();
        const name = `Job — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        const newJob = createJob(name, '', '');
        targetJob = newJob;
        setJobs((prev) => [newJob, ...prev]);
        setActiveJobId(newJob.id);
      }

      // Add photo to job
      const photo = createPhoto(dataUrl, filename);
      photo.status = 'identifying';
      const jobWithPhoto = {
        ...targetJob,
        photos: [...targetJob.photos, photo],
        updatedAt: new Date().toISOString(),
      };
      setJobs((prev) => prev.map((j) => (j.id === jobWithPhoto.id ? jobWithPhoto : j)));

      // Try real API identification, fall back to demo flow
      try {
        const result = await identifyPhoto(dataUrl, targetJob.vesselContext);
        const newBomItems = result.parts.map((p) => partToBOMItem(p, photo.id));

        const updatedPhoto = { ...photo, status: 'identified' as const, identifiedParts: result.parts };
        const updatedJob = {
          ...jobWithPhoto,
          photos: jobWithPhoto.photos.map((p) => (p.id === photo.id ? updatedPhoto : p)),
          bom: [...jobWithPhoto.bom, ...newBomItems],
          updatedAt: new Date().toISOString(),
        };

        setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
      } catch {
        // API unavailable — mark photo as identified with no new parts (demo mode)
        const updatedPhoto = { ...photo, status: 'identified' as const };
        const updatedJob = {
          ...jobWithPhoto,
          photos: jobWithPhoto.photos.map((p) => (p.id === photo.id ? updatedPhoto : p)),
          updatedAt: new Date().toISOString(),
        };
        setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
      }
    },
    [activeJob]
  );

  const handleAnalysisComplete = useCallback(() => {
    setAnalyzing(false);
    setAnalyzingFilename('');
    setView('review');
  }, []);

  const handleTryDemo = useCallback(() => {
    // Simulate analysis on existing demo job
    const demoJob = jobs.find((j) => j.id === 'demo_blackbear');
    if (demoJob) {
      setActiveJobId(demoJob.id);
      setAnalyzing(true);
      setAnalyzingFilename('electrical_panel.jpg');
    } else {
      // If demo data was cleared, re-seed
      const demoJobs = getDemoJobs();
      setJobs((prev) => [...demoJobs, ...prev.filter((j) => !j.id.startsWith('demo_'))]);
      setActiveJobId('demo_blackbear');
      setAnalyzing(true);
      setAnalyzingFilename('electrical_panel.jpg');
    }
  }, [jobs]);

  const handleOpenJob = useCallback(
    (jobId: string) => {
      setActiveJobId(jobId);
      setView('review');
    },
    []
  );

  const handleSelectJob = useCallback((jobId: string) => {
    setActiveJobId(jobId);
  }, []);

  const bomCount = activeJob?.bom.length || 0;

  if (!loaded) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--abyss)' }}
      >
        <div
          className="w-10 h-10 rounded-full"
          style={{
            border: '2px solid transparent',
            borderTopColor: '#00F0FF',
            borderRightColor: 'rgba(0, 240, 255, 0.3)',
            animation: 'oceanic-spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <>
      <AppShell
        view={view}
        onNavigate={setView}
        activeJobName={activeJob?.name}
        bomCount={bomCount}
        onSignIn={openSignIn}
      >
        {/* Scan limit warning banner */}
        {view === 'capture' && <ScanLimitBanner />}

        {view === 'capture' && (
          <CaptureView
            jobs={jobs}
            onPhotoCapture={handlePhotoCapture}
            onOpenJob={handleOpenJob}
            onTryDemo={handleTryDemo}
          />
        )}
        {view === 'review' && (
          <ReviewView
            job={activeJob}
            allJobs={jobs}
            onUpdateJob={updateJob}
            onSelectJob={handleSelectJob}
            onGoCapture={() => setView('capture')}
          />
        )}
        {view === 'status' && (
          <StatusView jobs={jobs} onOpenJob={handleOpenJob} />
        )}
      </AppShell>

      {/* Auth modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />

      {/* Photo analysis overlay */}
      <PhotoAnalysis
        visible={analyzing}
        filename={analyzingFilename}
        onComplete={handleAnalysisComplete}
      />
    </>
  );
}
