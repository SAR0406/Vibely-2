"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { WelcomeHeader } from "../../components/dashboard/welcome-header"
import { ActiveFriendsList } from "../../components/dashboard/active-friends-list"
import { StoryRail } from "../../components/social/story-rail"
import { FeedWidget } from "../../components/dashboard/feed-widget"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WeatherWidget, LiveHuddleWidget, MoodAnalyticsWidget } from "../../components/dashboard/nexus-widgets"
import { CommandCenter } from "../../components/dashboard/command-center"
import { GlassCard } from "@/components/ui/glass-card"
import { VibeButton } from "@/components/ui/vibe-button"
import { Sparkles, Zap, ArrowUpRight } from "lucide-react"
import { GlassBottomNav } from "@/components/layout/glass-bottom-nav"

export default function DashboardPage() {
    return (
        <div className="flex h-screen w-full bg-[#030303] overflow-hidden relative mesh-gradient">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-20%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-20%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <ScrollArea className="flex-1 h-full z-10 relative">
                <div className="max-w-[1600px] mx-auto p-6 lg:p-10 pb-32 space-y-10">

                    {/* Top Section: Header & Stories */}
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-1 w-full space-y-8">
                            <WelcomeHeader />
                            <StoryRail />
                        </div>

                        {/* Status / Quick Actions Card */}
                        <GlassCard className="hidden lg:flex w-80 p-6 flex-col gap-4" variant="neon">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white leading-tight">Vibe Status</h3>
                                    <p className="text-xs text-zinc-400">System Optimal</p>
                                </div>
                            </div>
                            <div className="h-px bg-white/10 w-full" />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-xl p-3 text-center">
                                    <span className="block text-2xl font-bold text-white">12</span>
                                    <span className="text-[10px] uppercase text-zinc-500 tracking-wider">Online</span>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 text-center">
                                    <span className="block text-2xl font-bold text-emerald-400">98%</span>
                                    <span className="text-[10px] uppercase text-zinc-500 tracking-wider">Vibe Score</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-12 gap-6 h-full">

                        {/* Left Column: Social & Active (4 cols) */}
                        <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6 flex flex-col">
                            <GlassCard className="flex-1 min-h-[400px]" variant="default">
                                <ActiveFriendsList />
                            </GlassCard>

                            <GlassCard className="p-0 overflow-hidden" variant="minimal">
                                <WeatherWidget />
                            </GlassCard>
                        </div>

                        {/* Center Column: Feed (Main Content) (5 cols) */}
                        <div className="col-span-12 lg:col-span-8 xl:col-span-6 space-y-6">
                            <FeedWidget />
                        </div>

                        {/* Right Column: Analytics & Premium (3 cols) */}
                        <div className="col-span-12 xl:col-span-3 space-y-6 hidden xl:block">
                            <GlassCard className="p-1" variant="default">
                                <MoodAnalyticsWidget />
                            </GlassCard>

                            <GlassCard className="p-1" variant="default">
                                <LiveHuddleWidget />
                            </GlassCard>

                            {/* Premium Promo Card */}
                            <GlassCard variant="deep" gradient className="group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="p-6 relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-300 border border-indigo-500/20">
                                            Pro Tier
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white">Unlock Nexus Elite</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            Access advanced telemetry, exclusive themes, and verification badge.
                                        </p>
                                    </div>

                                    <VibeButton className="w-full" glow>
                                        Upgrade Now <ArrowUpRight className="w-4 h-4 ml-2" />
                                    </VibeButton>
                                </div>
                            </GlassCard>
                        </div>

                    </div>
                </div>
            </ScrollArea>

            <GlassBottomNav />
            <CommandCenter />
        </div>
    )
}
