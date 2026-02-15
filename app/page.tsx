"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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

      {/* Hero - Opal Style */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              A new way to identify
              <br />
              marine parts.
            </h1>
            
            <p className="text-xl text-white/50 mb-8 font-light">
              Sense. Navigate. Act.
            </p>

            <p className="text-lg text-white/40 mb-12 max-w-2xl mx-auto">
              Upload a photo. Get the exact part, pricing, and stock status in seconds.
            </p>

            <div className="flex gap-4 justify-center">
              <a
                href="#upload"
                className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all inline-flex items-center gap-2"
              >
                Try It Now
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="py-24 px-6 bg-[#002B45]/20">
        <div className="max-w-4xl mx-auto">
          <PhotoUpload onPartsIdentified={handlePartsIdentified} />
        </div>
      </section>

      {/* OR Divider */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-[#000C18] text-white/40 text-sm">OR SEARCH BY NAME</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <section id="search" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <SearchDemo />
        </div>
      </section>

      {/* Specs - Clean Two Column */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider mb-6">
                What's Inside
              </h3>
              <ul className="space-y-4 text-white/60">
                <li>Visual recognition</li>
                <li>Real-time pricing</li>
                <li>Stock availability</li>
                <li>BOM generation</li>
                <li>CSV & PDF export</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider mb-6">
                Technical
              </h3>
              <div className="space-y-4 text-white/60">
                <div className="flex justify-between">
                  <span>Catalog</span>
                  <span className="text-white">29,294 parts</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed</span>
                  <span className="text-white">&lt;5 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>File size</span>
                  <span className="text-white">Max 10MB</span>
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
