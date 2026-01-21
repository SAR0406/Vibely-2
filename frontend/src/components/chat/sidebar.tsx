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
            className="flex h-full flex-col bg-[#050505] border-r border-white/5 w-full relative z-30"
        >
            {/* HEADER - Nexus Context Zone */}
            <div className="p-6 shrink-0 space-y-6">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-white tracking-widest uppercase">
                                {activeTab === "chats" ? "Signal List" : "Nodes"}
                            </h2>
                            <span className="text-[9px] font-black text-zinc-600 tracking-[0.3em] uppercase mt-1">Nexus Core Active</span>
                        </div>
                    )}

                    <div className={cn("flex gap-2", isCollapsed && "mx-auto")}>
                        <Button
                            size="icon"
                            variant="glass"
                            className="h-10 w-10 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105 transition-all"
                            onClick={() => setIsGroupModalOpen(true)}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>

                        {currentUser?.role === "ADMIN" && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="glass"
                                            className="h-10 w-10 rounded-2xl bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 shadow-lg shadow-indigo-500/10"
                                            onClick={() => router.push("/admin/dashboard")}
                                        >
                                            <Shield className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Admin Panel</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>

                {!isCollapsed && (
                    <div className="space-y-4">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-4 rounded-2xl px-4 py-6 text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                            onClick={() => router.push("/dashboard")}
                        >
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                <LayoutGrid className="h-4 w-4" />
                            </div>
                            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Back to Core</span>
                        </Button>

                        {/* Switcher Tab */}
                        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
                            {(["chats", "friends"] as SidebarTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 text-[9px] font-black uppercase tracking-[0.2em] py-2.5 rounded-xl transition-all duration-300",
                                        activeTab === tab
                                            ? "bg-white text-black shadow-lg"
                                            : "text-zinc-600 hover:text-zinc-400"
                                    )}
                                >
                                    {tab === "chats" ? "Signals" : "Nodes"}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Scan Nexus..."
                                className="w-full h-11 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-white/[0.03] border border-white/5 outline-none focus:border-cyan-400/30 focus:bg-white/[0.05] transition-all"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* CONTENT - Signal Area */}
            <ScrollArea className="flex-1 px-4">
                {loading ? (
                    <SidebarSkeleton />
                ) : (
                    <div className="space-y-2 py-2">
                        <AnimatePresence mode="popLayout">
                            {activeTab === "chats" &&
                                filteredConversations.map(chat => {
                                    const selected = selectedConversationId === chat.id
                                    return (
                                        <motion.div
                                            key={chat.id}
                                            layout
                                            onClick={() => selectConversation(chat.id)}
                                            className={cn(
                                                "flex gap-4 p-4 rounded-3xl cursor-pointer transition-all duration-300 relative group",
                                                selected
                                                    ? "bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-transparent border border-indigo-500/20 shadow-xl shadow-indigo-500/10"
                                                    : "hover:bg-white/5 border border-transparent hover:border-white/5"
                                            )}
                                        >
                                            {selected && (
                                                <motion.div
                                                    layoutId="active-indicator"
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                                                />
                                            )}

                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border border-white/10 group-hover:scale-105 transition-transform">
                                                    <AvatarImage src={chat.avatar} className="object-cover" />
                                                    <AvatarFallback className="bg-zinc-800 text-zinc-500 font-black">{chat.name[0]}</AvatarFallback>
                                                </Avatar>
                                                {/* Status indicator could go here if available */}
                                            </div>

                                            {!isCollapsed && (
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <span className={cn(
                                                            "truncate text-sm tracking-tight font-bold transition-colors",
                                                            selected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                                                        )}>
                                                            {chat.name}
                                                        </span>
                                                        <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase">
                                                            {formatMessageTime(chat.lastMessageTime)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-600 truncate font-medium tracking-tight">
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

            {/* FOOTER - Nexus Identity Card */}
            {!isCollapsed && (
                <div className="p-6 shrink-0">
                    <div className="glass-card p-4 group cursor-default hover:border-white/20 transition-all duration-500">
                        <div
                            className="flex gap-4 items-center cursor-pointer"
                            onClick={() => setIsProfileModalOpen(true)}
                        >
                            <div className="relative">
                                <Avatar className="h-10 w-10 border border-white/10 group-hover:rotate-12 transition-transform">
                                    <AvatarImage src={currentUser?.avatar} />
                                    <AvatarFallback className="bg-zinc-800 text-white font-bold">{currentUser?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-white uppercase tracking-wider truncate">
                                    {currentUser?.name}
                                </p>
                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-0.5 ring-emerald-500/20">Authorized Node</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-600 hover:text-white"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowSettings(true)
                                }}
                            >
                                <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-700" />
                            </Button>
                        </div>
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
