"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { Button } from "@/components/design-system/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { friendsApi } from "@/services/api"

export function RequestsPanel() {
    const [requests, setRequests] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        loadRequests()
    }, [])

    const loadRequests = async () => {
        try {
            const { data } = await friendsApi.getPendingRequests()
            setRequests(data)
        } catch (error) {
            console.error("Failed to load requests:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRespond = async (id: string, accept: boolean) => {
        try {
            await friendsApi.respondToRequest(id, accept)
            setRequests(prev => prev.filter(req => req.id !== id))
        } catch (error) {
            console.error("Failed to respond:", error)
        }
    }

    if (loading) {
        return <div className="text-zinc-400 text-sm p-4">Loading...</div>
    }

    if (requests.length === 0) {
        return (
            <div className="text-zinc-500 text-sm p-4 text-center">
                No pending requests
            </div>
        )
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
                {requests.map((request) => (
                    <div
                        key={request.id}
                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4 hover:bg-white/[0.04] transition-all group/item"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-10 w-10 border border-white/10 group-hover/item:scale-105 transition-transform">
                                    <AvatarImage src={request.from.avatar} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-500">{request.from.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-white text-xs uppercase tracking-widest truncate">
                                    {request.from.name}
                                </div>
                                <div className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                                    {request.from.bio || "Incoming Signal..."}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="primary"
                                className="flex-1 h-9"
                                onClick={() => handleRespond(request.id, true)}
                            >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Accept
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-9 border-white/5 hover:border-rose-500/50 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400"
                                onClick={() => handleRespond(request.id, false)}
                            >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Decline
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}
