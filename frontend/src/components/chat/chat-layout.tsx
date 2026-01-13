"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useWindowSize } from "@/hooks/use-window-size"
import { useSocket } from "@/providers/SocketProvider"
import { useChatStore } from "@/store/use-chat-store"
import { cn } from "@/lib/utils"
import { Home, Search, Bell, Video, MessageSquare, PanelLeft, PanelLeftClose } from "lucide-react"
import { Sidebar } from "./sidebar"
import { ChatWindow } from "./chat-window"
import { SidebarNav } from "./sidebar-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { Button } from "@/components/design-system/button"
import { ImperativePanelHandle } from "react-resizable-panels"

interface ChatLayoutProps {
    defaultLayout?: number[] | undefined
    navCollapsedSize?: number
}

export function ChatLayout({
    defaultLayout = [30, 70],
    navCollapsedSize = 4,
    isMobile = false
}: ChatLayoutProps & { isMobile: boolean }) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const { selectedConversationId, selectConversation, currentUser, updateUserStatus } = useChatStore()
    const socket = useSocket()

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
    }

    React.useEffect(() => {
        if (!socket) return;

        socket.on("user:status", (data: any) => {
            console.log("ChatLayout received user:status:", data);
            const lastSeenStr = data.lastSeen ? (typeof data.lastSeen === 'string' ? data.lastSeen : new Date(data.lastSeen).toISOString()) : undefined;
            updateUserStatus(data.userId, data.isOnline, lastSeenStr);
        });

        return () => {
            socket.off("user:status");
        };
    }, [socket, updateUserStatus]);

    if (isMobile) {
        return (
            <div className="h-screen w-full bg-[#050505] overflow-hidden relative flex flex-col">
                <div className="flex-1 w-full overflow-hidden relative">
                    {!selectedConversationId ? (
                        <div className="h-full w-full flex flex-col">
                            {/* Mobile Header */}
                            <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
                                <h1 className="text-xl font-bold text-white">Vibely</h1>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={currentUser?.avatar} />
                                    <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
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
                    <nav className="h-[70px] border-t border-white/5 bg-[#09090b]/90 backdrop-blur-xl flex items-center justify-around px-2 pb-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex flex-col gap-1 h-auto py-2 px-4 rounded-xl text-indigo-400 hover:bg-white/5"
                        >
                            <MessageSquare className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Chats</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex flex-col gap-1 h-auto py-2 px-4 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5"
                        >
                            <Search className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Search</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex flex-col gap-1 h-auto py-2 px-4 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5"
                        >
                            <Bell className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Alerts</span>
                        </Button>
                    </nav>
                )}
            </div>
        )
    }

    return (
        <div className="h-screen w-full bg-[#050505] overflow-hidden flex font-sans text-slate-100 selection:bg-indigo-500/30">
            {/* Global Nav Rail - Fixed Width */}
            <SidebarNav />

            {/* Content Area - Fixed Sidebar + Flexible Chat */}
            <div className="flex-1 flex h-full overflow-hidden">
                {/* Fixed Width Sidebar */}
                <div
                    className={cn(
                        "h-full border-r border-white/5 relative transition-all duration-300 ease-in-out",
                        isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-[320px] opacity-100"
                    )}
                >
                    <Sidebar isCollapsed={isCollapsed} />

                    {/* Internal Toggle Button (Top Right of Sidebar) */}
                    {!isCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="absolute top-4 right-2 z-50 h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Main Chat Area - Takes remaining space */}
                <div className="flex-1 h-full relative bg-[#0a0a0a] flex flex-col min-w-0">
                    {/* Float Toggle Button when collapsed */}
                    {isCollapsed && (
                        <div className="absolute top-4 left-4 z-50">
                            <Button
                                variant="glass"
                                size="icon"
                                onClick={toggleSidebar}
                                className="h-9 w-9 bg-zinc-900/50 backdrop-blur-md border border-white/10 hover:bg-zinc-800 transition-all shadow-xl"
                            >
                                <PanelLeft className="h-4 w-4 text-indigo-400" />
                            </Button>
                        </div>
                    )}

                    {/* Background mesh/glow for chat area */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050505] to-[#050505] pointer-events-none" />
                    <div className="relative z-10 h-full w-full">
                        <ChatWindow />
                    </div>
                </div>
            </div>
        </div>
    )
}
