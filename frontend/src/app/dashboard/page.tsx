"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { WelcomeHeader } from "../../components/dashboard/welcome-header"
import { ActiveFriendsList } from "../../components/dashboard/active-friends-list"
import { VibeStories } from "../../components/dashboard/vibe-stories"
import { QuickStats } from "../../components/dashboard/quick-stats"
import { FeedWidget } from "../../components/dashboard/feed-widget"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WeatherWidget, LiveHuddleWidget, MoodAnalyticsWidget } from "../../components/dashboard/nexus-widgets"
import { CommandCenter } from "../../components/dashboard/command-center"

export default function DashboardPage() {
    return (
        <div className="flex h-screen w-full bg-[#050505] overflow-hidden relative mesh-gradient noise-texture">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] scale-[2]" />
            </div>

            <ScrollArea className="flex-1 h-full z-10">
                <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12 pb-32">

                    {/* Header Section */}
                    <div className="space-y-8">
                        <WelcomeHeader />
                        <VibeStories />
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-unscoped">

                        {/* Highlights & Activity (Spans 2 columns) */}
                        <div className="lg:col-span-2 space-y-6">
                            <ActiveFriendsList />
                        </div>

                        {/* Quick Insight (Spans 1 column) */}
                        <div className="lg:col-span-1">
                            <WeatherWidget />
                        </div>

                        {/* Live Sync (Spans 1 column) */}
                        <div className="lg:col-span-1">
                            <LiveHuddleWidget />
                        </div>

                        {/* Central Intelligence / Feed (Spans 3 columns) */}
                        <div className="lg:col-span-3 space-y-8">
                            <FeedWidget />
                        </div>

                        {/* Analytic & Promo Stack (Spans 1 column) */}
                        <div className="lg:col-span-1 space-y-6">
                            <MoodAnalyticsWidget />

                            {/* Premium Promo - Redesigned for Elite Look */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="magic-border group"
                            >
                                <div className="magic-border-content p-8 space-y-6">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center blur-sm group-hover:blur-none transition-all duration-700">
                                            <span className="text-xl">✨</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Evolution Path</span>
                                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Nexus Elite</h3>
                                    </div>

                                    <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                                        Unlock advanced telemetry, quantum security protocols, and vanity node identifiers.
                                    </p>

                                    <button className="w-full h-12 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                        Ascend Now
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <CommandCenter />
        </div>
    )
}
