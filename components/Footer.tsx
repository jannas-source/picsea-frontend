"use client";

import React from "react";
import { Ship } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ship className="w-5 h-5 text-[#00F0FF]" />
              <span className="text-lg font-bold text-white">PicSea</span>
            </div>
            <p className="text-white/40 text-sm max-w-sm">
              Part of the 7-SENSE Marine Intelligence Platform.
            </p>
          </div>

          {/* Right */}
          <div className="flex gap-12 text-sm">
            <div>
              <a href="https://7sense.net" className="text-white/40 hover:text-white transition-colors block mb-2">
                About
              </a>
              <a href="mailto:jannas@7sense.net" className="text-white/40 hover:text-white transition-colors block">
                Contact
              </a>
            </div>
            <div>
              <a href="https://7sense.net" className="text-white/40 hover:text-white transition-colors block mb-2">
                Privacy
              </a>
              <a href="https://7sense.net" className="text-white/40 hover:text-white transition-colors block">
                Terms
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} 7-SENSE Marine. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
