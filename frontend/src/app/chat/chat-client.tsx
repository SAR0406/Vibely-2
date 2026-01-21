"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatLayout } from "@/components/chat/chat-layout"
import { ChatProvider } from "@/components/chat/chat-provider"
import { cookieUtils } from "@/lib/cookies"

interface ChatClientProps {
    defaultLayout: number[] | undefined
    isMobile: boolean
}

export function ChatClient({ defaultLayout, isMobile }: ChatClientProps) {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const token = cookieUtils.getToken()
        if (!token) {
            router.push('/login')
            setIsLoading(false)
            return
        }
        setIsAuthenticated(true)
        setIsLoading(false)
    }, [router])

    if (isLoading) {
        return (
            <main className="flex h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="text-white">Loading...</div>
            </main>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <main className="flex h-screen flex-col items-center justify-between">
            <ChatProvider>
                <ChatLayout
                    defaultLayout={defaultLayout}
                    navCollapsedSize={4}
                    isMobile={isMobile}
                />
            </ChatProvider>
        </main>
    )
}
