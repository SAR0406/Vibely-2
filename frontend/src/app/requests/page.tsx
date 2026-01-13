"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RequestsPanel } from "@/components/chat/requests-panel"

export default function RequestsPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    ← Back to Chat
                </Button>

                <h1 className="text-3xl font-bold text-white mb-2">Friend Requests</h1>
                <p className="text-zinc-400 mb-8">Pending connection requests</p>

                <RequestsPanel />
            </div>
        </div>
    )
}
