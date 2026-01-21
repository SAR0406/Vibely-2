'use client';

import React from 'react';
import { PricingCards } from '@/components/landing/pricing-cards';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <nav className="p-8 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg">
                        <img src="/nexus-core.png" className="w-5 h-5" alt="Nexus" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">nexus.</span>
                </Link>
                <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                    Back to nexus
                </Link>
            </nav>

            <main className="pt-20 pb-40">
                <PricingCards />

                <div className="max-w-7xl mx-auto px-6 mt-20 text-center">
                    <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-mono">
                        Secure payments processed by NexPay Core. Trusted by 20k+ creators.
                    </p>
                </div>
            </main>
        </div>
    );
}
