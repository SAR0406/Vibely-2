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
            transition={{ delay: 0.15 }}
            className="w-full flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-hide px-1"
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />

            {/* Add Story Button - Nexus Core Style */}
            <div
                className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group"
                onClick={triggerUpload}
            >
                <div className="w-18 h-18 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600/20 transition-all duration-500 relative overflow-hidden shadow-lg shadow-indigo-500/5">
                    <Plus className="w-7 h-7 text-indigo-400 group-hover:text-white transition-all group-hover:rotate-90 duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-cyan-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-600 group-hover:text-zinc-400 transition-colors">Add Core</span>
            </div>

            {/* Stories */}
            {stories.map((group) => {
                const latestStory = group.stories[0];
                const hasUnseen = group.hasUnseen;
                return (
                    <div key={group.user.id} className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group">
                        <div className={cn(
                            "w-18 h-18 rounded-[2rem] p-[3px] relative transition-transform duration-500 group-hover:scale-105 shadow-xl",
                            hasUnseen
                                ? "bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 animate-pulse-slow"
                                : "bg-white/5 border border-white/10"
                        )}>
                            <div className="w-full h-full rounded-[1.8rem] bg-zinc-950 border-[4px] border-[#050505] overflow-hidden relative shadow-inner">
                                <img
                                    src={latestStory?.mediaUrl || group.user.avatar}
                                    alt={group.user.name}
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Pro Indicator if applicable */}
                            {group.user.tier === 'PRO' && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-lg transform rotate-12">
                                    <span className="text-[10px]">✨</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-zinc-500 group-hover:text-white transition-colors">
                            {group.user.name.split(' ')[0]}
                        </span>
                    </div>
                )
            })}
        </motion.div>
    )
}
