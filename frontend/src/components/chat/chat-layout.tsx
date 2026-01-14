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
            <div className="h-screen w-full bg-black relative flex flex-col">
                <div className="flex-1 w-full">
                    {!selectedConversationId ? (
                        <div className="h-full flex flex-col">
                            {/* Mobile Header */}
                            <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 bg-black/40">
                                <h1 className="text-xl font-bold text-white">Vibely</h1>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={currentUser?.avatar} />
                                    <AvatarFallback>
                                        {currentUser?.name?.[0] ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <Sidebar isCollapsed={false} />
                        </div>
                    ) : (
                        <ChatWindow />
                    )}
                </div>

                {/* Mobile Bottom Navigation */}
                {!selectedConversationId && (
                    <nav className="h-[70px] border-t border-white/5 bg-[#09090b] flex items-center justify-around px-2">
                        {[
                            { icon: MessageSquare, label: "Chats" },
                            { icon: Search, label: "Search" },
                            { icon: Bell, label: "Alerts" },
                        ].map(({ icon: Icon, label }) => (
                            <Button
                                key={label}
                                variant="ghost"
                                size="icon"
                                className="flex flex-col gap-1 text-zinc-500 hover:text-white"
                            >
                                <Icon className="h-6 w-6" />
                                <span className="text-[10px] font-medium">
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
        <div className="h-screen w-full flex text-slate-100 bg-[#050505]">
            {/* Left Rail */}
            <SidebarNav />

            {/* Main Area */}
            <div className="flex-1 flex h-full overflow-hidden">
                {/* Sidebar Panel */}
                <div
                    className={cn(
                        "h-full border-r border-white/5 relative transition-all duration-300 ease-in-out",
                        isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-[320px]"
                    )}
                >
                    <Sidebar isCollapsed={isCollapsed} />

                    {!isCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="absolute top-4 right-2 text-zinc-500 hover:text-white"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 h-full relative bg-[#0a0a0a] flex flex-col min-w-0">
                    {isCollapsed && (
                        <div className="absolute top-4 left-4 z-50">
                            <Button
                                variant="glass"
                                size="icon"
                                onClick={toggleSidebar}
                                className="h-9 w-9 bg-zinc-900/50 border border-white/10"
                            >
                                <PanelLeft className="h-4 w-4 text-indigo-400" />
                            </Button>
                        </div>
                    )}

                    {/* Subtle Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 to-[#050505]" />

                    {/* Chat Window */}
                    <div className="relative z-10 h-full w-full">
                        <ChatWindow />
                    </div>
                </div>
            </div>
        </div>
    )
}
