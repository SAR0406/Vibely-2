'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, CreditCard } from 'lucide-react';
import axios from 'axios';
import { cookieUtils } from '@/lib/cookies';

const PLANS = [
    {
        id: 'free-vibe',
        name: 'Free Vibe',
        price: 0,
        tier: 'FREE',
        features: ['Standard Chat', 'Basic Feed', '1 Story/day'],
        cta: 'Current Plan',
        popular: false,
    },
    {
        id: 'pro-vibe',
        name: 'Pro Vibe',
        price: 9.99,
        tier: 'PRO',
        features: ['Ad-free', 'Premium Themes', 'Unlimited Stories', 'Verified Badge', 'Profile Boosts'],
        cta: 'Upgrade to Pro',
        popular: true,
    },
    {
        id: 'business-vibe',
        name: 'Business Vibe',
        price: 49.99,
        tier: 'BUSINESS',
        features: ['All Pro features', 'Analytics Dashboard', 'Priority Support', 'API Access'],
        cta: 'Go Business',
        popular: false,
    },
];

export default function BillingPage() {
    const [currentTier, setCurrentTier] = useState('FREE');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch current user tier
        const token = cookieUtils.getToken();
        if (token) {
            axios.get('http://localhost:3001/subscription/me', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setCurrentTier(res.data.tier);
            }).catch(err => console.error(err));
        }
    }, []);

    const handleUpgrade = async (planId: string) => {
        setLoading(true);
        try {
            const token = cookieUtils.getToken();
            await axios.post('http://localhost:3001/subscription/upgrade', { planId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentTier(PLANS.find(p => p.id === planId)?.tier || 'FREE');
            alert('Welcome to the next level!');
        } catch (error) {
            alert('Upgrade failed. Please check your vibe.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-12">
                <h1 className="text-3xl font-bold mb-2">Vibely SaaS</h1>
                <p className="text-white/60">Manage your subscription and unlock premium features.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan) => (
                    <motion.div
                        key={plan.id}
                        whileHover={{ y: -10 }}
                        className={`relative p-8 rounded-3xl border ${plan.popular ? 'border-purple-500 bg-purple-500/5' : 'border-white/10 bg-white/5'
                            } backdrop-blur-xl overflow-hidden`}
                    >
                        {plan.popular && (
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-purple-500 text-[10px] font-bold uppercase tracking-widest">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">${plan.price}</span>
                                <span className="text-white/40 text-sm">/month</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-green-400" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => plan.tier !== currentTier && handleUpgrade(plan.id)}
                            disabled={loading || plan.tier === currentTier}
                            className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.tier === currentTier
                                ? 'bg-white/10 text-white/40 cursor-default'
                                : plan.popular
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-white text-black hover:bg-white/90'
                                }`}
                        >
                            {plan.tier === currentTier ? 'Active' : plan.cta}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Billing Info */}
            <div className="mt-12 p-8 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white/40" />
                    </div>
                    <div>
                        <h4 className="font-bold">Next Billing Date</h4>
                        <p className="text-white/40 text-sm">February 20, 2026</p>
                    </div>
                </div>
                <button className="text-sm font-medium text-white/60 hover:text-white underline transition-colors">
                    Download Invoice
                </button>
            </div>
        </div>
    );
}
