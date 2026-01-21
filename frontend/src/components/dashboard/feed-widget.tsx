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
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    const isLiked = p.likes.length > 0
                    return {
                        ...p,
                        likes: isLiked ? [] : [{ userId: 'me' }],
                        _count: {
                            ...p._count,
                            likes: isLiked ? p._count.likes - 1 : p._count.likes + 1
                        }
                    }
                }
                return p
            }))

            await feedApi.toggleLike(postId)
            loadFeed()
        } catch (error) {
            console.error("Failed to like post", error)
            loadFeed()
        }
    }

    return (
        <div className="space-y-12">
            {/* Create Post Area - Nexus Command Style */}
            <div className="magic-border group">
                <div className="magic-border-content p-6 flex gap-6 items-center bg-[#050505]/80 backdrop-blur-2xl">
                    <Avatar size="md" className="border-2 border-white/5 ring-4 ring-indigo-500/5">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback className="bg-zinc-900 text-zinc-600 font-black">{currentUser?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Initiate Neural Pulse..."
                            className="w-full bg-transparent border-none text-white placeholder:text-zinc-700 focus:outline-none focus:ring-0 text-lg font-black tracking-tight italic"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()}
                        />
                        <div className="absolute -bottom-2 left-0 w-24 h-[1px] bg-indigo-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 rounded-2xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <Button
                            variant="neon"
                            size="md"
                            className="font-black uppercase tracking-[0.3em] text-[10px] px-8 rounded-2xl"
                            onClick={handleCreatePost}
                        >
                            Broadcast
                        </Button>
                    </div>
                </div>
            </div>

            {/* Feed List */}
            <div className="space-y-8">
                {posts.map((post, i) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="glass-card p-10 space-y-8 group relative overflow-hidden"
                    >
                        {/* Status Ambient Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        {/* Header */}
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-5">
                                <Avatar size="lg" className="border-2 border-white/5 group-hover:ring-4 group-hover:ring-cyan-500/10 transition-all duration-500">
                                    <AvatarImage src={post.author.avatar} />
                                    <AvatarFallback className="bg-zinc-900 text-zinc-600 font-black">{post.author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h4 className="font-black text-white text-xl tracking-tighter uppercase italic group-hover:text-cyan-400 transition-colors uppercase">{post.author.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                        <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
                                        <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.2em]">Matrix Verified</span>
                                    </div>
                                </div>
                            </div>
                            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-white hover:border-white/20 transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <p className="text-zinc-400 text-lg leading-relaxed font-medium group-hover:text-zinc-200 transition-colors">
                                {post.content}
                            </p>
                            <div className="mt-4 flex gap-4 overflow-hidden">
                                <p className="blockchain-hash">SIG: 0x{post.id.substring(0, 12)}...{post.author.id.substring(0, 4)}</p>
                                <p className="blockchain-hash">NODE: NEXUS-V4-CORE</p>
                            </div>
                        </div>

                        {post.imageUrl && (
                            <div className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-900/40 relative group/img">
                                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity z-10" />
                                <img
                                    src={post.imageUrl}
                                    alt="Pulse Visual"
                                    className="w-full h-auto object-cover max-h-[600px] transition-all duration-1000 group-hover/img:scale-105 group-hover/img:rotate-1"
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-12 pt-8 border-t border-white/5 relative z-10">
                            <button
                                onClick={() => handleLike(post.id)}
                                className={cn("flex items-center gap-4 transition-all duration-500 active:scale-95 group/btn",
                                    post.likes.length > 0 ? "text-rose-500" : "text-zinc-600 hover:text-white"
                                )}
                            >
                                <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover/btn:scale-110",
                                    post.likes.length > 0
                                        ? "bg-rose-500/10 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                                        : "bg-white/5 border-white/5"
                                )}>
                                    <Heart className={cn("w-6 h-6", post.likes.length > 0 && "fill-rose-500")} />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-xl font-black tracking-tighter">{post._count.likes}</span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Resonance</span>
                                </div>
                            </button>

                            <button className="flex items-center gap-4 text-zinc-600 hover:text-white transition-all duration-500 active:scale-95 group/btn">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover/btn:scale-110 transition-all duration-500">
                                    <MessageCircle className="w-6 h-6 group-hover:text-cyan-400" />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-xl font-black tracking-tighter">{post._count.comments}</span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Neural Links</span>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                ))}

                {posts.length === 0 && !isLoading && (
                    <div className="text-center py-32 glass-card border-dashed border-white/5">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <Activity className="w-8 h-8 text-zinc-700 animate-pulse" />
                        </div>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] italic">Static Void • Waiting for Neural Pulses</p>
                    </div>
                )}
            </div>
        </div>
    )
}
