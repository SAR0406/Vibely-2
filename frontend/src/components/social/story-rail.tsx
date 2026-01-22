"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Sparkles, Zap } from "lucide-react"
import { storiesApi } from "@/services/api"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"

export function StoryRail() {
    const [stories, setStories] = React.useState<any[]>([])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        loadStories()
    }, [])

    const loadStories = async () => {
        try {
            const { data } = await storiesApi.getStories()
            setStories(data)
        } catch (error) {
            console.error("Failed to load stories", error)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const formData = new FormData()
            formData.append('file', e.target.files[0])
            formData.append('type', 'IMAGE')
            try {
                await storiesApi.createStory(formData)
                loadStories()
            } catch (error) {
                console.error("Failed to upload story", error)
            }
        }
    }

    return (
        <div className="relative">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-hide px-1"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                />

                {/* Add Story Button - Elite Persona Style */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2.2rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                        <div className="relative w-full h-full rounded-[2.2rem] bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden backdrop-blur-xl group-hover:border-indigo-500/30 transition-all duration-500 shadow-2xl">
                            <Plus className="w-8 h-8 text-zinc-500 group-hover:text-white group-hover:rotate-90 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                        </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">Add Story</span>
                </motion.div>

                {/* Stories List */}
                <AnimatePresence>
                    {stories.map((group, idx) => {
                        const latestStory = group.stories[0];
                        const hasUnseen = group.hasUnseen;
                        return (
                            <motion.div
                                key={group.user.id}
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: idx * 0.05 + 0.1, duration: 0.5 }}
                                className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group"
                            >
                                <div className="relative w-20 h-20">
                                    {/* Unseen Indicator Ring */}
                                    <div className={cn(
                                        "absolute -inset-1 rounded-[2.4rem] transition-all duration-700",
                                        hasUnseen
                                            ? "bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 opacity-100 blur-[2px]"
                                            : "bg-white/5 opacity-40"
                                    )} />

                                    <div className="relative w-full h-full rounded-[2.2rem] p-[2.5px] bg-[#050505]">
                                        <div className="w-full h-full rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5">
                                            <img
                                                src={latestStory?.mediaUrl || group.user.avatar}
                                                alt={group.user.name}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:grayscale-0 grayscale-[0.2]"
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>
                                    </div>

                                    {/* Pro/Verified Badge */}
                                    {group.user.tier === 'PRO' && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-lg bg-indigo-600 border border-white/20 flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                            <Zap className="w-3 h-3 text-white fill-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1 text-center">
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-500 group-hover:text-white transition-colors block">
                                        {group.user.name.split(' ')[0]}
                                    </span>
                                    <div className="w-4 h-[1px] bg-indigo-500/20 mx-auto group-hover:w-8 group-hover:bg-indigo-500 transition-all duration-700" />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Scroll Indicator Gradient */}
            <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#030303] to-transparent pointer-events-none z-10" />
        </div>
    )
}
