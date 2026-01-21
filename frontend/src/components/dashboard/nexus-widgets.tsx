'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, Wind, MapPin, Zap, Users, Play, Radio } from 'lucide-react';
import { cn } from "@/lib/utils";

export function WeatherWidget() {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            className="h-full p-8 glass-card relative overflow-hidden group shadow-2xl shadow-blue-500/5 nexus-pulse"
        >
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <Cloud className="w-48 h-48 animate-float" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full space-y-12">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_var(--color-cyan-400)]" />
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">Atmospheric Telemetry</p>
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">San Francisco</h3>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all duration-500">
                        <Sun className="w-5 h-5 text-zinc-600 group-hover:text-cyan-400 animate-pulse" />
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black tracking-tighter text-white">72<span className="text-cyan-400/50">°</span></span>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Status</span>
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest leading-none">Optimal</span>
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="blockchain-hash">Node: SFO-94105</p>
                        <p className="blockchain-hash">RES: +4.2GHZ</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function LiveHuddleWidget() {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            className="h-full p-8 glass-card border-rose-500/5 shadow-2xl shadow-rose-500/5 relative overflow-hidden group"
        >
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />

            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute inset-0" />
                        <div className="w-2 h-2 rounded-full bg-rose-500 relative" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 px-2 py-0.5 bg-rose-500/10 rounded-full">Sync Pulse</span>
                </div>
                <Radio className="w-4 h-4 text-zinc-700 group-hover:text-rose-400 transition-colors" />
            </div>

            <div className="space-y-8">
                <div className="flex -space-x-4 items-center">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="relative group/avatar">
                            <img
                                src={`https://i.pravatar.cc/100?u=${i + 15}`}
                                className="w-12 h-12 rounded-[1.25rem] border-4 border-[#050505] object-cover hover:scale-110 transition-transform cursor-pointer relative z-10"
                            />
                            <div className="absolute inset-0 bg-rose-500/20 rounded-2xl blur-md scale-75 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                        </div>
                    ))}
                    <div className="w-12 h-12 rounded-[1.25rem] bg-white/5 border-4 border-[#050505] flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                        +42
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-black text-white text-xl tracking-tighter uppercase italic leading-tight group-hover:text-rose-400 transition-colors">Quantum Dev Meet</h4>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">
                            <Users className="w-3.5 h-3.5 text-rose-500/50" />
                            <span>Cluster 04</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest">Active</span>
                    </div>
                </div>

                <button className="w-full h-12 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-500/5 active:scale-[0.98]">
                    <Play className="w-3 h-3 fill-black animate-pulse" />
                    Interface
                </button>
            </div>
        </motion.div>
    );
}

export function MoodAnalyticsWidget() {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            className="p-8 glass-card border-indigo-500/5 shadow-2xl shadow-indigo-500/5 group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity group-hover:rotate-12 duration-1000">
                <Zap className="w-48 h-48 text-indigo-500" />
            </div>

            <div className="flex justify-between items-start mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-1 rounded-full bg-indigo-500" />
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Neural Resonance</p>
                    </div>
                    <h4 className="text-xl font-black text-white tracking-tighter uppercase italic">Global Vibe</h4>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all duration-700">
                    <Zap className="w-5 h-5 text-indigo-400 transition-transform group-hover:scale-110" />
                </div>
            </div>

            <div className="space-y-8 relative z-10">
                {[
                    { label: 'Hype', val: '70%', color: 'bg-white', glow: 'shadow-white/20' },
                    { label: 'Flow', val: '25%', color: 'bg-indigo-400', glow: 'shadow-indigo-400/20' },
                    { label: 'Void', val: '5%', color: 'bg-zinc-800', glow: 'shadow-zinc-800/20' }
                ].map((item, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">{item.label}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xs font-black text-white tracking-tighter">{item.val}</span>
                                <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">Cap</span>
                            </div>
                        </div>
                        <div className="h-1.5 bg-white/[0.02] rounded-full overflow-hidden p-[1px]">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: item.val }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                className={cn("h-full rounded-full shadow-lg transition-all duration-1000", item.color, item.glow)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center">
                <p className="blockchain-hash">Last Sync: 0.002s</p>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">Synchronized</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_var(--color-emerald-500)]" />
                </div>
            </div>
        </motion.div>
    );
}
