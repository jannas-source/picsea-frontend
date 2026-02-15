"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Search, FileText, Shield } from "lucide-react";
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
    <main className="min-h-screen relative overflow-hidden bg-[#000C18]">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'gridScroll 20s linear infinite'
        }} />
      </div>

      {/* Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00F0FF]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#002B45]/20 blur-[120px] rounded-full pointer-events-none" />

      <Navbar onAuthClick={() => setAuthModalOpen(true)} />

      {/* Hero Section - Mobile Optimized */}
      <section className="relative pt-24 pb-12 px-4 md:pt-32 md:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00F0FF]/5 border border-[#00F0FF]/20 text-xs font-bold text-[#00F0FF] mb-6 tracking-wider uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]"></span>
            </span>
            AI-Powered • 29,294 Marine Parts
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight text-white"
          >
            Photo to Part.
            <br />
            <span className="text-[#00F0FF]">Instant Match.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            AI-powered marine parts identification. Upload a photo, get the exact SKU, pricing, and stock status in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <a
              href="#upload"
              className="w-full sm:w-auto px-8 py-4 bg-[#00F0FF] text-[#000C18] font-bold rounded-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all text-center"
            >
              Upload Photo
            </a>
            <a
              href="#search"
              className="w-full sm:w-auto px-8 py-4 bg-[#002B45] border border-[#00F0FF]/30 text-white font-bold rounded-lg hover:bg-[#002B45]/70 transition-all text-center"
            >
              Try Live Demo
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Mobile First */}
      <section className="relative py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Camera,
                title: "Visual Recognition",
                desc: "Upload photos of installed components. AI identifies manufacturer, model, and specs instantly."
              },
              {
                icon: Search,
                title: "Smart Search",
                desc: "Search 29,294 marine parts from CWR Distribution with real-time pricing and availability."
              },
              {
                icon: FileText,
                title: "BOM Generation",
                desc: "Build bills of materials with one click. Export as CSV or PDF with dealer pricing."
              },
              {
                icon: Shield,
                title: "Cross-Reference",
                desc: "Prevent wrong orders. Our AI validates fitment and suggests alternatives."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-[#002B45]/40 border border-[#00F0FF]/10 rounded-xl hover:border-[#00F0FF]/30 transition-all"
              >
                <feature.icon className="w-10 h-10 text-[#00F0FF] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Upload Section */}
      <section id="upload" className="relative py-12 px-4 bg-[#002B45]/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Upload Part Photo
            </h2>
            <p className="text-white/60">
              Drop an image and we'll identify it from our 29K+ part catalog
            </p>
          </div>
          <PhotoUpload onPartsIdentified={handlePartsIdentified} />
        </div>
      </section>

      {/* Search Section */}
      <section id="search" className="relative py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Or Search by Name
            </h2>
            <p className="text-white/60">
              Live search across 29,294 marine parts from CWR Distribution
            </p>
          </div>
          <SearchDemo />
        </div>
      </section>

      <Footer />

      {/* BOM Manager (Floating) */}
      <BOMManager initialParts={bomParts} />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}
