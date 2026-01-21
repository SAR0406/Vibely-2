"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { storiesApi } from "@/services/api"
import { cn } from "@/lib/utils"

export function VibeStories() {
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

    const triggerUpload = () => fileInputRef.current?.click()

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex gap-8 overflow-x-auto pb-8 pt-4 scrollbar-hide px-2"
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />

            {/* Add Node Button */}
            <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center gap-4 shrink-0 cursor-pointer group"
                onClick={triggerUpload}
            >
                <div className="w-20 h-20 rounded-[2.2rem] bg-[#050505] border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/40 transition-all duration-700 relative shadow-2xl shadow-black/20 overflow-hidden">
                    <Plus className="w-8 h-8 text-zinc-600 group-hover:text-indigo-400 group-hover:rotate-90 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-zinc-400 transition-colors">Sync Hub</span>
            </motion.div>

            {/* Stories (Nodes) */}
            {stories.map((group, idx) => {
                const latestStory = group.stories[0];
                const hasUnseen = group.hasUnseen;
                return (
                    <motion.div
                        key={group.user.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                        className="flex flex-col items-center gap-4 shrink-0 cursor-pointer group"
                    >
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            {/* Progressive Ring */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.05]">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="44"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className={cn(
                                        "transition-all duration-1000",
                                        hasUnseen ? "text-indigo-500 opacity-100 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "text-white/5"
                                    )}
                                    strokeDasharray={276}
                                    strokeDashoffset={hasUnseen ? 0 : 276}
                                />
                            </svg>

                            <div className={cn(
                                "w-20 h-20 rounded-[2.2rem] p-[2px] relative transition-all duration-700 ease-out group-hover:rotate-3",
                                hasUnseen
                                    ? "bg-gradient-to-tr from-indigo-500 via-indigo-400 to-cyan-400"
                                    : "bg-white/5 border border-white/10"
                            )}>
                                <div className="w-full h-full rounded-[2rem] bg-zinc-950 overflow-hidden relative border-[3px] border-[#080808]">
                                    <img
                                        src={latestStory?.mediaUrl || group.user.avatar}
                                        alt={group.user.name}
                                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 grayscale-[0.3]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                </div>

                                {/* Pro Indicator */}
                                {group.user.tier === 'PRO' && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-[0.8rem] bg-white text-black flex items-center justify-center shadow-2xl transform rotate-12 group-hover:rotate-45 transition-transform duration-700">
                                        <span className="text-[10px]">✨</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1 text-center">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 group-hover:text-white transition-colors block">
                                {group.user.name.split(' ')[0]}
                            </span>
                            <div className="w-4 h-[1px] bg-indigo-500/20 mx-auto group-hover:w-8 group-hover:bg-indigo-500 transition-all duration-700" />
                        </div>
                    </motion.div>
                )
            })}
        </motion.div>
    )
}
