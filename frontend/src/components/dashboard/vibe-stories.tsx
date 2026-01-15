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
            className="w-full flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />

            {/* Add Story Button */}
            <div
                className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
                onClick={triggerUpload}
            >
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-white/10 flex items-center justify-center group-hover:bg-zinc-800 transition-colors relative overflow-hidden">
                    <Plus className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50" />
                </div>
                <span className="text-xs font-medium text-zinc-400">Add info</span>
            </div>

            {/* Stories */}
            {stories.map((group) => {
                const latestStory = group.stories[0];
                const hasUnseen = group.hasUnseen;
                return (
                    <div key={group.user.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl p-[2px] relative",
                            hasUnseen ? "bg-gradient-to-tr from-pink-500 to-rose-500" : "bg-zinc-800"
                        )}>
                            <div className="w-full h-full rounded-[14px] bg-zinc-900 border-[3px] border-[#050505] overflow-hidden relative">
                                <img src={latestStory?.mediaUrl || group.user.avatar} alt={group.user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                        <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                            {group.user.name.split(' ')[0]}
                        </span>
                    </div>
                )
            })}
        </motion.div>
    )
}
