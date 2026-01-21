"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"
import { motion } from "framer-motion"

interface VibeButtonProps extends ButtonProps {
    glow?: boolean
}

export const VibeButton = React.forwardRef<HTMLButtonElement, VibeButtonProps>(
    ({ className, variant, glow = false, children, ...props }, ref) => {
        return (
            <motion.div
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                className="relative inline-block"
                // A11y: Respect reduced motion preferences
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                {glow && (
                    <div
                        className="absolute inset-0 bg-primary/40 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-full motion-reduce:hidden"
                        aria-hidden="true"
                    />
                )}
                <Button
                    ref={ref}
                    className={cn(
                        "relative",
                        variant === "default" && "bg-gradient-to-r from-primary to-brand-600 hover:from-primary/90 hover:to-brand-600/90 shadow-[0_0_20px_rgba(139,92,246,0.3)] light:shadow-[0_5px_15px_rgba(139,92,246,0.4)] border-0 text-primary-foreground",
                        variant === "outline" && "border-2 border-primary/20 hover:border-primary/50 bg-transparent text-primary hover:bg-primary/5 light:border-primary/40",
                        variant === "ghost" && "hover:bg-primary/10 text-muted-foreground hover:text-foreground",
                        "rounded-xl font-bold tracking-wide transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        className
                    )}
                    variant={variant}
                    {...props}
                >
                    {children}
                </Button>
            </motion.div>
        )
    }
)
VibeButton.displayName = "VibeButton"
