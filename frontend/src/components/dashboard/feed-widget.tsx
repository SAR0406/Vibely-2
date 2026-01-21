"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon, Activity } from "lucide-react"
import { feedApi } from "@/services/api"
import { useChatStore } from "@/store/use-chat-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { Button } from "@/components/design-system/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

import { VibePostCard } from "../social/vibe-post-card"

export function FeedWidget() {
    const { currentUser } = useChatStore()
    const [posts, setPosts] = React.useState<any[]>([])
    const [newPostContent, setNewPostContent] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        loadFeed()
    }, [])

    const loadFeed = async () => {
        try {
            const { data } = await feedApi.getFeed()
            setPosts(data)
        } catch (error) {
            console.error("Failed to load feed", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return

        try {
            const formData = new FormData()
            formData.append('content', newPostContent)
            await feedApi.createPost(formData)
            setNewPostContent("")
            loadFeed()
        } catch (error) {
            console.error("Failed to create post", error)
        }
    }

    const handleLike = async (postId: string) => {
        try {
            // Optimistic update
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    const isLiked = p.likes?.length > 0
                    return {
                        ...p,
                        likes: isLiked ? [] : [{ userId: 'me' }],
                        _count: {
                            ...p._count,
                            likes: isLiked ? Math.max(0, p._count.likes - 1) : p._count.likes + 1
                        }
                    }
                }
                return p
            }))

            await feedApi.toggleLike(postId)
            // Reload to sync with server
            const { data } = await feedApi.getFeed()
            setPosts(data)
        } catch (error) {
            console.error("Failed to like post", error)
            loadFeed()
        }
    }

    return (
        <div className="space-y-10">
            {/* Create Post Area - Refined Vibe Design */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative p-6 flex gap-5 items-center bg-black/40 border border-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl">
                    <Avatar size="md" className="border-2 border-white/10 shrink-0">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback className="bg-zinc-900 text-zinc-600 font-black">{currentUser?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Initiate Neural Pulse..."
                            className="w-full bg-transparent border-none text-white placeholder:text-zinc-700 focus:outline-none focus:ring-0 text-lg font-bold tracking-tight italic"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()}
                        />
                        <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-white/5" />
                        <div className="absolute -bottom-1 left-0 w-24 h-[1px] bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-3 rounded-2xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <Button
                            variant="primary"
                            size="md"
                            className="font-black uppercase tracking-[0.2em] text-[10px] px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                            onClick={handleCreatePost}
                        >
                            Broadcast
                        </Button>
                    </div>
                </div>
            </div>

            {/* Feed List */}
            <div className="space-y-8 pb-32">
                {posts.map((post) => (
                    <VibePostCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onComment={() => { }} // TODO: Implement comments modal
                        onShare={() => { }} // TODO: Implement share
                    />
                ))}

                {posts.length === 0 && !isLoading && (
                    <div className="text-center py-40 bg-black/20 rounded-[3rem] border border-dashed border-white/5">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <Activity className="w-8 h-8 text-zinc-700 animate-pulse" />
                        </div>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] italic">Static Void • Waiting for Neural Pulses</p>
                    </div>
                )}
            </div>
        </div>
    )
}
