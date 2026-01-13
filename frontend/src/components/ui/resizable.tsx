"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import { Group, Panel, Separator } from "react-resizable-panels"
import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
    className,
    ...props
}: React.ComponentProps<typeof Group>) => (
    <Group
        className={cn(
            "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
            className
        )}
        {...props}
    />
)

const ResizablePanel = Panel

const ResizableHandle = ({
    withHandle,
    className,
    ...props
}: React.ComponentProps<typeof Separator> & { withHandle?: boolean }) => (
    <Separator
        className={cn(
            "relative flex w-4 items-center justify-center bg-transparent transition-all duration-300 group focus-visible:outline-none data-[panel-group-direction=vertical]:h-4 data-[panel-group-direction=vertical]:w-full hover:cursor-col-resize data-[panel-group-direction=vertical]:hover:cursor-row-resize z-50",
            className
        )}
        {...props}
    >
        {/* The visual minimalist line */}
        <div className="z-10 h-full w-[3px] bg-white/5 transition-all duration-300 group-hover:bg-indigo-500/50 group-active:bg-indigo-500 group-hover:w-[6px] rounded-full" />

        {/* The "Handle" Grip */}
        {withHandle && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 p-1.5 items-center justify-center rounded-full bg-zinc-900 border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-xl shadow-black/50">
                <GripVertical className="h-4 w-4 text-zinc-400" />
            </div>
        )}

        {/* Gradient Ambient glow effect on hover */}
        <div className="absolute inset-y-0 -inset-x-4 z-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent pointer-events-none" />
    </Separator>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
