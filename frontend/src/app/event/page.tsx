'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap, Globe, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function EventLandingPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.6, 0.01, -0.05, 0.95],
            },
        },
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-purple-500/30">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 px-6 py-6 border-b border-white/5 backdrop-blur-xl bg-black/20">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tighter">VIBELY</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#pro" className="hover:text-white transition-colors">Pro</a>
                        <a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a>
                    </div>
                    <Link href="/login">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold"
                        >
                            Sign In
                        </motion.button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] opacity-20 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-7xl mx-auto text-center"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest font-bold text-white/60 mb-8">
                        <Zap className="w-3 h-3 text-purple-400" />
                        Announcing Vibely 2.0: The Grand Reveal
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-6xl md:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-tight"
                    >
                        The Social Future <br /> Is Here.
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Experience the world's most creative social platform. Now with AI-integrated matching,
                        premium glassmorphism UI, and real-time voice huddles.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <motion.button
                                whileHover={{ y: -5, boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' }}
                                className="px-8 py-4 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 font-bold flex items-center gap-2 group"
                            >
                                Join the Revolution
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </Link>
                        <button className="px-8 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors font-medium text-white/80">
                            Watch Keynote
                        </button>
                    </motion.div>

                    {/* Cinematic Image Mockup */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-20 relative px-4"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
                        <motion.div
                            style={{ perspective: 1000 }}
                            initial={{ rotateX: 20, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 2 }}
                            className="max-w-5xl mx-auto rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.1)]"
                        >
                            <img
                                src="/event-hero.png"
                                alt="Vibely Dashboard Preview"
                                className="w-full object-cover"
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Feature Grid */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Globe className="w-6 h-6 text-blue-400" />}
                            title="VibeAI Discovery"
                            description="Our neural engine matches you with creators who share your digital soul."
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-6 h-6 text-purple-400" />}
                            title="Voice Huddles"
                            description="Drop into live audio spaces with zero latency and high-fidelity sound."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-green-400" />}
                            title="SaaS Privacy"
                            description="Enterprise-grade encryption and advanced moderation tools for your peace of mind."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-white/40 text-sm">
                        © 2026 Vibely Inc. All rights reserved. Built for the next generation of creators.
                    </div>
                    <div className="flex gap-8 text-white/40 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="hover:text-white transition-colors">Discord</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
        >
            <div className="mb-6">{icon}</div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-white/50 leading-relaxed text-sm">
                {description}
            </p>
        </motion.div>
    );
}
