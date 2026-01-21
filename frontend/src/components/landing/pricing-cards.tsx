'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';
import { CheckoutModal } from '../billing/checkout-modal';

const tiers = [
    {
        name: 'Free Vibe',
        price: '0',
        description: 'Perfect for exploring the Nexus.',
        features: ['Standard Chat', 'Basic Feed', '1 Story per day', 'Community access'],
        buttonText: 'Current Plan',
        premium: false,
    },
    {
        name: 'Nexus Pro',
        price: '9.99',
        description: 'Elite features for power creators.',
        features: [
            'Ad-free experience',
            'Premium glass themes',
            'Unlimited Vibe Stories',
            'Verified Nexus Badge',
            'Priority VibeAI matching'
        ],
        buttonText: 'Upgrade to Pro',
        premium: true,
        highlight: true,
    },
    {
        name: 'Nexus Business',
        price: '49.99',
        description: 'Maximum impact for tribes & brands.',
        features: [
            'All Pro features',
            'Advanced Analytics',
            'Priority Support',
            'API Access',
            'Early Beta Access'
        ],
        buttonText: 'Contact Sales',
        premium: true,
    }
];

export function PricingCards() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null);

    return (
        <section id="pricing" className="py-24 px-6 relative overflow-hidden">
            <CheckoutModal
                isOpen={!!selectedTier}
                onClose={() => setSelectedTier(null)}
                tier={selectedTier ? { name: selectedTier.name, price: billingCycle === 'yearly' ? (parseFloat(selectedTier.price) * 0.8).toFixed(2) : selectedTier.price } : null}
            />
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Simple, Transparent <br /> Pricing.</h2>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <span className={cn("text-sm font-medium transition-colors", billingCycle === 'monthly' ? "text-white" : "text-zinc-500")}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-14 h-7 rounded-full bg-white/10 p-1 relative transition-colors hover:bg-white/20"
                        >
                            <motion.div
                                animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                                className="w-5 h-5 rounded-full bg-white shadow-lg"
                            />
                        </button>
                        <span className={cn("text-sm font-medium transition-colors", billingCycle === 'yearly' ? "text-white" : "text-zinc-500")}>Yearly</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest border border-cyan-500/20">
                            Save 20%
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500",
                                tier.highlight
                                    ? "bg-gradient-to-b from-white/[0.08] to-transparent border-white/20 shadow-2xl shadow-indigo-500/10"
                                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                            )}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-bold tracking-tighter">${billingCycle === 'yearly' ? (parseFloat(tier.price) * 0.8).toFixed(2) : tier.price}</span>
                                    <span className="text-zinc-500 text-sm">/mo</span>
                                </div>
                                <p className="text-zinc-500 text-sm leading-relaxed">{tier.description}</p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {tier.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3 text-sm text-zinc-400">
                                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={tier.highlight ? "primary" : "glass"}
                                onClick={() => !tier.premium ? null : setSelectedTier(tier)}
                                className={cn(
                                    "w-full py-6 rounded-2xl group",
                                    tier.highlight ? "bg-white text-black" : ""
                                )}
                            >
                                {tier.buttonText}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
