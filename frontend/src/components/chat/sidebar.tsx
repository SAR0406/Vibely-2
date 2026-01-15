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
            className="flex h-full flex-col bg-[#050505] border-r border-white/5 w-full"
        >
            {/* HEADER */}
            <div className="p-4 shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <h2 className="text-lg font-semibold text-white">
                            {activeTab === "chats" ? "Messages" : "Friends"}
                        </h2>
                    )}

                    <div className={cn("flex gap-1", isCollapsed && "mx-auto")}>
                        <Button
                            size="icon"
                            variant="ghost"
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
                                            variant="ghost"
                                            onClick={() => router.push("/admin/dashboard")}
                                        >
                                            <Shield className="h-4 w-4 text-purple-400" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Admin Panel</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>

                {!isCollapsed && (
                    <>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 rounded-xl px-3 text-zinc-400 hover:text-white hover:bg-white/5 mb-2"
                            onClick={() => router.push("/dashboard")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            <span className="font-medium">Dashboard</span>
                        </Button>

                        <div className="flex bg-white/5 rounded-lg p-1">
                            {(["chats", "friends"] as SidebarTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 text-xs py-1.5 rounded-md transition",
                                        activeTab === tab
                                            ? "bg-white/10 text-white"
                                            : "text-zinc-500 hover:text-white"
                                    )}
                                >
                                    {tab === "chats" ? "Chats" : "Friends"}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full h-9 pl-9 text-xs rounded-lg bg-white/5 border border-white/10 outline-none focus:border-indigo-500"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* CONTENT */}
            <ScrollArea className="flex-1 px-2">
                {loading ? (
                    <SidebarSkeleton />
                ) : (
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
                                            "flex gap-3 p-3 rounded-xl cursor-pointer transition",
                                            selected
                                                ? "bg-indigo-500/15"
                                                : "hover:bg-white/5"
                                        )}
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={chat.avatar} />
                                            <AvatarFallback>{chat.name[0]}</AvatarFallback>
                                        </Avatar>

                                        {!isCollapsed && (
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between text-sm">
                                                    <span className="truncate text-white">
                                                        {chat.name}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500">
                                                        {formatMessageTime(chat.lastMessageTime)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-500 truncate">
                                                    {chat.lastMessage}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                    </AnimatePresence>
                )}
            </ScrollArea>

            {/* FOOTER */}
            {!isCollapsed && (
                <div className="p-3 border-t border-white/5">
                    <div
                        className="flex gap-3 items-center cursor-pointer hover:bg-white/5 p-2 rounded-lg"
                        onClick={() => setIsProfileModalOpen(true)}
                    >
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={currentUser?.avatar} />
                            <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xs font-semibold text-white">
                                {currentUser?.name}
                            </p>
                            <p className="text-[10px] text-emerald-400">Online</p>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 px-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 rounded-xl px-3 text-zinc-400 hover:text-white hover:bg-white/5 group"
                            onClick={() => setShowSettings(true)}
                        >
                            <Settings className="h-5 w-5 group-hover:rotate-45 transition-transform" />
                            <span className="font-medium">Settings</span>
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
