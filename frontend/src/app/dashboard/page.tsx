"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { WelcomeHeader } from "../../components/dashboard/welcome-header"
import { ActiveFriendsList } from "../../components/dashboard/active-friends-list"
import { VibeStories } from "../../components/dashboard/vibe-stories"
import { QuickStats } from "../../components/dashboard/quick-stats"
import { FeedWidget } from "../../components/dashboard/feed-widget"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WeatherWidget, LiveHuddleWidget, MoodAnalyticsWidget } from "../../components/dashboard/nano-widgets"
import { CommandCenter } from "../../components/dashboard/command-center"

export default function DashboardPage() {
    return (
        <div className="flex h-screen w-full bg-[#050505] overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            </div>

            <ScrollArea className="flex-1 h-full z-10">
                <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">

                    {/* Header Section */}
                    <div className="space-y-6">
                        <WelcomeHeader />
                        <VibeStories />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Friends & Activity */}
                        <div className="lg:col-span-2 space-y-6">
                            <ActiveFriendsList />

                            {/* Placeholder for Recent Activity / Feed */}
                            <FeedWidget />
                        </div>

                        {/* Right Column: Nano Widgets */}
                        <div className="space-y-6">
                            <WeatherWidget />
                            <LiveHuddleWidget />
                            <MoodAnalyticsWidget />

                            {/* Premium Promo */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-indigo-500/20"
                            >
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                                <div className="relative z-10">
                                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold text-white mb-4 backdrop-blur-sm border border-white/10 uppercase tracking-wider">
                                        Pro Feature
                                    </span>
                                    <h3 className="text-2xl font-bold text-white mb-2">Nexus Pass ✨</h3>
                                    <p className="text-indigo-100/80 text-sm mb-6 leading-relaxed">
                                        Level up your profile, earn unique badges and dominate the vibe discovery.
                                    </p>
                                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                        Join Pro
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
