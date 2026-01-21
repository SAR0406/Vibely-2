"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Plus,
    Shield,
    Users,
    MessagesSquare,
    UserPlus,
    MoreVertical,
    Settings,
    LayoutGrid,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/design-system/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/store/use-chat-store"
import { usersApi, chatApi, friendsApi } from "@/services/api"
import { formatMessageTime } from "@/lib/date-utils"
import { CreateGroupModal } from "./create-group-modal"
import { ProfileModal } from "./profile-modal"
import { SettingsModal } from "@/components/settings/settings-modal"
import { SidebarSkeleton } from "@/components/skeletons/sidebar-skeleton"

interface SidebarProps {
    isCollapsed: boolean
}

type SidebarTab = "chats" | "friends"

export function Sidebar({ isCollapsed }: SidebarProps) {
    const router = useRouter()
    const {
        conversations,
        selectedConversationId,
        selectConversation,
        setConversations,
        currentUser,
        setCurrentUser,
    } = useChatStore()

    const [activeTab, setActiveTab] = React.useState<SidebarTab>("chats")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [loading, setLoading] = React.useState(true)
    const [friends, setFriends] = React.useState<any[]>([])
    const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false)
    const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false)
    const [showSettings, setShowSettings] = React.useState(false)

    React.useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            setLoading(true)

            const [userRes, convosRes, friendsRes] = await Promise.all([
                usersApi.getMe(),
                chatApi.getConversations(),
                friendsApi.getFriends(),
            ])

            setCurrentUser(userRes.data)
            setFriends(friendsRes.data)

            const formatted = convosRes.data.map((c: any) => {
                const other = c.participants.find(
                    (p: any) => p.userId !== userRes.data.id
                )?.user

                return {
                    id: c.id,
                    name: other?.name ?? "Unknown",
                    avatar: other?.avatar ?? "",
                    lastMessage: c.messages[0]?.content ?? "No messages yet",
                    lastMessageTime: c.messages[0]?.createdAt ?? "",
                    unreadCount: 0,
                    participants: c.participants.map((p: any) => p.user),
                }
            })

            setConversations(formatted)
        } finally {
            setLoading(false)
        }
    }

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredFriends = friends.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <motion.aside
            layout
            className="flex h-full flex-col bg-[#050505] border-r border-white/5 w-full relative z-30 overflow-hidden"
        >
            {/* Background Texture Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none noise-overlay opacity-[0.03]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)]" />
            {/* HEADER - Sleek Context Zone */}
            <div className="p-6 shrink-0 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                {activeTab === "chats" ? "Messages" : "Contacts"}
                            </h2>
                            <span className="text-[11px] font-medium text-zinc-500 mt-1">
                                {conversations.length} Active Nodes
                            </span>
                        </div>
                    )}

                    <div className={cn("flex gap-2", isCollapsed && "mx-auto")}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                            onClick={() => setIsGroupModalOpen(true)}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {!isCollapsed && (
                    <div className="space-y-6">
                        {/* Search Input - Elite Style */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full h-12 pl-11 pr-4 text-sm font-medium rounded-2xl bg-[#121212] border border-white/5 outline-none focus:border-indigo-500/30 focus:bg-[#161616] transition-all placeholder:text-zinc-700"
                            />
                        </div>

                        {/* Custom Tab Switcher - Rounded Professional */}
                        <div className="flex bg-[#121212] rounded-2xl p-1 border border-white/5">
                            {(["chats", "friends"] as SidebarTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 text-[12px] font-bold py-2.5 rounded-xl transition-all duration-300",
                                        activeTab === tab
                                            ? "bg-indigo-600 text-white shadow-lg"
                                            : "text-zinc-500 hover:text-zinc-400"
                                    )}
                                >
                                    {tab === "chats" ? "Signals" : "Nodes"}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CONTENT - Chat List */}
            <ScrollArea className="flex-1 px-4 relative z-10">
                {loading ? (
                    <SidebarSkeleton />
                ) : (
                    <div className="space-y-1 py-4">
                        <AnimatePresence mode="popLayout">
                            {activeTab === "chats" &&
                                filteredConversations.map(chat => {
                                    const selected = selectedConversationId === chat.id
                                    const otherUser = chat.participants.find(p => p.id !== currentUser?.id)
                                    const isOnline = otherUser?.isOnline

                                    return (
                                        <motion.div
                                            key={chat.id}
                                            layout
                                            onClick={() => selectConversation(chat.id)}
                                            className={cn(
                                                "flex gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 relative group",
                                                selected
                                                    ? "bg-white/5 border border-white/5 shadow-2xl"
                                                    : "hover:bg-white/[0.02]"
                                            )}
                                        >
                                            {selected && (
                                                <motion.div
                                                    layoutId="active-indicator"
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                                                />
                                            )}

                                            <div className="relative shrink-0">
                                                <Avatar className="h-12 w-12 rounded-full border border-white/5 transition-transform group-hover:scale-105">
                                                    <AvatarImage src={chat.avatar} className="object-cover" />
                                                    <AvatarFallback className="bg-zinc-800 text-zinc-500 font-bold">{chat.name[0]}</AvatarFallback>
                                                </Avatar>
                                                {isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#050505] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                                )}
                                            </div>

                                            {!isCollapsed && (
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <div className="flex justify-between items-baseline mb-0.5">
                                                        <span className={cn(
                                                            "truncate text-[15px] font-semibold transition-colors",
                                                            selected ? "text-white" : "text-zinc-300 group-hover:text-white"
                                                        )}>
                                                            {chat.name}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-zinc-600 whitespace-nowrap ml-2">
                                                            {formatMessageTime(chat.lastMessageTime)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-zinc-500 truncate font-medium">
                                                        {chat.lastMessage}
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )
                                })}
                        </AnimatePresence>
                    </div>
                )}
            </ScrollArea>

            {/* FOOTER - Profile Zone */}
            {!isCollapsed && (
                <div className="p-6 shrink-0 relative z-10 border-t border-white/5 bg-[#050505]/40 backdrop-blur-xl">
                    <div className="flex items-center gap-4 group">
                        <div className="relative cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                            <Avatar className="h-10 w-10 border border-white/10 group-hover:scale-105 transition-transform">
                                <AvatarImage src={currentUser?.avatar} />
                                <AvatarFallback className="bg-zinc-800 text-white font-bold">{currentUser?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-[#080808] rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate truncate">{currentUser?.name}</p>
                            <p className="text-[11px] font-medium text-zinc-500 tracking-tight">Active Node</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                            onClick={() => setShowSettings(true)}
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
            <CreateGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
            />
            <SettingsModal
                open={showSettings}
                onOpenChange={setShowSettings}
            />
        </motion.aside>
    )
}
