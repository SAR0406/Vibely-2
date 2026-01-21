"use client"

import { motion } from "framer-motion"

export function TypingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1 bg-white/5 border border-white/5 w-fit px-4 py-2.5 rounded-2xl rounded-tl-none shadow-lg backdrop-blur-md ml-12 mb-2"
        >
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
            />
        </motion.div>
    )
}
