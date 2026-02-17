'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

type ConnectionState = 'online' | 'offline';

export function ConnectionStatus() {
  const [state, setState] = useState<ConnectionState>('online');

  useEffect(() => {
    const handleOnline = () => setState('online');
    const handleOffline = () => setState('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) setState('offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show indicator when offline — online is the default expectation
  if (state === 'online') {
    return (
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: '#34D399',
          boxShadow: '0 0 6px rgba(52, 211, 153, 0.5)',
        }}
      />
    );
  }

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-full"
      style={{
        background: 'rgba(248, 113, 113, 0.08)',
        border: '1px solid rgba(248, 113, 113, 0.15)',
      }}
    >
      <WifiOff className="w-3 h-3" style={{ color: '#F87171' }} />
      <span className="text-[9px] font-bold" style={{ color: '#F87171' }}>
        Offline
      </span>
    </div>
  );
}
