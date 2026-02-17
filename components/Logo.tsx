import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = '', variant = 'full', size = 'md' }: LogoProps) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-sm', gap: 'gap-1.5' },
    md: { icon: 36, text: 'text-base', gap: 'gap-2' },
    lg: { icon: 48, text: 'text-xl', gap: 'gap-3' },
  };

  const s = sizeMap[size];

  if (variant === 'icon') {
    return (
      <div className={`relative ${className}`} style={{ width: s.icon, height: s.icon }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 16px rgba(0, 240, 255, 0.4), 0 0 32px rgba(0, 240, 255, 0.15)' }}
        />
        <Image
          src="/logo-primary-circle.jpg"
          alt="7-SENSE"
          width={s.icon}
          height={s.icon}
          className="rounded-full object-cover relative z-10"
          style={{ boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)' }}
          priority
        />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center ${s.gap} ${className}`}>
        <div
          className="relative flex-shrink-0"
          style={{ width: s.icon, height: s.icon }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: '0 0 12px rgba(0, 240, 255, 0.35)' }}
          />
          <Image
            src="/logo-primary-circle.jpg"
            alt="7-SENSE"
            width={s.icon}
            height={s.icon}
            className="rounded-full object-cover relative z-10"
            priority
          />
        </div>
        <span
          className={`font-black tracking-widest uppercase ${s.text}`}
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: '#FFFFFF',
            textShadow: '0 0 12px rgba(0, 240, 255, 0.3)',
          }}
        >
          7-SENSE
        </span>
      </div>
    );
  }

  // Full lockup — icon + wordmark + tagline
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className="relative"
        style={{ width: s.icon, height: s.icon }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)' }}
        />
        <Image
          src="/logo-primary-circle.jpg"
          alt="7-SENSE"
          width={s.icon}
          height={s.icon}
          className="rounded-full object-cover relative z-10"
          priority
        />
      </div>
      <div className="text-center">
        <div
          className={`font-black tracking-widest uppercase ${s.text}`}
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: '#FFFFFF',
            textShadow: '0 0 12px rgba(0, 240, 255, 0.3)',
          }}
        >
          7-SENSE
        </div>
        <div
          className="text-[10px] tracking-[0.25em] uppercase mt-0.5"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: 'rgba(0, 240, 255, 0.7)',
          }}
        >
          Sense. Navigate. Act.
        </div>
      </div>
    </div>
  );
};
