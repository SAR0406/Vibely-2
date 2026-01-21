'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, ShieldCheck, Lock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier: {
        name: string;
        price: string;
    } | null;
}

export function CheckoutModal({ isOpen, onClose, tier }: CheckoutModalProps) {
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

    const handlePayment = async () => {
        setStep('processing');
        // Simulate real processing time
        await new Promise(resolve => setTimeout(resolve, 2500));
        setStep('success');
    };

    if (!tier) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-10">
                            {step === 'details' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold mb-2">Upgrade to {tier.name}</h2>
                                        <p className="text-zinc-500 text-sm">You're about to unlock the full potential of Nexus Core.</p>
                                    </div>

                                    <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-zinc-400 text-sm">Total Due Today</span>
                                            <span className="text-2xl font-bold">${tier.price}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">Billed monthly • Cancel anytime</p>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Card Details</label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                                <input
                                                    type="text"
                                                    placeholder="4242 4242 4242 4242"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 outline-none focus:border-cyan-500/50 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="MM/YY" className="bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-zinc-700 outline-none focus:border-cyan-500/50" />
                                            <input type="text" placeholder="CVC" className="bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-zinc-700 outline-none focus:border-cyan-500/50" />
                                        </div>
                                    </div>

                                    <Button onClick={handlePayment} className="w-full py-7 rounded-2xl bg-white text-black text-lg font-bold">
                                        Confirm & Pay
                                    </Button>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
                                        <Lock className="w-3 h-3" />
                                        Encrypted by NexPay Protocol
                                    </div>
                                </motion.div>
                            )}

                            {step === 'processing' && (
                                <div className="py-20 flex flex-col items-center text-center">
                                    <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-6" />
                                    <h2 className="text-2xl font-bold mb-2">Authenticating...</h2>
                                    <p className="text-zinc-500 text-sm">Securing your session on the Nexus network.</p>
                                </div>
                            )}

                            {step === 'success' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-10 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-4">Welcome to {tier.name}</h2>
                                    <p className="text-zinc-500 text-sm mb-10 leading-relaxed">
                                        Your account has been upgraded. All premium features are now active for your user core.
                                    </p>
                                    <Button onClick={onClose} className="w-full py-6 rounded-2xl">
                                        Launch Dashboard
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
