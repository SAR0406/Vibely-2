"use client"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useChatStore } from "@/store/use-chat-store"
import { Button } from "@/components/design-system/button"

export function ReplyPreview() {
    const { replyingTo, setReplyingTo } = useChatStore()

    if (!replyingTo) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center justify-between px-6 py-3 bg-zinc-900/80 border-t border-white/5 backdrop-blur-2xl relative z-10"
            >
                <div className="flex flex-col border-l-[3px] border-cyan-400 pl-4">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-0.5">
                        Interpreting Signal from {replyingTo.sender?.name || "Node"}
                    </span>
                    <span className="text-[13px] text-zinc-400 truncate max-w-[300px] md:max-w-md font-medium">
                        {replyingTo.content}
                    </span>
                </div>
                <Button
                    variant="glass"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-white rounded-xl bg-white/5 border-white/10"
                    onClick={() => setReplyingTo(null)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </motion.div>
        </AnimatePresence>
    )
}
