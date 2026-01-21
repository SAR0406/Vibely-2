"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, MessageSquare, Bell, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/design-system/button"

const NAV_ITEMS = [
    { id: "dashboard", label: "Home", path: "/dashboard", icon: Home },
    { id: "chat", label: "Chat", path: "/chat", icon: MessageSquare },
    { id: "events", label: "Events", path: "/events", icon: Calendar },
    { id: "notifications", label: "Alerts", path: "/notifications", icon: Bell },
    { id: "profile", label: "Profile", path: "/profile", icon: User }, // Or handling profile modal
] as const

export function GlassBottomNav() {
    const router = useRouter()
    const pathname = usePathname() || ""

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#050505]/80 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-6 z-50 pb-safe pb-2 md:hidden">
            {NAV_ITEMS.map(({ id, label, path, icon: Icon }) => {
                const isActive = pathname.startsWith(path) || (path === "/dashboard" && pathname === "/")

                return (
                    <Button
                        key={id}
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(path)}
                        className={cn(
                            "flex flex-col gap-1 transition-all h-full w-14 rounded-xl hover:bg-white/5 relative group",
                            isActive ? "text-indigo-400" : "text-zinc-500 hover:text-indigo-300"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="active-tab"
                                className="absolute -top-[1px] left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)] mx-2 rounded-full"
                            />
                        )}
                        <Icon className={cn("h-6 w-6 transition-transform duration-300", isActive && "scale-110")} />
                        <span className="text-[9px] font-bold tracking-tight uppercase">
                            {label}
                        </span>
                    </Button>
                )
            })}
        </nav>
    )
}
