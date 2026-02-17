"use client";

import React from "react";
import Image from "next/image";

export function Footer() {
  return (
    <footer
      className="relative py-10 px-6 overflow-hidden"
      style={{
        borderTop: '1px solid rgba(0, 240, 255, 0.08)',
        background: 'linear-gradient(0deg, #000C18 0%, rgba(0, 12, 24, 0.5) 100%)',
      }}
    >
      {/* Subtle sonar grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Glow accent at top edge */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent)' }}
      />

      <div className="relative max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">

          {/* Brand left */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="relative w-7 h-7">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)' }}
                />
                <Image
                  src="/logo-primary-circle.jpg"
                  alt="7-SENSE"
                  width={28}
                  height={28}
                  className="rounded-full object-cover relative z-10"
                />
              </div>
              <div>
                <span
                  className="text-xs font-black tracking-widest uppercase text-white block"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  PicSea
                </span>
                <span
                  className="text-[9px] tracking-[0.2em] uppercase"
                  style={{ color: 'rgba(0, 240, 255, 0.5)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  by 7-SENSE
                </span>
              </div>
            </div>

            {/* Tagline */}
            <p
              className="text-[11px] tracking-[0.25em] uppercase mb-1"
              style={{ color: 'rgba(0, 240, 255, 0.6)', fontFamily: 'Montserrat, sans-serif' }}
            >
              Sense. Navigate. Act.
            </p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Marine Procurement Intelligence Platform
            </p>
          </div>

          {/* Links right */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="flex items-center gap-5">
              {[
                { label: 'About', href: 'https://7sense.net' },
                { label: 'Privacy', href: 'https://7sense.net' },
                { label: 'Terms', href: 'https://7sense.net' },
              ].map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = 'rgba(0, 240, 255, 0.7)')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.25)')}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-4 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <a
                href="mailto:jannas@7sense.net"
                className="transition-colors duration-200"
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'rgba(0, 240, 255, 0.6)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.2)')}
              >
                jannas@7sense.net
              </a>
              <span>·</span>
              <a
                href="tel:+19492399124"
                className="transition-colors duration-200"
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'rgba(0, 240, 255, 0.6)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.2)')}
              >
                (949) 239-9124
              </a>
            </div>
          </div>
        </div>

        <div
          className="mt-8 pt-5 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            © {new Date().getFullYear()} 7-SENSE Marine LLC. All rights reserved.
          </p>
          <p
            className="text-[9px] tracking-[0.2em] uppercase"
            style={{ color: 'rgba(0, 240, 255, 0.2)', fontFamily: 'Montserrat, sans-serif' }}
          >
            7-SENSE
          </p>
        </div>
      </div>
    </footer>
  );
}
