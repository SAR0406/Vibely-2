"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    LayoutDashboard,
    Users,
    Settings,
    MessageSquare,
    ShieldAlert,
    LogOut,
    Menu,
    X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { cookieUtils } from "@/lib/cookies"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "User Management", href: "/admin/users" },
    { icon: MessageSquare, label: "Conversations", href: "/admin/conversations" },
    { icon: ShieldAlert, label: "Reports", href: "/admin/reports" },
    { icon: Settings, label: "System Settings", href: "/admin/settings" },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    React.useEffect(() => {
        const user = cookieUtils.getUser()
        if (user) {
            if (user.role !== 'ADMIN') {
                router.push('/chat')
            }
        } else {
            router.push('/login')
        }
    }, [router])

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-black/40 border-r border-white/10 backdrop-blur-xl transition-transform duration-300 md:relative md:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <Link href="/admin/dashboard" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <span className="text-xl font-bold">V</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">Vibely Admin</span>
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                    pathname === item.href
                                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    pathname === item.href ? "text-purple-400" : "text-zinc-500 group-hover:text-zinc-300"
                                )} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-white/10">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                            onClick={() => {
                                cookieUtils.clearAll()
                                router.push('/login')
                            }}
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col relative">
                {/* Header for mobile */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-40">
                    <span className="font-bold">Vibely Admin</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
