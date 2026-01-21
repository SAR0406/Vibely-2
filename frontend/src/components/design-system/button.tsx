"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "glass" | "outline" | "neon"
    size?: "sm" | "md" | "lg" | "icon" | "xl"
    isLoading?: boolean
    asChild?: boolean
    children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, asChild = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : motion.button

        const variants = {
            primary: "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_var(--color-primary)] hover:shadow-[0_0_30px_-5px_var(--color-primary)] hover:brightness-110 border border-white/10",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/5",
            ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
            glass: "glass-card text-white hover:bg-white/10 hover:border-white/20 shadow-xl",
            danger: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20",
            outline: "bg-transparent border border-white/10 hover:bg-white/5 hover:text-white",
            neon: "bg-transparent border border-primary/50 text-primary shadow-[0_0_15px_-3px_var(--color-primary)] hover:bg-primary hover:text-white transition-all duration-500"
        }

        const sizes = {
            sm: "h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl",
            md: "h-11 px-6 text-sm rounded-2xl",
            lg: "h-14 px-8 text-base rounded-[20px]",
            xl: "h-16 px-10 text-lg font-bold rounded-[24px]",
            icon: "h-11 w-11 flex items-center justify-center rounded-2xl"
        }

        const motionProps = asChild ? {} : {
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 },
            transition: { type: "spring", stiffness: 400, damping: 17 }
        }

        // Merge motion props with passed props
        const combinedProps = {
            ...motionProps,
            ...props
        }

        return (
            <Comp
                ref={ref as any}
                className={cn(
                    "relative font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-accent/50",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ring-offset-background",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...(combinedProps as any)}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {!isLoading && children}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button }
