"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
            <div className="p-4 space-y-3">
                {requests.map((request) => (
                    <div
                        key={request.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3"
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={request.from.avatar} />
                                <AvatarFallback>{request.from.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="font-medium text-white text-sm">
                                    {request.from.name}
                                </div>
                                {request.from.bio && (
                                    <div className="text-xs text-zinc-400 truncate">
                                        {request.from.bio}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="premium"
                                className="flex-1"
                                onClick={() => handleRespond(request.id, true)}
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-red-500/10 hover:border-red-500/50"
                                onClick={() => handleRespond(request.id, false)}
                            >
                                <X className="h-4 w-4 mr-1" />
                                Decline
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}
