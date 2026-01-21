"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useChatStore } from "@/store/use-chat-store"
import { format } from "date-fns"

export function WelcomeHeader() {
    const { currentUser } = useChatStore()
    const [greeting, setGreeting] = React.useState("")

    React.useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Good Morning")
        else if (hour < 18) setGreeting("Good Afternoon")
        else setGreeting("Good Evening")
    }, [])

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
            >
                <div className="flex items-center gap-3">
                    <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase">
                        {format(new Date(), "p")} Core Active
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                    {greeting}, <br />
                    <span className="text-gradient font-black">{currentUser?.name || "Nexus User"}</span>
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex items-center gap-4 glass-card p-4 shadow-2xl shadow-indigo-500/10 group cursor-default"
            >
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-600 group-hover:text-cyan-400 transition-colors">Neural Vibe</span>
                    <span className="text-sm font-bold text-white">Synchronized</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none" />
                    <img src="/nexus-core.png" alt="Nexus" className="w-7 h-7 animate-pulse" />
                </div>
            </motion.div>
        </div>
    )
}
