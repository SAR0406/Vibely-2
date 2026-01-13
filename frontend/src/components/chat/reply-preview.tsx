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
                className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-t border-white/5 backdrop-blur-sm"
            >
                <div className="flex flex-col border-l-2 border-indigo-500 pl-3">
                    <span className="text-xs font-medium text-indigo-400">
                        Replying to {replyingTo.sender?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-zinc-400 truncate max-w-[300px] md:max-w-md">
                        {replyingTo.content}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zinc-500 hover:text-white"
                    onClick={() => setReplyingTo(null)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </motion.div>
        </AnimatePresence>
    )
}
