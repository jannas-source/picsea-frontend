"use client";

import React from "react";
import { Ship, Mail, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative py-12 px-4 border-t border-bioluminescent-cyan/10 bg-deep-abyss-blue">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-bioluminescent-cyan/10 border border-bioluminescent-cyan/30 flex items-center justify-center">
                <Ship className="w-5 h-5 text-bioluminescent-cyan" />
              </div>
              <h3 className="text-xl font-bold text-pure-white">PicSea</h3>
            </div>
            <p className="text-pure-white/50 text-sm leading-relaxed mb-4">
              Visual recognition technology for marine parts identification.
              <br />
              Part of the 7-SENSE Marine Intelligence Platform.
            </p>
            <a
              href="https://7sense.net"
              className="inline-flex items-center gap-2 text-bioluminescent-cyan hover:text-bioluminescent-cyan/80 transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              Visit 7-SENSE
            </a>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-pure-white font-bold mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="text-pure-white/50 hover:text-pure-white transition-colors text-sm">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#upload" className="text-pure-white/50 hover:text-pure-white transition-colors text-sm">
                  Try It
                </a>
              </li>
              <li>
                <a href="#search" className="text-pure-white/50 hover:text-pure-white transition-colors text-sm">
                  Search
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-pure-white font-bold mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://7sense.net" className="text-pure-white/50 hover:text-pure-white transition-colors text-sm">
                  About 7-SENSE
                </a>
              </li>
              <li>
                <a href="mailto:jannas@7sense.net" className="text-pure-white/50 hover:text-pure-white transition-colors text-sm flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-bioluminescent-cyan/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-pure-white/40 text-xs">
            © {new Date().getFullYear()} 7-SENSE Marine. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <a href="https://7sense.net" className="text-pure-white/40 hover:text-pure-white transition-colors">
              Privacy
            </a>
            <a href="https://7sense.net" className="text-pure-white/40 hover:text-pure-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
