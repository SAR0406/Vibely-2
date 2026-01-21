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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />

                <div className="flex-1 w-full relative z-10 flex flex-col">
                    {!selectedConversationId ? (
                        <div className="h-full flex flex-col">
                            {/* Mobile Header */}
                            <div className="h-20 px-6 flex items-center justify-between border-b border-white/5 bg-[#050505]/40 backdrop-blur-3xl shrink-0">
                                <div className="flex flex-col">
                                    <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase">Vibely</h1>
                                    <span className="text-[8px] font-black text-zinc-600 tracking-[0.3em] uppercase mt-1">Nexus Mobile Node</span>
                                </div>
                                <Avatar className="h-10 w-10 border border-white/10 rounded-xl">
                                    <AvatarImage src={currentUser?.avatar} />
                                    <AvatarFallback className="bg-zinc-800 text-white font-black">
                                        {currentUser?.name?.[0] ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <Sidebar isCollapsed={false} />
                            </div>
                        </div>
                    ) : (
                        <ChatWindow />
                    )}
                </div>

                {/* Mobile Bottom Navigation */}
                {!selectedConversationId && (
                    <nav className="h-20 border-t border-white/5 bg-[#050505]/80 backdrop-blur-3xl flex items-center justify-around px-6 relative z-10 pb-safe">
                        {[
                            { icon: MessageSquare, label: "Signals" },
                            { icon: Search, label: "Scan" },
                            { icon: Bell, label: "Alerts" },
                        ].map(({ icon: Icon, label }) => (
                            <Button
                                key={label}
                                variant="ghost"
                                size="icon"
                                className="flex flex-col gap-1.5 text-zinc-600 hover:text-cyan-400 transition-colors h-14 w-14 rounded-2xl"
                            >
                                <Icon className="h-6 w-6" />
                                <span className="text-[8px] font-black uppercase tracking-[0.1em]">
                                    {label}
                                </span>
                            </Button>
                        ))}
                    </nav>
                )}
            </div>
        )
    }

    // ** DESKTOP RENDERING **
    return (
        <div className="h-screen w-full flex text-slate-100 bg-[#050505] overflow-hidden selection:bg-indigo-500/30">
            {/* Left Rail */}
            <SidebarNav />

            {/* Main Area */}
            <div className="flex-1 flex h-full overflow-hidden relative">
                {/* Sidebar Panel */}
                <div
                    className={cn(
                        "h-full border-r border-white/5 relative transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
                        isCollapsed ? "w-0 opacity-0 -translate-x-full" : "w-[340px] opacity-100 translate-x-0"
                    )}
                >
                    <Sidebar isCollapsed={isCollapsed} />

                    {!isCollapsed && (
                        <div className="absolute top-6 right-4 z-50">
                            <Button
                                variant="glass"
                                size="icon"
                                onClick={toggleSidebar}
                                className="h-10 w-10 text-zinc-500 hover:text-white rounded-2xl bg-white/5 border-white/10"
                            >
                                <PanelLeftClose className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 h-full relative bg-[#050505] flex flex-col min-w-0">
                    {isCollapsed && (
                        <div className="absolute top-6 left-6 z-50">
                            <Button
                                variant="glass"
                                size="icon"
                                onClick={toggleSidebar}
                                className="h-10 w-10 bg-white/5 border border-white/10 rounded-2xl hover:scale-110 shadow-2xl shadow-indigo-500/10"
                            >
                                <PanelLeft className="h-4 w-4 text-cyan-400" />
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
