'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';

type ConnectionState = 'online' | 'slow' | 'offline';

export function ConnectionStatus() {
  const [state, setState] = useState<ConnectionState>('online');
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const handleOnline = () => setState('online');
    const handleOffline = () => setState('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) setState('offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show auto-save indicator periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    online: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.15)', icon: Wifi },
    slow: { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.08)', border: 'rgba(251, 191, 36, 0.15)', icon: Wifi },
    offline: { color: '#F87171', bg: 'rgba(248, 113, 113, 0.08)', border: 'rgba(248, 113, 113, 0.15)', icon: WifiOff },
  };

  const c = config[state];

  return (
    <div className="flex items-center gap-1.5">
      {/* Auto-save indicator */}
      {showSaved && (
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full transition-opacity"
          style={{ background: 'rgba(52, 211, 153, 0.06)' }}
        >
          <Cloud className="w-2.5 h-2.5" style={{ color: 'rgba(52, 211, 153, 0.4)' }} />
          <span className="text-[8px] font-bold" style={{ color: 'rgba(52, 211, 153, 0.5)' }}>
            Saved
          </span>
        </div>
      )}

      {/* Connection dot */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: c.color,
          boxShadow: `0 0 6px ${c.color}80`,
        }}
      />
    </div>
  );
}
