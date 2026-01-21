"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, Lock, Fingerprint, Cpu, Zap, Activity, Globe, Box } from "lucide-react"
import { Button } from "@/components/design-system/button"

export default function NexusPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <Shield className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Nexus Intelligence Hub</h1>
                    </div>
                    <p className="text-zinc-500 font-medium max-w-2xl leading-relaxed">
                        Authorized access only. Monitor your node security, manage quantum encryption protocols, and verify blockchain signatures.
                    </p>
                </div>

                {/* Security Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        icon={Lock}
                        label="Encryption Matrix"
                        value="AES-4096 Quantum"
                        status="Secure"
                        color="indigo"
                    />
                    <StatCard
                        icon={Box}
                        label="Blockchain Ledger"
                        value="Vibely-Chain-01"
                        status="Synchronized"
                        color="cyan"
                    />
                    <StatCard
                        icon={Fingerprint}
                        label="Identity Verification"
                        value="Bio-Metric Multi-Factor"
                        status="Active"
                        color="purple"
                    />
                </div>

                {/* Advanced Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ControlPanel title="Quantum Security Protocols">
                        <div className="space-y-4">
                            <ControlItem
                                label="End-to-End Signature verification"
                                description="Every signal is cryptographically signed using a private node key."
                                enabled={true}
                            />
                            <ControlItem
                                label="Blockchain Proof of Identity"
                                description="Utilize distributed ledgers to verify user authenticity without central authority."
                                enabled={false}
                            />
                            <ControlItem
                                label="Self-Destruct Messages"
                                description="Wipe signal history across all nodes after retrieval."
                                enabled={true}
                            />
                        </div>
                    </ControlPanel>

                    <ControlPanel title="Performance Telemetry">
                        <div className="h-64 flex items-end gap-2 px-4 pb-4">
                            {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="flex-1 bg-gradient-to-t from-indigo-500/20 to-indigo-500/60 rounded-t-lg relative group"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-white/10 px-2 py-1 rounded text-[10px] font-mono">
                                        {h}ms
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-between px-4 mt-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                            <span>Signal Latency</span>
                            <span>99.9% Integrity</span>
                        </div>
                    </ControlPanel>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, status, color }: any) {
    return (
        <div className="glass-card p-6 flex flex-col gap-4 group hover:border-white/20 transition-all duration-500">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon className={`w-6 h-6 text-${color}-400`} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">{label}</p>
                <h4 className="text-xl font-bold text-white">{value}</h4>
                <div className="flex items-center gap-2 mt-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`} />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">{status}</span>
                </div>
            </div>
        </div>
    )
}

function ControlPanel({ title, children }: any) {
    return (
        <div className="glass-card p-8 space-y-8">
            <h3 className="text-lg font-black uppercase tracking-tight text-white border-b border-white/5 pb-4">{title}</h3>
            {children}
        </div>
    )
}

function ControlItem({ label, description, enabled }: any) {
    return (
        <div className="flex items-center justify-between gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
            <div className="space-y-1">
                <h5 className="text-sm font-bold text-white">{label}</h5>
                <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${enabled ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
        </div>
    )
}
