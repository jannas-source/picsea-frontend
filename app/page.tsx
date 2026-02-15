"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Ship, Zap, Database, ArrowRight, CheckCircle2, Camera } from "lucide-react";
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
    // Trigger re-render of Navbar by forcing a storage event
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <main className="min-h-screen relative overflow-hidden selection:bg-bioluminescent-cyan/30">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" />

      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-bioluminescent-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-oceanic-navy/20 blur-[120px] rounded-full pointer-events-none" />

      <Navbar onAuthClick={() => setAuthModalOpen(true)} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bioluminescent-cyan/5 border border-bioluminescent-cyan/20 text-xs font-bold text-bioluminescent-cyan mb-8 tracking-widest uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bioluminescent-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-bioluminescent-cyan"></span>
            </span>
            Powered by AI • 29,294 Marine Parts
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-pure-white font-display"
          >
            Photo to Part.<br />
            <span className="text-bioluminescent-cyan/90 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">Instant Match.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-pure-white/70 max-w-2xl mx-auto mb-12 font-body leading-relaxed"
          >
            AI-powered marine parts identification. Upload a photo, get the exact SKU, pricing, and stock status in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <button className="group px-8 py-4 bg-bioluminescent-cyan text-deep-abyss-blue font-bold rounded-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Upload Photo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-oceanic-navy/50 border border-bioluminescent-cyan/30 text-pure-white font-bold rounded-lg hover:bg-oceanic-navy/70 transition-all duration-300">
              Try Live Demo
            </button>
          </motion.div>

          {/* Photo Upload */}
          <PhotoUpload onPartsIdentified={handlePartsIdentified} />

          {/* Divider */}
          <div className="relative my-16">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bioluminescent-cyan/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-deep-abyss-blue text-pure-white/40">OR SEARCH BY NAME</span>
            </div>
          </div>

          {/* Live Search Demo */}
          <SearchDemo />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Camera className="w-8 h-8" />,
                title: "Visual Recognition",
                description: "Upload photos of installed components. AI identifies manufacturer, model, and specs instantly."
              },
              {
                icon: <Database className="w-8 h-8" />,
                title: "29,294 Parts Catalog",
                description: "Complete CWR Distribution inventory with real-time pricing, stock status, and availability."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant Quotes",
                description: "From photo to quote in 60 seconds. No manual lookup. No ordering errors. Just results."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-xl bg-oceanic-navy/30 border border-bioluminescent-cyan/10 hover:border-bioluminescent-cyan/30 transition-all duration-300"
              >
                <div className="text-bioluminescent-cyan mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-pure-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-pure-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-pure-white"
          >
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload Photo", desc: "Take a picture of any marine component" },
              { step: "2", title: "AI Match", desc: "Visual recognition finds exact part in catalog" },
              { step: "3", title: "Get Quote", desc: "Instant pricing, stock status, and ordering" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-bioluminescent-cyan/10 border border-bioluminescent-cyan/30 flex items-center justify-center text-2xl font-bold text-bioluminescent-cyan mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-pure-white mb-2">{item.title}</h3>
                <p className="text-pure-white/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-br from-oceanic-navy/50 to-bioluminescent-cyan/5 border border-bioluminescent-cyan/20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-pure-white mb-6"
          >
            Ready for your dealers?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-pure-white/70 mb-8 max-w-2xl mx-auto"
          >
            Beta launching February 2026. Join the pilot program with CWR Distribution dealers.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="px-8 py-4 bg-bioluminescent-cyan text-deep-abyss-blue font-bold rounded-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 inline-flex items-center gap-2"
          >
            Request Beta Access
            <ArrowRight className="w-5 h-5" />
          </motion.button>
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
