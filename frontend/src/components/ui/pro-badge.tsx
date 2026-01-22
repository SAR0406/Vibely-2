"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Crown, Diamond } from "lucide-react"

interface ProBadgeProps {
    tier: "PRO" | "BUSINESS" | "FREE"
    size?: "sm" | "md" | "lg"
    showLabel?: boolean
    className?: string
}

export function ProBadge({ tier, size = "sm", showLabel = true, className }: ProBadgeProps) {
    if (tier === "FREE") return null

    const sizeClasses = {
        sm: "h-4 px-1.5 text-[10px] gap-0.5",
        md: "h-5 px-2 text-xs gap-1",
        lg: "h-6 px-2.5 text-sm gap-1.5",
    }

    const iconSizes = {
        sm: "w-2.5 h-2.5",
        md: "w-3 h-3",
        lg: "w-4 h-4",
    }

    const isPro = tier === "PRO"

    return (
        <span
            className={cn(
                "inline-flex items-center font-bold uppercase tracking-wide rounded-full",
                isPro
                    ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30",
                sizeClasses[size],
                className
            )}
        >
            {isPro ? (
                <Crown className={iconSizes[size]} />
            ) : (
                <Diamond className={iconSizes[size]} />
            )}
            {showLabel && (
                <span>{isPro ? "Pro" : "Business"}</span>
            )}
        </span>
    )
}

// Inline badge for next to usernames
export function ProBadgeInline({ tier, className }: { tier: "PRO" | "BUSINESS" | "FREE", className?: string }) {
    if (tier === "FREE") return null

    const isPro = tier === "PRO"

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center w-4 h-4 rounded-full ml-1",
                isPro
                    ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                    : "bg-gradient-to-br from-cyan-400 to-blue-500",
                className
            )}
            title={isPro ? "Pro Member" : "Business Member"}
        >
            {isPro ? (
                <Crown className="w-2.5 h-2.5 text-white" />
            ) : (
                <Diamond className="w-2.5 h-2.5 text-white" />
            )}
        </span>
    )
}
