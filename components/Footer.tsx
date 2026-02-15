"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-[#00F0FF]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#00F0FF]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 10.189V14" />
                  <path d="M12 2v3" />
                  <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
                  <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76" />
                  <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white/70">PicSea</span>
            </div>
            <p className="text-white/25 text-xs">
              Part of the 7-SENSE Marine Intelligence Platform.
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-6 text-xs text-white/30">
            <a href="https://7sense.net" className="hover:text-white/60 transition-colors">About</a>
            <a href="https://7sense.net" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="mailto:jannas@7sense.net" className="hover:text-white/60 transition-colors">Contact</a>
            <a href="https://7sense.net" className="hover:text-white/60 transition-colors">Terms</a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.04]">
          <p className="text-white/20 text-[11px]">
            © {new Date().getFullYear()} 7-SENSE Marine. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
