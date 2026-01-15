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
        <div className="space-y-6">
            {/* Create Post */}
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/5 p-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="What's vibing?"
                            className="w-full bg-transparent border-none text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()}
                        />
                    </div>
                    <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white" onClick={handleCreatePost}>
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Feed List */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/5 p-6 space-y-4"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-medium text-white text-sm">{post.author.name}</h4>
                                <span className="text-xs text-zinc-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <p className="text-zinc-300 text-sm leading-relaxed">{post.content}</p>
                        {post.imageUrl && (
                            <div className="rounded-xl overflow-hidden">
                                <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-[400px]" />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-6 pt-2">
                            <button
                                onClick={() => handleLike(post.id)}
                                className={cn("flex items-center gap-2 text-xs font-medium transition-colors",
                                    post.likes.length > 0 ? "text-pink-500" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                <Heart className={cn("w-4 h-4", post.likes.length > 0 && "fill-current")} />
                                {post._count.likes}
                            </button>
                            <button className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-white transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                {post._count.comments}
                            </button>
                        </div>
                    </motion.div>
                ))}

                {posts.length === 0 && !isLoading && (
                    <div className="text-center py-10 text-zinc-500 text-sm">
                        No vibes yet. Be the first!
                    </div>
                )}
            </div>
        </div>
    )
}
