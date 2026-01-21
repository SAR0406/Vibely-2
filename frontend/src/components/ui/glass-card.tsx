"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

interface GlassCardProps extends HTMLMotionProps<"div"> {
    variant?: "default" | "neon" | "minimal" | "deep"
    hoverEffect?: boolean,
    gradient?: boolean
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, variant = "default", hoverEffect = true, gradient = false, children, ...props }, ref) => {

        const variants = {
            default: "bg-white/[0.03] border-white/10 shadow-2xl backdrop-blur-xl",
            neon: "bg-[#0a0a0a]/80 border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.1)] backdrop-blur-2xl",
            minimal: "bg-transparent border-white/5 backdrop-blur-lg",
            deep: "bg-black/60 border-white/5 backdrop-blur-3xl"
        }

        const gradientOverlay = gradient ? (
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-[inherit]" />
        ) : null

        return (
            <motion.div
                ref={ref}
                whileHover={hoverEffect ? { y: -2, scale: 1.005 } : undefined}
                className={cn(
                    "relative rounded-3xl border overflow-hidden",
                    variants[variant],
                    hoverEffect && "transition-all duration-300 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]",
                    className
                )}
                {...props}
            >
                {gradientOverlay}
                <div className="relative z-10">
                    {children}
                </div>
            </motion.div>
        )
    }
)
GlassCard.displayName = "GlassCard"
