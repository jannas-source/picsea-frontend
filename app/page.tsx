"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchDemo } from "@/components/SearchDemo";
import { PhotoUpload } from "@/components/PhotoUpload";
import { BOMManager } from "@/components/BOMManager";
import { AuthModal } from "@/components/AuthModal";

export default function Home() {
  const [bomParts, setBomParts] = useState<any[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handlePartsIdentified = (parts: any[]) => {
    setBomParts(current => [...current, ...parts]);
  };

  const handleAuthSuccess = (user: any) => {
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <main className="min-h-screen bg-[#000C18]">
      <Navbar onAuthClick={() => setAuthModalOpen(true)} />

      {/* Hero */}
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            A new way to identify
            <br />
            marine parts.
          </h1>
          
          <p className="text-lg sm:text-xl text-white/40 mb-4 font-light">
            Sense. Navigate. Act.
          </p>

          <p className="text-base text-white/25 mb-10 max-w-xl mx-auto">
            Upload a photo. Get the exact part, pricing, and stock status in seconds.
          </p>

          <a
            href="#upload"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#000C18] font-semibold rounded-xl hover:bg-white/90 transition-all text-sm"
          >
            Try It Now
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="py-16 sm:py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <PhotoUpload onPartsIdentified={handlePartsIdentified} />
        </div>
      </section>

      {/* OR Divider */}
      <div className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#000C18] text-white/25 text-xs uppercase tracking-widest">
                or search by name
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <section id="search" className="py-12 sm:py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <SearchDemo />
        </div>
      </section>

      {/* Specs */}
      <section className="py-20 sm:py-28 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 sm:gap-20">
            <div>
              <h3 className="text-[11px] font-semibold text-[#00F0FF]/70 uppercase tracking-[0.2em] mb-6">
                Capabilities
              </h3>
              <ul className="space-y-3.5 text-white/40 text-sm">
                <li>Visual recognition</li>
                <li>Real-time pricing</li>
                <li>Stock availability</li>
                <li>BOM generation</li>
                <li>CSV & PDF export</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold text-[#00F0FF]/70 uppercase tracking-[0.2em] mb-6">
                Technical
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-white/40">
                  <span>Catalog</span>
                  <span className="text-white/70 font-medium">29,294 parts</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>Speed</span>
                  <span className="text-white/70 font-medium">&lt;5 seconds</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>File size</span>
                  <span className="text-white/70 font-medium">Max 10MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <BOMManager initialParts={bomParts} />

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}
