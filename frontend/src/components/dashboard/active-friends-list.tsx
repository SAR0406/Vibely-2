"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useChatStore } from "@/store/use-chat-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function ActiveFriendsList() {
    const { conversations, currentUser } = useChatStore()

    // Extract unique participants from conversations
    const recentContacts = React.useMemo(() => {
        const contacts = new Map()
        conversations.forEach(c => {
            c.participants.forEach(p => {
                if (p.id !== currentUser?.id && !contacts.has(p.id)) {
                    contacts.set(p.id, p)
                }
            })
        })
        return Array.from(contacts.values())
    }, [conversations, currentUser])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
        >
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-semibold text-white">Active Friends</h2>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">View All</button>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-4">
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 pb-2">
                        {recentContacts.length === 0 ? (
                            <div className="flex items-center justify-center w-full py-8 text-zinc-500 text-sm">
                                Start chatting to see friends here!
                            </div>
                        ) : (
                            recentContacts.map((friend, i) => (
                                <motion.div
                                    key={friend.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="flex flex-col items-center gap-2 group cursor-pointer"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Avatar className="h-14 w-14 border-2 border-transparent group-hover:border-indigo-500/50 transition-all ring-2 ring-[#0a0a0a]">
                                            <AvatarImage src={friend.avatar} />
                                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                        </Avatar>
                                        {friend.isOnline && (
                                            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-[#18181b] rounded-full" />
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors max-w-[60px] truncate">
                                        {friend.name.split(' ')[0]}
                                    </span>
                                </motion.div>
                            ))
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" className="hidden" />
                </ScrollArea>
            </div>
        </motion.div>
    )
}
