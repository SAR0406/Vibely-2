'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, Wind, MapPin, Zap, Users, Play, Radio } from 'lucide-react';

export function WeatherWidget() {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/10 backdrop-blur-xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Cloud className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Local Vibe</p>
                        <h3 className="text-2xl font-bold">San Francisco</h3>
                    </div>
                    <Sun className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="mt-8 flex items-end justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">72°</span>
                        <span className="text-white/40 text-sm">Clear</span>
                    </div>
                    <div className="text-right text-[10px] text-white/40">
                        <p>H: 78° L: 64°</p>
                        <p>Humidity: 42%</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function LiveHuddleWidget() {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-3xl bg-gradient-to-r from-rose-500/20 to-purple-600/20 border border-rose-500/10 backdrop-blur-xl"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Live Now</span>
                </div>
                <Radio className="w-4 h-4 text-white/20" />
            </div>

            <div className="space-y-4">
                <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                        <img key={i} src={`https://i.pravatar.cc/100?u=${i + 10}`} className="w-10 h-10 rounded-full border-2 border-[#0a0a0c] object-cover" />
                    ))}
                    <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-[#0a0a0c] flex items-center justify-center text-[10px] text-white/40">
                        +12
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-sm">Tech Keynote Afterparty</h4>
                    <div className="flex items-center gap-2 text-[10px] text-white/40 mt-1">
                        <Users className="w-3 h-3" />
                        <span>Curated by Vibely Pro</span>
                    </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-white text-black text-xs font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                    <Play className="w-3 h-3 fill-black" />
                    Drop In
                </button>
            </div>
        </motion.div>
    );
}

export function MoodAnalyticsWidget() {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Pulse</p>
                    <h4 className="text-sm font-bold">Community Mood</h4>
                </div>
                <Zap className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 w-8 text-right">70%</span>
                    <span className="text-[10px] text-white/40 w-12">Hype</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 w-8 text-right">25%</span>
                    <span className="text-[10px] text-white/40 w-12">Chill</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '5%' }} className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                    </div>
                    <span className="text-[10px] font-bold text-rose-400 w-8 text-right">5%</span>
                    <span className="text-[10px] text-white/40 w-12">Moody</span>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                <p className="text-[10px] text-white/20 italic">Updated real-time by VibeAI</p>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Optimized</span>
                </div>
            </div>
        </motion.div>
    );
}
