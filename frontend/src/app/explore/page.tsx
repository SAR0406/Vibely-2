"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, Lock, Fingerprint, Cpu, Zap, Activity, Globe, Box } from "lucide-react"
import { Button } from "@/components/design-system/button"
import { cn } from "@/lib/utils"

export default function ExplorePage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-16 noise-texture relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                                <Shield className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl font-bold tracking-tight text-white">Explore <span className="text-indigo-500">Vibely</span></h1>
                                <p className="text-xs font-mono text-zinc-500">ID: USER-ACCESS-GRANTED</p>
                            </div>
                        </div>
                        <p className="text-zinc-400 font-medium max-w-xl leading-relaxed text-sm">
                            Discover new communities, manage your security settings, and explore the latest features.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" size="sm" className="border-white/5 hover:border-indigo-500/30">
                            View Logs
                        </Button>
                        <Button variant="primary" size="sm" className="bg-white text-black hover:bg-zinc-200">
                            Settings
                        </Button>
                    </div>
                </div>

                {/* Security Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <StatCard
                        icon={Lock}
                        label="Security"
                        value="Encrypted"
                        status="SECURE"
                        color="indigo"
                        desc="End-to-end Encryption"
                    />
                    <StatCard
                        icon={Box}
                        label="Network"
                        value="Connected"
                        status="ONLINE"
                        color="cyan"
                        desc="Server Status: Optimal"
                    />
                    <StatCard
                        icon={Fingerprint}
                        label="Identity"
                        value="Verified"
                        status="ACTIVE"
                        color="rose"
                        desc="2FA Enabled"
                    />
                </div>

                {/* Advanced Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ControlPanel title="Privacy & Security">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ControlItem
                                    label="Two-Factor Authentication"
                                    description="Add an extra layer of security to your account."
                                    enabled={true}
                                />
                                <ControlItem
                                    label="Incognito Mode"
                                    description="Browse without saving history."
                                    enabled={false}
                                />
                                <ControlItem
                                    label="Data Deletion"
                                    description="Automatically clear cache on exit."
                                    enabled={true}
                                />
                                <ControlItem
                                    label="Secure Routing"
                                    description="Use secure connection protocols."
                                    enabled={true}
                                />
                            </div>
                        </ControlPanel>
                    </div>

                    <div className="lg:col-span-1">
                        <ControlPanel title="Performance">
                            <div className="space-y-8">
                                <div className="h-48 flex items-end gap-1.5 px-2">
                                    {[40, 70, 45, 90, 65, 80, 55, 95, 60, 85].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.05, duration: 1, ease: "easeOut" }}
                                            className="flex-1 bg-gradient-to-t from-indigo-500/10 via-indigo-500/40 to-cyan-400 rounded-t-sm relative group cursor-pointer"
                                        >
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-3">
                                            <Activity className="w-4 h-4 text-emerald-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Latency</span>
                                        </div>
                                        <span className="text-xs font-mono text-emerald-400">12ms</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-4 h-4 text-indigo-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Region</span>
                                        </div>
                                        <span className="text-xs font-mono text-indigo-400">US-EAST</span>
                                    </div>
                                </div>
                            </div>
                        </ControlPanel>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, status, color, desc }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="magic-border group cursor-pointer"
        >
            <div className="magic-border-content p-8 space-y-6">
                <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center transition-all duration-700 group-hover:bg-${color}-500/10 group-hover:border-${color}-500/20`}>
                    <Icon className={`w-6 h-6 text-zinc-500 group-hover:text-${color}-400 transition-colors`} />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-1 h-1 rounded-full bg-${color}-500 animate-pulse`} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{label}</p>
                    </div>
                    <h4 className="text-xl font-black text-white tracking-widest uppercase italic truncate mb-2">{value}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{desc}</p>
                </div>
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="blockchain-hash">VERIFIED_SEC</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{status}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_var(--color-emerald-500)]" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function ControlPanel({ title, children }: any) {
    return (
        <div className="glass-card p-10 space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <h3 className="text-lg font-black uppercase tracking-[0.2em] text-white flex items-center gap-4 italic">
                <span className="w-8 h-[1px] bg-indigo-500/50" />
                {title}
            </h3>
            {children}
        </div>
    )
}

function ControlItem({ label, description, enabled }: any) {
    return (
        <div className="flex flex-col gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group/item cursor-pointer">
            <div className="flex items-center justify-between">
                <h5 className="text-xs font-black text-white uppercase tracking-widest group-hover/item:text-indigo-400 transition-colors">{label}</h5>
                <div className={cn(
                    "w-10 h-5 rounded-full relative transition-all duration-500 p-1",
                    enabled ? 'bg-indigo-500/20' : 'bg-zinc-900 border border-white/5'
                )}>
                    <motion.div
                        animate={{ x: enabled ? 20 : 0 }}
                        className={cn(
                            "w-3 h-3 rounded-full transition-shadow duration-500",
                            enabled ? 'bg-indigo-400 shadow-[0_0_10px_var(--color-indigo-400)]' : 'bg-zinc-700'
                        )}
                    />
                </div>
            </div>
            <p className="text-[10px] text-zinc-600 font-medium leading-relaxed group-hover/item:text-zinc-400 transition-colors">{description}</p>
            <div className="blockchain-hash opacity-10 group-hover/item:opacity-30">SIG_MODE: 0x892...FF</div>
        </div>
    )
}
