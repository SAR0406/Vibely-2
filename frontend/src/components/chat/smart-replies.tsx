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
                className="flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide"
            >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0">
                    <Sparkles className="w-3 h-3 text-white" />
                </div>
                {suggestions.map((reply, i) => (
                    <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onSelect(reply)}
                        className="px-3 py-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 border border-white/5 text-xs text-zinc-300 hover:text-white transition-all whitespace-nowrap"
                    >
                        {reply}
                    </motion.button>
                ))}
            </motion.div>
        </AnimatePresence>
    )
}
