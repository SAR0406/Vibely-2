'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureBento } from '@/components/landing/feature-bento';
import { NexusCoreVisual } from '@/components/landing/nexus-core-visual';
import { PricingCards } from '@/components/landing/pricing-cards';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      {/* Global Navbar */}
      <nav className="fixed top-0 w-full z-[100] px-8 py-6 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
            <img src="/nexus-core.png" className="w-6 h-6" alt="Nexus" />
          </div>
          <span className="text-xl font-bold tracking-tight">nexus.</span>
        </div>

        <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <a href="#features" className="hover:text-white transition-colors">Instrumental Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Nexus Pass</a>
          <a href="#" className="hover:text-white transition-colors">Developer Core</a>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <button className="px-6 py-3 rounded-xl bg-white text-black text-[11px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
              Join the Pass
            </button>
          </Link>
        </div>
      </nav>

      <main>
        <HeroSection />

        <NexusCoreVisual />

        <FeatureBento />

        <PricingCards />

        {/* Final CTA Section */}
        <section className="py-40 px-6 bg-gradient-to-b from-transparent to-zinc-900/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-10 tracking-tight">The social layer <br /> of the future.</h2>
            <Link href="/signup">
              <button className="group relative px-12 py-6 rounded-[2rem] bg-indigo-600 text-white font-bold text-xl overflow-hidden shadow-2xl shadow-indigo-500/40">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative flex items-center gap-3">
                  Become a NEXUS Holder
                  <ArrowUpRight className="w-6 h-6" />
                </span>
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="py-20 border-t border-white/5 px-8 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
          <span>Vibely Labs</span>
          <span>Privacy Protocol</span>
          <span>License</span>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">
          NEURAL-SYNC STATUS: OPTIMIZED (18ms)
        </div>
        <div className="flex gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 hover:border-white/10 transition-colors" />
          ))}
        </div>
      </footer>
    </div>
  );
}
