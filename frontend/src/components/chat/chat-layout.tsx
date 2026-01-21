"use client"

import * as React from "react"
import { useWindowSize } from "@/hooks/use-window-size"
import { useSocket } from "@/providers/SocketProvider"
import { useChatStore } from "@/store/use-chat-store"
import { cn } from "@/lib/utils"
import {
    Home,
    Search,
    Bell,
    MessageSquare,
    PanelLeft,
    PanelLeftClose,
} from "lucide-react"

import { Sidebar } from "./sidebar"
import { ChatWindow } from "./chat-window"
import { SidebarNav } from "./sidebar-nav"
import { GlassBottomNav } from "@/components/layout/glass-bottom-nav"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { Button } from "@/components/design-system/button"

interface ChatLayoutProps {
    defaultLayout?: number[]
    navCollapsedSize?: number
    isMobile: boolean
}

export function ChatLayout({
    defaultLayout = [30, 70],
    navCollapsedSize = 4,
    isMobile,
}: ChatLayoutProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const { selectedConversationId, currentUser, updateUserStatus } = useChatStore()
    const socket = useSocket()
    const { width } = useWindowSize()

    React.useEffect(() => {
        if (!socket) return

        const handleStatus = (data: any) => {
            const lastSeenStr = data.lastSeen
                ? typeof data.lastSeen === "string"
                    ? data.lastSeen
                    : new Date(data.lastSeen).toISOString()
                : undefined

            updateUserStatus(data.userId, data.isOnline, lastSeenStr)
        }

        socket.on("user:status", handleStatus)
        return () => void socket.off("user:status", handleStatus)
    }, [socket, updateUserStatus])

    const toggleSidebar = () => setIsCollapsed((prev) => !prev)

    // ** MOBILE RENDERING **
    if (isMobile) {
        return (
            <div className="h-screen w-full bg-[#050505] relative flex flex-col overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
                </div>

                <div className="flex-1 w-full relative z-10 flex flex-col">
                    {!selectedConversationId ? (
                        <div className="h-full flex flex-col">
                            {/* Mobile Header */}
                            <div className="h-20 px-6 flex items-center justify-between border-b border-white/5 bg-[#050505]/60 backdrop-blur-3xl shrink-0 z-20">
                                <div className="flex flex-col">
                                    <h1 className="text-xl font-bold text-white tracking-tight">Vibely</h1>
                                    <span className="text-[11px] font-medium text-cyan-400 mt-0.5 tracking-wide uppercase">Mobile Node</span>
                                </div>
                                <Avatar className="h-10 w-10 border border-white/10 rounded-xl shadow-lg">
                                    <AvatarImage src={currentUser?.avatar} />
                                    <AvatarFallback className="bg-zinc-800 text-white font-black">
                                        {currentUser?.name?.[0] ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-1 overflow-hidden relative z-10">
                                <Sidebar isCollapsed={false} />
                            </div>
                        </div>
                    ) : (
                        <ChatWindow />
                    )}
                </div>

                {/* Mobile Bottom Navigation - Glass */}
                {!selectedConversationId && <GlassBottomNav />}
            </div>
        )
    }

    // ** DESKTOP RENDERING **
    return (
        <div className="h-screen w-full flex text-slate-100 bg-[#050505] overflow-hidden selection:bg-indigo-500/30 relative">
            {/* Global Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/10 via-background to-background" />
            </div>

            {/* Left Rail */}
            <SidebarNav />

            {/* Main Area */}
            <div className="flex-1 flex h-full overflow-hidden relative z-10">
                {/* Sidebar Panel - Glass */}
                <div
                    className={cn(
                        "h-full border-r border-white/5 relative transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) backdrop-blur-md bg-black/20",
                        isCollapsed ? "w-0 opacity-0 -translate-x-full" : "w-[360px] opacity-100 translate-x-0"
                    )}
                >
                    <Sidebar isCollapsed={isCollapsed} />

                    {!isCollapsed && (
                        <div className="absolute top-6 right-4 z-50">
                            <Button
                                variant="glass"
                                size="icon"
                                onClick={toggleSidebar}
                                className="h-8 w-8 text-zinc-500 hover:text-white rounded-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all"
                            >
                                <PanelLeftClose className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 h-full relative flex flex-col min-w-0 bg-transparent">
                    {isCollapsed && (
                        <div className="absolute top-6 left-6 z-50">
                            <Button
                                variant="glass"
                                size="icon"
                                onClick={toggleSidebar}
                                className="h-10 w-10 bg-white/5 border border-white/10 rounded-2xl hover:scale-110 shadow-2xl shadow-indigo-500/10 backdrop-blur-md"
                            >
                                <PanelLeft className="h-5 w-5 text-cyan-400" />
                            </Button>
                        </div>
                    )}

                    {/* Chat Window */}
                    <div className="relative z-10 h-full w-full">
                        <ChatWindow />
                    </div>
                </div>
            </div>
        </div>
    )
}
