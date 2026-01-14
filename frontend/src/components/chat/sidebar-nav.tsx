"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Bell, Settings, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/design-system/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar";
import { useChatStore } from "@/store/use-chat-store";
import { SettingsModal } from "../settings/settings-modal";

const NAV_WIDTH = 72;
const NAV_MIN_WIDTH = 72;

const navItems = [
    { icon: Home, label: "Chats", path: "/chat", id: "chat" },
    { icon: Search, label: "Explore", path: "/search", id: "search" },
    { icon: Bell, label: "Requests", path: "/requests", id: "requests" },
    { icon: Settings, label: "Settings", path: "/settings", id: "settings" },
];

export function SidebarNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { currentUser } = useChatStore();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const handleNavClick = (item: any) => {
        if (item.id === "settings") {
            setIsSettingsOpen(true);
        } else {
            router.push(item.path);
        }
    };

    return (
        <motion.aside
            layout
            className="flex flex-col h-full bg-[#050505] border-r border-white/5 z-50"
            style={{
                width: NAV_WIDTH,
                minWidth: NAV_MIN_WIDTH,
            }}
        >
            {/* LOGO */}
            <div className="flex justify-center py-4 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.35)] hover:scale-105 transition-transform cursor-pointer border border-white/10">
                    <span className="font-bold text-white text-xl">V</span>
                </div>
            </div>

            {/* NAVIGATION */}
            <div className="flex-1 flex flex-col items-center gap-3 py-4">
                <TooltipProvider delayDuration={0}>
                    {navItems.map((item) => {
                        const isActive =
                            item.id === "settings"
                                ? isSettingsOpen
                                : pathname.startsWith(item.path);

                        const Icon = item.icon;

                        return (
                            <Tooltip key={item.id}>
                                <TooltipTrigger asChild>
                                    <div className="relative w-full flex justify-center group">
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-indicator"
                                                className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 28,
                                                }}
                                            />
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleNavClick(item)}
                                            className={cn(
                                                "h-10 w-10 rounded-xl transition-all duration-200",
                                                isActive
                                                    ? "bg-indigo-500/10 text-indigo-100"
                                                    : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "h-5 w-5 transition-transform",
                                                    isActive
                                                        ? "scale-110"
                                                        : "group-hover:scale-110"
                                                )}
                                            />
                                        </Button>
                                    </div>
                                </TooltipTrigger>

                                <TooltipContent
                                    side="right"
                                    className="bg-[#18181b] border-white/10 text-zinc-100 font-medium px-3 py-1.5 ml-2"
                                >
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>

            {/* FOOTER */}
            <div className="py-4 flex flex-col items-center gap-4 shrink-0">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="h-10 w-10 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent
                            side="right"
                            className="bg-[#18181b] border-white/10 text-red-400 font-medium ml-2"
                        >
                            Logout
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="relative p-0.5 rounded-full border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
                                <Avatar className="h-10 w-10 bg-zinc-900">
                                    <AvatarImage src={currentUser?.avatar} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                                        {currentUser?.name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#050505] rounded-full" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent
                            side="right"
                            className="bg-[#18181b] border-white/10 text-zinc-100 font-medium ml-2"
                        >
                            {currentUser?.name || "Profile"}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <SettingsModal
                Open={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentUser={currentUser}
            />
        </motion.aside>
    );
}
