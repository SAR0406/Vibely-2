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
    ({ className, variant = "default", hoverEffect = true, gradient = false, children, role = "region", ...props }, ref) => {

        const variants = {
            default: "bg-surface/50 border-glass-border shadow-2xl backdrop-blur-xl", // Changed border-border to border-glass-border
            neon: "bg-surface-elevated/80 border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.1)] backdrop-blur-2xl",
            minimal: "bg-transparent border-glass-border backdrop-blur-lg",
            deep: "bg-canvas/60 border-glass-border backdrop-blur-3xl"
        }

        const gradientOverlay = gradient ? (
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-[inherit]" />
        ) : null

        return (
            <motion.div
                ref={ref}
                role={role}
                tabIndex={0}
                whileHover={hoverEffect ? { y: -2, scale: 1.005 } : undefined}
                className={cn(
                    "relative rounded-3xl border overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", // Reduced motion handled by global css or preferences usually, but good to have standard focus
                    variants[variant],
                    // A11y: High contrast border for forced-colors mode
                    "forced-colors:border-[CanvasText]",
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
