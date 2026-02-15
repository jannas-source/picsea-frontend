"use client";

import React from "react";
import { Ship, Mail, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative py-12 px-4 border-t border-bioluminescent-cyan/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-bioluminescent-cyan/10 border border-bioluminescent-cyan/30 flex items-center justify-center">
                <Ship className="w-6 h-6 text-bioluminescent-cyan" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-pure-white">PicSea</h1>
                <p className="text-xs text-bioluminescent-cyan/70">by 7-SENSE</p>
              </div>
            </div>
            <p className="text-pure-white/60 text-sm">
              AI-powered marine parts identification for the modern boating industry.
            </p>
          </div>

          <div>
            <h3 className="text-pure-white font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-pure-white/60 text-sm">
              <li><a href="#" className="hover:text-bioluminescent-cyan transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-bioluminescent-cyan transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-bioluminescent-cyan transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-bioluminescent-cyan transition-colors">Beta Program</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-pure-white font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-pure-white/60 text-sm">
              <li><a href="mailto:jannas@7sense.net" className="hover:text-bioluminescent-cyan transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" /> Contact
              </a></li>
              <li><a href="#" className="hover:text-bioluminescent-cyan transition-colors">About 7-SENSE</a></li>
              <li><a href="#" className="hover:text-bioluminescent-cyan transition-colors">Partners</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-bioluminescent-cyan/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-pure-white/40 text-sm">
            © 2026 7-SENSE Marine. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://api.picsea.app/health" className="text-pure-white/60 hover:text-bioluminescent-cyan transition-colors text-sm">
              API Status
            </a>
            <span className="text-pure-white/20">|</span>
            <span className="text-pure-white/60 text-sm flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
