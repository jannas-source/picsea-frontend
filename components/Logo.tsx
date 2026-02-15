import React from 'react';

export const Logo = ({ className = "h-8", variant = "full" }: { className?: string, variant?: "full" | "icon" }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Icon Part - Stylized 7 Concept */}
            <svg viewBox="0 0 100 100" className="h-full w-auto aspect-square fill-current text-star-white">
                {/* Simple geometric 7 shape: Top bar and diagonal down */}
                <path d="M20 20 H80 L50 90 L40 90 L65 30 H20 V20 Z" />
                {/* This is a placeholder geometric 7. The actual path should be traced if complex. */}
            </svg>

            {/* Wordmark Part */}
            {variant === "full" && (
                <span className="font-bold tracking-widest uppercase text-star-white text-xl font-sans">
                    7Sense
                </span>
            )}
        </div>
    );
};
