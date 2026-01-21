"use client"

import { cn } from "@/lib/utils"
import { motion, Variants } from "framer-motion"

interface BentoGridProps {
    className?: string
    children?: React.ReactNode
}

export const BentoGrid = ({ className, children }: BentoGridProps) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    )
}

interface BentoGridItemProps {
    className?: string
    title?: string | React.ReactNode
    description?: string | React.ReactNode
    header?: React.ReactNode
    icon?: React.ReactNode
    i?: number
}

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    i,
}: BentoGridItemProps) => {
    const variants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.4,
                ease: "easeOut"
            }
        })
    }

    return (
        <motion.div
            custom={i}
            initial="hidden"
            animate="visible"
            viewport={{ once: true }}
            variants={variants}
            className={cn(
                "row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none bg-surface/40 dark:bg-black/40 dark:border-white/5 border border-transparent justify-between flex flex-col space-y-4 shadow-sm",
                className
            )}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200 p-6 pt-0">
                {icon}
                <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
                    {title}
                </div>
                <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
                    {description}
                </div>
            </div>
        </motion.div>
    )
}
