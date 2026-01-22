'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Command, Search, Bell, Settings, LogOut, Terminal, Activity, TrendingUp, Award } from 'lucide-react';

export function CommandCenter() {
    const [isOpen, setIsOpen] = useState(false);

    // Toggle with Cmd/Ctrl + K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 shadow-2xl shadow-cyan-500/40 flex items-center justify-center group z-50 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="/nexus-core.png" alt="Nexus" className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#121216]/90 border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center gap-4">
                                <Search className="w-5 h-5 text-white/40" />
                                <input
                                    autoFocus
                                    placeholder="Search... (try 'VibeAI', 'Huddle', 'Themes')"
                                    className="flex-1 bg-transparent border-none text-white outline-none placeholder:text-white/20 text-lg"
                                />
                                <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 font-mono">
                                    ESC to close
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <h4 className="px-4 text-[10px] uppercase tracking-widest font-bold text-white/40">Quick Actions</h4>
                                    <ActionItem icon={Terminal} label="VibeAI Analytics" shortcut="A" color="text-indigo-400" />
                                    <ActionItem icon={Activity} label="Start Voice Huddle" shortcut="H" color="text-rose-400" />
                                    <ActionItem icon={TrendingUp} label="Boost My Recent Post" shortcut="B" color="text-emerald-400" />
                                </div>

                                <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/40">Vibely Pass</h4>
                                        <Award className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span>Level 14</span>
                                                <span className="text-white/40">840/1000 XP</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '84%' }}
                                                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-400/10 border border-cyan-400/20">
                                            <Zap className="w-4 h-4 text-cyan-400" />
                                            <span className="text-[10px] text-cyan-200/80 font-medium">Daily Streak: 12 Days 🔥</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center text-[10px] text-white/40 font-medium">
                                <div className="flex gap-4">
                                    <span>24 Connected</span>
                                    <span>Latency: 18ms</span>
                                </div>
                                <div className="flex gap-4">
                                    <a href="#" className="hover:text-white">Help</a>
                                    <a href="#" className="hover:text-white">Feedback</a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function ActionItem({ icon: Icon, label, shortcut, color }: any) {
    return (
        <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{label}</span>
            </div>
            <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/20 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                {shortcut}
            </div>
        </button>
    );
}
