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
  const { user, token, canScan, refreshUser } = useAuth();

  const openSignIn = () => { setAuthMode('login'); setAuthOpen(true); };
  const openSignUp = () => { setAuthMode('signup'); setAuthOpen(true); };
  const [jobs, setJobs] = useState<Job[]>([]);
  const [view, setView] = useState<AppView>('capture');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingFilename, setAnalyzingFilename] = useState('');

  // Load jobs from localStorage
  // Demo data is NOT auto-seeded — only loaded on explicit "Try Demo" action
  useEffect(() => {
    const stored = loadJobs();
    // Filter out old auto-seeded demo data for logged-in users
    const cleaned = user ? stored.filter((j) => !j.id.startsWith('demo_') || j.bom.some(b => b.confirmed)) : stored;
    setJobs(cleaned);
    if (cleaned !== stored) saveJobs(cleaned);

    // Auto-select the first active job
    const active = cleaned.find((j) => j.status === 'active');
    if (active) setActiveJobId(active.id);

    setLoaded(true);
  }, [user]);

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
  // Uses refs + functional state updates to avoid race conditions (#6)
  const activeJobRef = React.useRef(activeJob);
  activeJobRef.current = activeJob;
  const tokenRef = React.useRef(token);
  tokenRef.current = token;

  const handlePhotoCapture = useCallback(
    async (dataUrl: string, filename: string) => {
      // Check scan limit before proceeding
      if (user && !canScan) {
        return; // ScanLimitBanner handles the upgrade prompt
      }

      setAnalyzing(true);
      setAnalyzingFilename(filename);

      const photo = createPhoto(dataUrl, filename);
      photo.status = 'identifying';
      let targetJobId: string;

      // Use functional update to get fresh state and avoid race conditions
      if (!activeJobRef.current) {
        const now = new Date();
        const name = `Job — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        const newJob = createJob(name, '', '');
        targetJobId = newJob.id;
        setJobs((prev) => [{ ...newJob, photos: [photo], updatedAt: new Date().toISOString() }, ...prev]);
        setActiveJobId(newJob.id);
      } else {
        targetJobId = activeJobRef.current.id;
        setJobs((prev) => prev.map((j) =>
          j.id === targetJobId
            ? { ...j, photos: [...j.photos, photo], updatedAt: new Date().toISOString() }
            : j
        ));
      }

      // Try real API identification with auth token
      try {
        const currentToken = tokenRef.current;
        // Get vessel context from current state
        const vesselCtx = activeJobRef.current?.vesselContext;
        const result = await identifyPhoto(dataUrl, vesselCtx, currentToken);
        const newBomItems = result.parts.map((p) => partToBOMItem(p, photo.id));

        // Functional update — always operates on latest state
        setJobs((prev) => prev.map((j) => {
          if (j.id !== targetJobId) return j;
          return {
            ...j,
            photos: j.photos.map((p) => p.id === photo.id
              ? { ...p, status: 'identified' as const, identifiedParts: result.parts }
              : p
            ),
            bom: [...j.bom, ...newBomItems],
            updatedAt: new Date().toISOString(),
          };
        }));

        // Refresh user to get updated scan count from server
        if (user) refreshUser();
      } catch (err: any) {
        // Check if scan limit error from server
        if (err?.message?.includes('scan limit') || err?.message?.includes('limit reached')) {
          setAnalyzing(false);
          setAnalyzingFilename('');
          // Remove the pending photo
          setJobs((prev) => prev.map((j) =>
            j.id === targetJobId
              ? { ...j, photos: j.photos.filter((p) => p.id !== photo.id) }
              : j
          ));
          refreshUser();
          return;
        }

        // API unavailable — mark photo as identified with no new parts
        setJobs((prev) => prev.map((j) => {
          if (j.id !== targetJobId) return j;
          return {
            ...j,
            photos: j.photos.map((p) => p.id === photo.id
              ? { ...p, status: 'identified' as const }
              : p
            ),
            updatedAt: new Date().toISOString(),
          };
        }));
      }
    },
    [user, canScan, refreshUser]
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
