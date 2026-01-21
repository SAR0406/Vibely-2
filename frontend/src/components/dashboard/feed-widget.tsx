"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon } from "lucide-react"
import { feedApi } from "@/services/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { Button } from "@/components/design-system/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export function FeedWidget() {
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
            // TODO: Add file upload support for posts later

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
                    const isLiked = p.likes.length > 0
                    return {
                        ...p,
                        likes: isLiked ? [] : [{ userId: 'me' }], // Mock structure for local update
                        _count: {
                            ...p._count,
                            likes: isLiked ? p._count.likes - 1 : p._count.likes + 1
                        }
                    }
                }
                return p
            }))

            await feedApi.toggleLike(postId)
            loadFeed() // Sync with server
        } catch (error) {
            console.error("Failed to like post", error)
            loadFeed() // Revert on error
        }
    }

    return (
        <div className="space-y-8">
            {/* Create Post Area - Nexus Command Style */}
            <div className="glass-card p-1 relative group shadow-2xl shadow-indigo-500/5">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
                <div className="relative bg-[#050505]/60 backdrop-blur-xl rounded-[1.4rem] p-4 flex gap-4 items-center">
                    <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-500 font-black">{currentUser?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Initialize Vibe..."
                            className="w-full bg-transparent border-none text-white placeholder:text-zinc-600 focus:outline-none focus:ring-0 text-sm font-medium"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="text-zinc-600 hover:text-white transition-colors">
                            <ImageIcon className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] px-6 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                            onClick={handleCreatePost}
                        >
                            Broadcast
                        </Button>
                    </div>
                </div>
            </div>

            {/* Feed List */}
            <div className="space-y-6">
                {posts.map((post, i) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i, type: "spring", damping: 25 }}
                        className="glass-card p-8 space-y-6 group hover:border-white/20 transition-all duration-500 shadow-2xl shadow-black/20"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Avatar className="h-12 w-12 border border-white/5 relative z-10 transition-transform duration-500 group-hover:rotate-3">
                                        <AvatarImage src={post.author.avatar} />
                                        <AvatarFallback className="bg-zinc-800 text-zinc-500 font-bold">{post.author.name[0]}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-sm tracking-tight group-hover:text-cyan-400 transition-colors">{post.author.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Nexus Verified</span>
                                    </div>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="text-zinc-700 hover:text-white">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <p className="text-zinc-400 text-sm leading-relaxed font-medium group-hover:text-zinc-200 transition-colors px-1">{post.content}</p>

                        {post.imageUrl && (
                            <div className="rounded-[2rem] overflow-hidden border border-white/5 shadow-inner group-hover:border-white/20 transition-all duration-500">
                                <img
                                    src={post.imageUrl}
                                    alt="Post content"
                                    className="w-full h-auto object-cover max-h-[500px] grayscale-[0.1] hover:grayscale-0 transition-all duration-700 hover:scale-[1.02]"
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-8 pt-4 border-t border-white/5">
                            <button
                                onClick={() => handleLike(post.id)}
                                className={cn("flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                                    post.likes.length > 0 ? "text-rose-500" : "text-zinc-600 hover:text-white"
                                )}
                            >
                                <div className={cn("p-2 rounded-xl transition-all duration-300",
                                    post.likes.length > 0 ? "bg-rose-500/10 shadow-lg shadow-rose-500/20" : "bg-white/5"
                                )}>
                                    <Heart className={cn("w-4 h-4", post.likes.length > 0 && "fill-current")} />
                                </div>
                                <span className="pt-0.5">{post._count.likes} Resonance</span>
                            </button>
                            <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-all duration-300">
                                <div className="p-2 rounded-xl bg-white/5">
                                    <MessageCircle className="w-4 h-4" />
                                </div>
                                <span className="pt-0.5">{post._count.comments} Signals</span>
                            </button>
                        </div>
                    </motion.div>
                ))}

                {posts.length === 0 && !isLoading && (
                    <div className="text-center py-20 glass-card">
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Static Void • No Vibes Detected</p>
                    </div>
                )}
            </div>
        </div>
    )
}
