'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Users, Music2, Sparkles, MessageSquare } from 'lucide-react';

interface Participant {
    id: string;
    name: string;
    avatar: string;
    isSpeaking: boolean;
    isMuted: boolean;
}

export default function HuddleRoom({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isMuted, setIsMuted] = useState(false);
    const [participants] = useState<Participant[]>([
        { id: '1', name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=1', isSpeaking: true, isMuted: false },
        { id: '2', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=2', isSpeaking: false, isMuted: true },
        { id: '3', name: 'Jordan', avatar: 'https://i.pravatar.cc/150?u=3', isSpeaking: false, isMuted: false },
    ]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-8"
                >
                    <div className="max-w-4xl mx-auto rounded-3xl bg-[#121216]/90 backdrop-blur-3xl border border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                                    <Music2 className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Creative Jam Session</h3>
                                    <div className="flex items-center gap-2 text-xs text-white/40">
                                        <Users className="w-3 h-3" />
                                        <span>8 people huddling</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                    Live
                                </div>
                                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                                    <PhoneOff className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Participants Grid */}
                        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                            {participants.map((p) => (
                                <div key={p.id} className="flex flex-col items-center gap-4">
                                    <div className={`relative p-1 rounded-full transition-all duration-300 ${p.isSpeaking ? 'ring-4 ring-purple-500 ring-offset-4 ring-offset-[#121216]' : ''}`}>
                                        <img src={p.avatar} alt={p.name} className="w-20 h-20 rounded-full object-cover grayscale-[0.2]" />
                                        {p.isMuted && (
                                            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-red-500 border-2 border-[#121216]">
                                                <MicOff className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        {p.isSpeaking && (
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                className="absolute -top-1 -right-1 p-1.5 rounded-full bg-purple-500"
                                            >
                                                <Sparkles className="w-3 h-3 text-white" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-white/80">{p.name}</span>
                                </div>
                            ))}

                            {/* Join Slot */}
                            <button className="flex flex-col items-center gap-4 group">
                                <div className="w-22 h-22 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-purple-500/50 transition-colors">
                                    <Users className="w-8 h-8 text-white/10 group-hover:text-purple-500/50" />
                                </div>
                                <span className="text-sm font-medium text-white/20">Invite</span>
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-center gap-4">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                            >
                                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                            </button>
                            <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all">
                                <MessageSquare className="w-6 h-6" />
                            </button>
                            <button
                                onClick={onClose}
                                className="px-8 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold transition-all border border-red-500/20"
                            >
                                Leave Huddle
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
