import Image from "next/image";

export default function BrandPage() {
    return (
        <div className="min-h-screen p-8 md:p-16 grid-bg">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Header */}
                <section className="space-y-4">
                    <h1 className="text-6xl font-bold uppercase tracking-wider">Brand / Kit</h1>
                    <p className="text-xl text-falcon-grey max-w-2xl">
                        Technical Design System v2.0 // "Mission Control"
                        <br />
                        Strict adherence to the SpaceX-inspired aesthetic: High contrast, Void Black, and functional typography.
                    </p>
                </section>

                {/* Logos */}
                <section className="space-y-8">
                    <div className="flex items-end justify-between border-b border-launch-smoke pb-4">
                        <h2 className="text-2xl font-semibold uppercase tracking-wide">01 // Identity</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="hud-card p-12 flex flex-col items-center justify-center space-y-8 min-h-[300px]">
                            <div className="relative w-64 h-24">
                                {/* Raster Asset */}
                                <img src="/assets/brand/logo-full.png" alt="7Sense Full Logo (Raster)" className="object-contain w-full h-full" />
                            </div>
                            <span className="text-falcon-grey font-mono text-sm">Legacy Raster (logo-full.png)</span>
                        </div>

                        <div className="hud-card p-12 flex flex-col items-center justify-center space-y-8 min-h-[300px]">
                            <div className="relative w-64 h-24">
                                {/* AI High Res Asset */}
                                <img src="/assets/brand/logo-high-res-gen.png" alt="7Sense High Res AI" className="object-contain w-full h-full" />
                            </div>
                            <span className="text-falcon-grey font-mono text-sm">AI Generated High-Res (Concept)</span>
                        </div>

                        <div className="hud-card p-12 flex flex-col items-center justify-center space-y-8 min-h-[300px]">
                            <div className="h-16">
                                {/* Vector Component */}
                                <div className="flex items-center gap-3">
                                    <svg viewBox="0 0 100 100" className="h-16 w-16 fill-current text-star-white">
                                        <path d="M20 20 H80 L55 85 L45 85 L65 30 H20 V20 Z" />
                                    </svg>
                                    <span className="font-bold tracking-widest uppercase text-star-white text-3xl font-sans">
                                        7Sense
                                    </span>
                                </div>
                            </div>
                            <span className="text-falcon-grey font-mono text-sm">High-Res Vector Concept (CSS/SVG)</span>
                        </div>
                    </div>
                </section>

                {/* Color Palette */}
                <section className="space-y-8">
                    <div className="flex items-end justify-between border-b border-launch-smoke pb-4">
                        <h2 className="text-2xl font-semibold uppercase tracking-wide">02 // Chromatic Data</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ColorSwatch name="Void Black" hex="#050505" variable="bg-void-black" />
                        <ColorSwatch name="Launch Smoke" hex="#333333" variable="bg-launch-smoke" />
                        <ColorSwatch name="Falcon Grey" hex="#CCCDCF" variable="bg-falcon-grey text-void-black" />
                        <ColorSwatch name="Star White" hex="#FFFFFF" variable="bg-star-white text-void-black" />

                        <ColorSwatch name="Orbital Blue" hex="#005288" variable="bg-orbital-blue" />
                        <ColorSwatch name="Alert Amber" hex="#FFB100" variable="bg-alert-amber text-void-black" />
                        <ColorSwatch name="Status Green" hex="#00FF41" variable="bg-status-green text-void-black" />
                    </div>
                </section>

                {/* Typography */}
                <section className="space-y-8">
                    <div className="flex items-end justify-between border-b border-launch-smoke pb-4">
                        <h2 className="text-2xl font-semibold uppercase tracking-wide">03 // Typography</h2>
                    </div>
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold uppercase tracking-wide">Heading 1</h1>
                                <p className="text-falcon-grey font-mono text-xs">Bold / Uppercase / Wide</p>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold uppercase tracking-wide">Heading 2</h2>
                                <p className="text-falcon-grey font-mono text-xs">SemiBold / Uppercase / Wide</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-medium tracking-normal">Heading 3</h3>
                                <p className="text-falcon-grey font-mono text-xs">Medium / Normal</p>
                            </div>
                        </div>

                        <div className="max-w-2xl space-y-4">
                            <p className="text-base text-star-white leading-relaxed">
                                <span className="text-falcon-grey font-mono text-xs block mb-2">BODY COPY</span>
                                The 7Sense platform is designed for mission-critical marine operations. Our interface prioritizes data legibility, high contrast, and rapid information processing. The "Window" design philosophy treats the UI as a Heads-Up Display (HUD) overlaid on the physical reality of the ocean vessel.
                            </p>
                            <p className="text-sm font-mono text-falcon-grey">
                                SYSTEM_STATUS: NOMINAL // FONT_FAMILY: INTER // TRACKING: WIDE
                            </p>
                        </div>
                    </div>
                </section>

                {/* UI Elements */}
                <section className="space-y-8">
                    <div className="flex items-end justify-between border-b border-launch-smoke pb-4">
                        <h2 className="text-2xl font-semibold uppercase tracking-wide">04 // Interface Components</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Buttons */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-mono text-falcon-grey uppercase">Control Inputs</h3>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-star-white text-void-black px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-falcon-grey transition-colors">
                                    Primary Action
                                </button>
                                <button className="bg-orbital-blue text-star-white px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all">
                                    Orbital Launch
                                </button>
                                <button className="bg-transparent border border-star-white text-star-white px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-star-white hover:text-void-black transition-colors">
                                    Secondary
                                </button>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-mono text-falcon-grey uppercase">Data Containers</h3>
                            <div className="hud-card p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold uppercase tracking-wide text-falcon-grey">Vessel Health</h4>
                                        <div className="text-3xl font-bold">98.4%</div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-status-green shadow-[0_0_8px_rgba(0,255,65,0.8)]"></div>
                                </div>
                                <div className="h-1 w-full bg-launch-smoke rounded-full overflow-hidden">
                                    <div className="h-full bg-status-green w-full animate-pulse-slow"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

function ColorSwatch({ name, hex, variable }: { name: string; hex: string; variable: string }) {
    return (
        <div className="space-y-3">
            <div className={`h-24 w-full rounded-sm border border-white/10 ${variable}`}></div>
            <div>
                <div className="font-bold uppercase tracking-wide text-sm">{name}</div>
                <div className="font-mono text-xs text-falcon-grey">{hex}</div>
                <div className="font-mono text-[10px] text-launch-smoke mt-1 opacity-50">{variable}</div>
            </div>
        </div>
    );
}
