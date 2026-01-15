"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { MessageSquare, Flame, Clock } from "lucide-react"

export function QuickStats() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <StatsCard
                icon={MessageSquare}
                label="Messages"
                value="1.2k"
                color="text-blue-400"
                delay={0}
            />
            <StatsCard
                icon={Flame}
                label="Streak"
                value="12 Days"
                color="text-orange-400"
                delay={0.1}
            />
            <StatsCard
                icon={Clock}
                label="Time Online"
                value="4.5h"
                color="text-emerald-400"
                delay={0.2}
            />
            <StatsCard
                label="Vibe Score"
                value="98"
                emoji="🚀"
                delay={0.3}
            />
        </div>
    )
}

function StatsCard({ icon: Icon, label, value, color, delay, emoji }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + delay }}
            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl hover:bg-zinc-900/60 transition-colors group"
        >
            <div className="flex items-start justify-between mb-2">
                {Icon ? (
                    <Icon className={`w-5 h-5 ${color} opacity-80 group-hover:scale-110 transition-transform`} />
                ) : (
                    <span className="text-xl group-hover:scale-110 transition-transform inline-block">{emoji}</span>
                )}
            </div>
            <div className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
                <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">{label}</span>
            </div>
        </motion.div>
    )
}
