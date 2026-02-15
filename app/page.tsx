"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Search, FileText, Anchor } from "lucide-react";
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

  // Particle animation
  const [particles, setParticles] = useState<Array<{x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#000C18]">
      {/* Particle Network Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00F0FF] rounded-full opacity-30"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Bioluminescent Glow Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00F0FF]/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#00F0FF]/3 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Subtle Grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '100px 100px'
      }} />

      <Navbar onAuthClick={() => setAuthModalOpen(true)} />

      {/* Hero Section - Premium Deep-Sea Tech */}
      <section className="relative pt-32 pb-20 px-4 md:pt-48 md:pb-32">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          {/* Glowing Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/5 backdrop-blur-sm mb-8"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]"></span>
            </div>
            <span className="text-[#00F0FF] font-bold text-sm tracking-wider uppercase">
              Marine Intelligence Platform
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]"
            style={{
              background: 'linear-gradient(to bottom, #FFFFFF, #00F0FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Photo to Part.
            <br />
            Instant Match.
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 mb-4 max-w-3xl mx-auto font-light tracking-wide"
          >
            Sense. Navigate. Act.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-lg text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Visual recognition technology for marine parts. Upload a photo, get exact SKU, pricing, and stock status in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="#upload"
              className="group w-full sm:w-auto px-10 py-5 bg-[#00F0FF] text-[#000C18] font-bold rounded-lg hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] transition-all text-lg relative overflow-hidden"
            >
              <span className="relative z-10">Upload Photo</span>
              <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform" />
            </a>
            <a
              href="#search"
              className="w-full sm:w-auto px-10 py-5 border-2 border-[#00F0FF]/30 text-[#00F0FF] font-bold rounded-lg hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50 transition-all text-lg backdrop-blur-sm"
            >
              Live Demo
            </a>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 opacity-20">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#00F0FF" strokeWidth="1" opacity="0.3"/>
              <circle cx="50" cy="50" r="30" fill="none" stroke="#00F0FF" strokeWidth="1" opacity="0.2"/>
              <circle cx="50" cy="50" r="20" fill="none" stroke="#00F0FF" strokeWidth="1" opacity="0.1"/>
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Features - Minimal Cards */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Camera,
                title: "Visual Recognition",
                desc: "Upload photos of installed components. Instant manufacturer and model identification."
              },
              {
                icon: Search,
                title: "Smart Search",
                desc: "Search thousands of marine parts with real-time pricing and availability."
              },
              {
                icon: FileText,
                title: "BOM Generation",
                desc: "Build bills of materials instantly. Export as CSV or PDF with dealer pricing."
              },
              {
                icon: Anchor,
                title: "Cross-Reference",
                desc: "Prevent wrong orders. Validate fitment and suggest alternatives."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl border border-[#00F0FF]/10 bg-[#000C18]/50 backdrop-blur-sm hover:border-[#00F0FF]/30 hover:bg-[#002B45]/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <feature.icon className="w-12 h-12 text-[#00F0FF] mb-6 relative z-10" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed relative z-10">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Upload Section */}
      <section id="upload" className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                background: 'linear-gradient(to bottom, #FFFFFF, #00F0FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Upload Part Photo
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white/50 text-lg"
            >
              Drop an image and we'll identify it from our marine parts catalog
            </motion.p>
          </div>
          <PhotoUpload onPartsIdentified={handlePartsIdentified} />
        </div>
      </section>

      {/* Search Section */}
      <section id="search" className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                background: 'linear-gradient(to bottom, #FFFFFF, #00F0FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Or Search by Name
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white/50 text-lg"
            >
              Live search across thousands of marine parts
            </motion.p>
          </div>
          <SearchDemo />
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
