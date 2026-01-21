'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, Wind, MapPin, Zap, Users, Play, Radio } from 'lucide-react';
import { cn } from "@/lib/utils";

export function WeatherWidget() {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-8 glass-card relative overflow-hidden group shadow-2xl shadow-blue-500/10"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Cloud className="w-32 h-32 animate-float" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em] mb-2">Nexus Node</p>
                        <h3 className="text-2xl font-bold tracking-tight">San Francisco</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shadow-lg shadow-yellow-400/5">
                        <Sun className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                </div>
                <div className="mt-12 flex items-end justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter">72°</span>
                        <span className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Clear Spark</span>
                    </div>
                    <div className="text-right text-[10px] text-zinc-600 font-mono">
                        <p>H: 78 • L: 64</p>
                        <p>HUM: 42%</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function LiveHuddleWidget() {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-8 glass-card border-rose-500/10 shadow-2xl shadow-rose-500/10 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute inset-0" />
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Live Pulse</span>
                </div>
                <Radio className="w-4 h-4 text-zinc-700 group-hover:text-rose-400 transition-colors" />
            </div>

            <div className="space-y-6">
                <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="relative group/avatar">
                            <img
                                src={`https://i.pravatar.cc/100?u=${i + 15}`}
                                className="w-12 h-12 rounded-2xl border-4 border-[#050505] object-cover hover:scale-110 transition-transform cursor-pointer relative z-10"
                            />
                            <div className="absolute inset-0 bg-rose-500/40 rounded-2xl blur-md scale-75 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                        </div>
                    ))}
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border-4 border-[#050505] flex items-center justify-center text-[10px] font-bold text-zinc-500 shadow-xl">
                        +12
                    </div>
                </div>

                <div>
                    <h4 className="font-black text-lg tracking-tight mb-1">Tech Keynote Afterparty</h4>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                        <Users className="w-3 h-3 text-rose-400" />
                        <span>Curated by Nexus Pro</span>
                    </div>
                </div>

                <button className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]">
                    <Play className="w-3 h-3 fill-black" />
                    Drop In Space
                </button>
            </div>
        </motion.div>
    );
}

export function MoodAnalyticsWidget() {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-8 glass-card border-indigo-500/10 shadow-2xl shadow-indigo-500/10 group"
        >
            <div className="flex justify-between items-start mb-10">
                <div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-2">Cognitive Sync</p>
                    <h4 className="text-xl font-bold tracking-tight">Community Mood</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Zap className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
            </div>

            <div className="space-y-6">
                {[
                    { label: 'Hype', val: '70%', color: 'bg-cyan-400', glow: 'shadow-cyan-400/40' },
                    { label: 'Chill', val: '25%', color: 'bg-indigo-500', glow: 'shadow-indigo-500/40' },
                    { label: 'Moody', val: '5%', color: 'bg-purple-600', glow: 'shadow-purple-600/40' }
                ].map((item, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{item.label}</span>
                            <span className="text-xs font-black text-white">{item.val}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: item.val }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                                className={cn("h-full rounded-full shadow-lg transition-all duration-1000", item.color, item.glow)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
                <p className="text-zinc-600">Updated by VibeAI</p>
                <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    <span>Synchronized</span>
                </div>
            </div>
        </motion.div>
    );
}
