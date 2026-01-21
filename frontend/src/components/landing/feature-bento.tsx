'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Globe, Cpu, Layers, Command } from 'lucide-react';

export function FeatureBento() {
    return (
        <section id="features" className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                        Engineered for the Elite.
                    </h2>
                    <p className="text-zinc-500 max-w-xl mx-auto">
                        A proprietary suite of social instruments designed to accelerate your reach and impact.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-4 h-auto md:h-[600px]">
                    {/* Bento Item 1: VibeAI (Large) */}
                    <div className="md:col-span-3 md:row-span-2 group relative rounded-[2rem] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-10 overflow-hidden hover:border-cyan-500/20 transition-colors duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity duration-1000 group-hover:scale-110">
                            <Cpu className="w-32 h-32 text-cyan-400" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20">
                                    <Globe className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Nexus VibeAI v4.2</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                                    Our proprietary neural engine analyzes digital resonance to connect you with high-affinity tribes automatically.
                                </p>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 flex gap-4 text-[10px] items-center text-zinc-500 font-mono tracking-widest uppercase">
                                <span>Neural Discovery</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                <span>Auto-Sync</span>
                            </div>
                        </div>
                    </div>

                    {/* Bento Item 2: Spatial Huddles */}
                    <div className="md:col-span-3 md:row-span-1 group relative rounded-[2rem] border border-white/5 bg-[#0a0a0c] p-10 overflow-hidden hover:border-purple-500/20 transition-colors duration-500">
                        <div className="relative z-10 flex gap-10 items-center">
                            <div className="flex-1">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                                    <Layers className="w-5 h-5 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Spatial Huddles</h3>
                                <p className="text-zinc-500 text-xs leading-relaxed">
                                    Lossless audio spaces with spatial positioning. Feel the presence.
                                </p>
                            </div>
                            <div className="hidden lg:flex gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="participant" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bento Item 3: Global Scale */}
                    <div className="md:col-span-1.5 md:row-span-1 group relative rounded-[2rem] border border-white/5 bg-zinc-900/40 p-10 overflow-hidden hover:border-indigo-500/20 transition-colors duration-500">
                        <h4 className="text-sm font-bold mb-2">Global Edge</h4>
                        <div className="text-3xl font-mono font-bold text-indigo-400">18ms</div>
                        <p className="text-[10px] text-zinc-500 mt-2">Zero-latency architecture.</p>
                    </div>

                    {/* Bento Item 4: Encryption */}
                    <div className="md:col-span-1.5 md:row-span-1 group relative rounded-[2rem] border border-white/5 bg-zinc-900/40 p-10 overflow-hidden hover:border-emerald-500/20 transition-colors duration-500">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                            <Shield className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h4 className="text-sm font-bold mb-1">E2E Secure</h4>
                        <p className="text-[10px] text-zinc-500 leading-tight">Total privacy for all Nexus Passholders.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
