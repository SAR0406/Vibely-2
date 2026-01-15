"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { usersApi } from "@/services/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { Button } from "@/components/design-system/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Link as LinkIcon, Calendar, MessageCircle, UserPlus } from "lucide-react"

export default function PublicProfilePage() {
    const params = useParams()
    const username = params.username as string
    const [user, setUser] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        if (username) {
            loadUser()
        }
    }, [username])

    const loadUser = async () => {
        try {
            const { data } = await usersApi.getByUsername(username)
            setUser(data)
        } catch (error) {
            console.error("Failed to load user", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-[#050505] text-white">Loading...</div>
    }

    if (!user) {
        return <div className="flex items-center justify-center h-screen bg-[#050505] text-white">User not found</div>
    }

    return (
        <div className="flex h-screen w-full bg-[#050505] overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            </div>

            <ScrollArea className="flex-1 h-full z-10">
                <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
                    {/* Cover & Profile Header */}
                    <div className="relative">
                        <div className="h-48 md:h-64 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                            <div className="absolute inset-0 bg-black/10" />
                        </div>
                        <div className="absolute -bottom-12 left-8 md:left-12 flex items-end">
                            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-[#050505] ring-2 ring-[#0a0a0a] shadow-xl">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-2xl">{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="absolute -bottom-12 right-8 flex gap-3">
                            <Button className="bg-white text-black hover:bg-zinc-200">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message
                            </Button>
                            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Follow
                            </Button>
                        </div>
                    </div>

                    <div className="pt-16 md:px-4 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                            <p className="text-zinc-400">@{user.username}</p>
                        </div>

                        {/* Bio & Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                {user.bio && (
                                    <p className="text-zinc-300 leading-relaxed text-lg">{user.bio}</p>
                                )}
                                <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                                    {user.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {user.location}
                                        </div>
                                    )}
                                    {user.website && (
                                        <div className="flex items-center gap-1.5">
                                            <LinkIcon className="w-4 h-4" />
                                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                                                {user.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-white/5 p-6 h-fit">
                                <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Community</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-2xl font-bold text-white">0</div>
                                        <div className="text-xs text-zinc-500">Friends</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">0</div>
                                        <div className="text-xs text-zinc-500">Posts</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
