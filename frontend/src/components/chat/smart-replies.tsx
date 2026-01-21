"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

interface SmartRepliesProps {
    lastMessageContent?: string
    onSelect: (reply: string) => void
}

export function SmartReplies({ lastMessageContent, onSelect }: SmartRepliesProps) {
    const [suggestions, setSuggestions] = React.useState<string[]>([])

    // Simple keyword-based suggestion logic (Mock AI)
    React.useEffect(() => {
        if (!lastMessageContent) return

        const content = lastMessageContent.toLowerCase()
        let newSuggestions: string[] = []

        if (content.includes("how are you") || content.includes("how's it going")) {
            newSuggestions = ["I'm good! ⚡", "Doing great, thanks!", "Hanging in there 😅"]
        } else if (content.includes("where") || content.includes("location")) {
            newSuggestions = ["At home 🏠", "At work 🏢", "On my way 🚗"]
        } else if (content.includes("yes") || content.includes("sure")) {
            newSuggestions = ["Great!", "Awesome 🔥", "Sounds good 👍"]
        } else if (content.includes("no") || content.includes("busy")) {
            newSuggestions = ["No problem", "Maybe later", "Understandable"]
        } else if (content.endsWith("?")) {
            newSuggestions = ["Yes", "No", "Not sure"]
        } else {
            // Generic fallbacks
            newSuggestions = ["Sounds interesting!", "Cool!", "Tell me more"]
        }

        setSuggestions(newSuggestions)
    }, [lastMessageContent])

    if (suggestions.length === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-3 px-6 pb-4 overflow-x-auto scrollbar-hide relative z-10"
            >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 shrink-0 shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex gap-2.5">
                    {suggestions.map((reply, i) => (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, type: "spring" }}
                            onClick={() => onSelect(reply)}
                            className="px-4 py-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-[11px] font-bold text-zinc-400 hover:text-white transition-all whitespace-nowrap shadow-xl active:scale-95"
                        >
                            {reply}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
