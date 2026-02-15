"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Search, FileText, Anchor, CheckCircle2, ArrowRight } from "lucide-react";
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
    <main className="min-h-screen relative overflow-hidden bg-deep-abyss-blue selection:bg-bioluminescent-cyan/30">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '100px 100px'
      }} />
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-bioluminescent-cyan/3 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-oceanic-navy/10 blur-[150px] rounded-full pointer-events-none" />

      <Navbar onAuthClick={() => setAuthModalOpen(true)} />

      {/* Hero Section - Opal Style */}
      <section className="relative pt-32 pb-16 px-4 md:pt-40 md:pb-24">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-bioluminescent-cyan/20 bg-bioluminescent-cyan/5 backdrop-blur-sm mb-6"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bioluminescent-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-bioluminescent-cyan"></span>
            </div>
            <span className="text-bioluminescent-cyan font-semibold text-sm tracking-wide">
              Marine Parts Intelligence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-pure-white leading-tight"
          >
            A new way to identify
            <br />
            marine parts.
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-pure-white/60 mb-3 font-light"
          >
            Sense. Navigate. Act.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-lg text-pure-white/50 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Visual recognition technology for the modern boating industry. Upload a photo, get exact SKU, pricing, and stock status in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16"
          >
            <a
              href="#upload"
              className="w-full sm:w-auto px-8 py-4 bg-pure-white text-deep-abyss-blue font-bold rounded-lg hover:bg-pure-white/90 transition-all flex items-center justify-center gap-2 group"
            >
              Upload Photo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 border border-bioluminescent-cyan/30 text-bioluminescent-cyan font-bold rounded-lg hover:bg-bioluminescent-cyan/5 transition-all"
            >
              See How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Opal Style Grid */}
      <section id="how-it-works" className="py-16 px-4 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Camera,
                title: "Upload Photo",
                desc: "Snap a picture of any marine component, installed or packaged."
              },
              {
                icon: Search,
                title: "Instant Match",
                desc: "Our system identifies manufacturer, model number, and specifications."
              },
              {
                icon: FileText,
                title: "Build BOM",
                desc: "Generate bills of materials with one click. Export as CSV or PDF."
              },
              {
                icon: Anchor,
                title: "Order Parts",
                desc: "Get real-time pricing and stock availability from trusted suppliers."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-bioluminescent-cyan/10 bg-oceanic-navy/20 backdrop-blur-sm hover:border-bioluminescent-cyan/30 transition-all group"
              >
                <step.icon className="w-8 h-8 text-bioluminescent-cyan mb-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-pure-white mb-2">{step.title}</h3>
                <p className="text-pure-white/50 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section - Clean */}
      <section id="upload" className="py-16 px-4 md:py-24 bg-oceanic-navy/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-pure-white mb-4">
              Try it yourself
            </h2>
            <p className="text-pure-white/50 text-lg">
              Upload a photo and see the magic happen
            </p>
          </div>
          <PhotoUpload onPartsIdentified={handlePartsIdentified} />
        </div>
      </section>

      {/* Search Alternative */}
      <section id="search" className="py-16 px-4 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-pure-white mb-4">
              Or search by name
            </h2>
            <p className="text-pure-white/50 text-lg">
              Live search across thousands of marine parts
            </p>
          </div>
          <SearchDemo />
        </div>
      </section>

      {/* What's Inside - Opal Style */}
      <section className="py-16 px-4 md:py-24 bg-oceanic-navy/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-pure-white mb-4">
              What you get
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Visual Recognition",
                items: ["Photo upload", "Instant identification", "Manufacturer detection", "Model number extraction"]
              },
              {
                title: "Smart Search",
                items: ["Real-time pricing", "Stock availability", "Multiple suppliers", "Cross-reference engine"]
              },
              {
                title: "Export Tools",
                items: ["CSV export", "PDF generation", "Dealer pricing", "BOM management"]
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-xl border border-bioluminescent-cyan/10 bg-deep-abyss-blue/50 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold text-pure-white mb-6">{feature.title}</h3>
                <ul className="space-y-3">
                  {feature.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-pure-white/60">
                      <CheckCircle2 className="w-5 h-5 text-bioluminescent-cyan flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specs - Opal Style */}
      <section className="py-16 px-4 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-pure-white mb-4">
              Built for professionals
            </h2>
            <p className="text-pure-white/50 text-lg max-w-2xl mx-auto">
              Designed for marine technicians, yacht service providers, and boat owners who demand precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-xl border border-bioluminescent-cyan/10 bg-oceanic-navy/20">
              <h3 className="text-sm font-bold text-bioluminescent-cyan uppercase tracking-wider mb-4">
                Catalog Coverage
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-pure-white/60">Marine Parts</span>
                  <span className="text-2xl font-bold text-pure-white">29,294</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-pure-white/60">Manufacturers</span>
                  <span className="text-2xl font-bold text-pure-white">100+</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-pure-white/60">Categories</span>
                  <span className="text-2xl font-bold text-pure-white">723</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-xl border border-bioluminescent-cyan/10 bg-oceanic-navy/20">
              <h3 className="text-sm font-bold text-bioluminescent-cyan uppercase tracking-wider mb-4">
                Recognition Speed
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-pure-white/60">Photo Analysis</span>
                  <span className="text-2xl font-bold text-pure-white">2-5s</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-pure-white/60">Search Results</span>
                  <span className="text-2xl font-bold text-pure-white">&lt;200ms</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-pure-white/60">BOM Export</span>
                  <span className="text-2xl font-bold text-pure-white">Instant</span>
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
