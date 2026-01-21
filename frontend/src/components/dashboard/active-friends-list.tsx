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
            <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Neural Connections</h2>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">Expand Node</button>
            </div>

            <div className="glass-card p-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-6 pb-2">
                        {recentContacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center w-full py-10 gap-3">
                                <Avatar className="h-16 w-16 grayscale opacity-20">
                                    <AvatarFallback>?</AvatarFallback>
                                </Avatar>
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No Active Cores</p>
                            </div>
                        ) : (
                            recentContacts.map((friend, i) => (
                                <motion.div
                                    key={friend.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.05 * i, type: "spring" }}
                                    className="flex flex-col items-center gap-4 group cursor-pointer"
                                >
                                    <div className="relative">
                                        <div className="absolute -inset-1.5 bg-gradient-to-tr from-cyan-400 to-indigo-600 rounded-3xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                                        <div className="relative p-1 bg-[#050505] rounded-[1.6rem] border border-white/5 group-hover:border-white/20 transition-colors">
                                            <Avatar className="h-14 w-14 rounded-[1.4rem]">
                                                <AvatarImage src={friend.avatar} className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <AvatarFallback className="bg-zinc-800 text-zinc-500 font-black">{friend.name[0]}</AvatarFallback>
                                            </Avatar>

                                            {friend.isOnline && (
                                                <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                                                    <div className="w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-[#050505] shadow-lg relative">
                                                        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-40" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-600 group-hover:text-white transition-colors max-w-[70px] truncate">
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
        < ScrollBar orientation = "horizontal" className = "hidden" />
                </ScrollArea >
            </div >
        </motion.div >
    )
}
