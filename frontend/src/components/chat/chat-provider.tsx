"use client"

import { useSocket } from "@/hooks/use-socket"

export function ChatProvider({ children }: { children: React.ReactNode }) {
    useSocket() // Initialize socket connection

    return <>{children}</>
}
