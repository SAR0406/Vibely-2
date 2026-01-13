"use client"

import * as React from "react"
import { Search, UserPlus, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usersApi, friendsApi } from "@/services/api"
import { useRouter } from "next/navigation"

export default function SearchPage() {
    const router = useRouter()
    const [query, setQuery] = React.useState("")
    const [users, setUsers] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)
    const [requestSent, setRequestSent] = React.useState<Set<string>>(new Set())

    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 0) {
                setLoading(true)
                try {
                    const { data } = await usersApi.search(query)
                    setUsers(data)
                } catch (error) {
                    console.error("Search failed:", error)
                } finally {
                    setLoading(false)
                }
            } else {
                setUsers([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSendRequest = async (userId: string) => {
        try {
            await friendsApi.sendRequest(userId)
            setRequestSent(prev => new Set(prev).add(userId))
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to send request")
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        ← Back
                    </Button>
                    <h1 className="text-3xl font-bold text-white">Find People</h1>
                    <p className="text-zinc-400 mt-2">Search for users to connect with</p>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                    <Input
                        placeholder="Search by name or username..."
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                {loading && (
                    <div className="text-center text-zinc-400 py-8">Searching...</div>
                )}

                <div className="space-y-3">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-white">{user.name}</div>
                                    {user.username && (
                                        <div className="text-sm text-zinc-400">@{user.username}</div>
                                    )}
                                    {user.bio && (
                                        <div className="text-sm text-zinc-500 mt-1">{user.bio}</div>
                                    )}
                                </div>
                            </div>

                            {requestSent.has(user.id) ? (
                                <div className="text-sm text-green-400">Request Sent ✓</div>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="premium"
                                    onClick={() => handleSendRequest(user.id)}
                                >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Send Request
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {query.trim().length > 0 && users.length === 0 && !loading && (
                    <div className="text-center text-zinc-500 py-12">
                        No users found matching "{query}"
                    </div>
                )}
            </div>
        </div>
    )
}
