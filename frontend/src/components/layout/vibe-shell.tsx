"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface VibeShellProps extends React.HTMLAttributes<HTMLDivElement> {
    headerContent?: React.ReactNode
    sidebarContent?: React.ReactNode
}

export function VibeShell({
    children,
    headerContent,
    sidebarContent,
    className,
    ...props
}: VibeShellProps) {
    return (
        <div className={cn("min-h-screen bg-background text-foreground flex", className)} {...props}>
            {/* Glass Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-glass-border bg-glass-surface backdrop-blur-xl z-40 hidden md:block">
                <div className="h-full px-4 py-6 scrollbar-thin scrollbar-thumb-primary/20">
                    {sidebarContent}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full">
                {/* Sticky Glass Header */}
                <header className="sticky top-0 z-30 h-16 w-full border-b border-glass-border bg-glass-surface backdrop-blur-xl px-6 flex items-center justify-between">
                    {headerContent}
                </header>

                {/* Page Content with Transition */}
                <main className="flex-1 p-6 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="w-full h-full max-w-7xl mx-auto space-y-6"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>

                    {/* Ambient Background Elements */}
                    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full opacity-50 mix-blend-screen animate-pulse-glow" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/20 blur-[100px] rounded-full opacity-30 mix-blend-screen" />
                    </div>
                </main>
            </div>
        </div>
    )
}
