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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
            >
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                    <span>{format(new Date(), "EEEE, MMMM do")}</span>
                    <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                    <span>Dashboard</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{currentUser?.name || "Friend"}</span> <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 bg-zinc-900/50 backdrop-blur-md border border-white/10 p-2 pl-4 rounded-full pr-2"
            >
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Current Vibe</span>
                    <span className="text-sm font-bold text-indigo-400">Electric ⚡</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="text-lg">✨</span>
                </div>
            </motion.div>
        </div>
    )
}
