"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
        status?: "online" | "offline" | "busy" | "away"
        size?: "sm" | "md" | "lg" | "xl"
    }
>(({ className, status, size = "md", ...props }, ref) => {

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-14 w-14",
        xl: "h-20 w-20"
    }

    const statusColor = {
        online: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
        offline: "bg-zinc-500",
        busy: "bg-red-500",
        away: "bg-amber-500"
    }

    const statusSize = {
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-3.5 w-3.5",
        xl: "h-5 w-5 border-4"
    }

    return (
        <div className="relative inline-block group/avatar">
            <AvatarPrimitive.Root
                ref={ref}
                className={cn(
                    "relative flex shrink-0 overflow-hidden border border-white/5 shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105",
                    size === "sm" ? "rounded-xl" : size === "md" ? "rounded-2xl" : "rounded-[24px]",
                    sizeClasses[size],
                    className
                )}
                {...props}
            />
            {status && (
                <div className={cn(
                    "absolute bottom-0 right-0 rounded-full border-2 border-[#050505] z-10",
                    statusColor[status],
                    statusSize[size]
                )}>
                    {status === "online" && (
                        <div className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-40" />
                    )}
                </div>
            )}
        </div>
    )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
    />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium uppercase",
            className
        )}
        {...props}
    />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
