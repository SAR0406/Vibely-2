"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { GlassCard } from "@/components/ui/glass-card"

interface VibePostCardProps {
    post: any
    onLike: (postId: string) => void
    onComment?: (postId: string) => void
    onShare?: (postId: string) => void
}

export function VibePostCard({ post, onLike, onComment, onShare }: VibePostCardProps) {
    const isLiked = post.likes?.length > 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="group relative"
        >
            {/* Ambient Background Glow on Hover */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-cyan-500/5 rounded-[2.5rem] blur-3xl transition-all duration-1000 opacity-0 group-hover:opacity-100" />

            <GlassCard className="relative overflow-hidden border-white/5 bg-black/40 backdrop-blur-2xl p-0 rounded-[2rem] hover:border-white/10 transition-all duration-500 shadow-2xl">
                {/* Header */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-full opacity-0 group-hover:opacity-50 blur-sm transition-opacity" />
                            <Avatar size="md" className="relative border border-white/10 ring-2 ring-black">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback className="bg-zinc-900 text-zinc-500 font-bold">{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-[15px] tracking-tight hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1.5 uppercase italic">
                                {post.author.name}
                                {post.author.tier === 'PRO' && <Sparkles className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />}
                            </h4>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                    <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-4">
                    <p className="text-zinc-300 text-[16px] leading-relaxed selection:bg-indigo-500/30">
                        {post.content}
                    </p>
                </div>

                {/* Media */}
                {post.imageUrl && (
                    <div className="px-4 pb-4">
                        <div className="rounded-2xl overflow-hidden bg-zinc-950 aspect-video relative group/media">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity z-10" />
                            <img
                                src={post.imageUrl}
                                alt="Post media"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover/media:scale-105"
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="p-4 px-6 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onLike(post.id)}
                            className={cn(
                                "flex items-center gap-2 group/action transition-all",
                                isLiked ? "text-rose-500" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-all duration-300",
                                isLiked ? "bg-rose-500/10 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "bg-white/5 border border-white/5 group-hover/action:bg-white/10"
                            )}>
                                <Heart className={cn("w-5 h-5 transition-transform duration-500", isLiked && "fill-rose-500")} />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-bold tracking-tight">{post._count?.likes || 0}</span>
                                <span className="text-[8px] uppercase tracking-tighter opacity-50 font-black">Resonance</span>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onComment?.(post.id)}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white group/action transition-all"
                        >
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover/action:bg-white/10 group-hover/action:border-white/10 transition-all">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-bold tracking-tight">{post._count?.comments || 0}</span>
                                <span className="text-[8px] uppercase tracking-tighter opacity-50 font-black">Neural Links</span>
                            </div>
                        </motion.button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all">
                            <Bookmark className="w-4.5 h-4.5" />
                        </button>
                        <button
                            onClick={() => onShare?.(post.id)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                        >
                            <Share2 className="w-4.5 h-4.5" />
                        </button>
                    </div>
                </div>

                {/* Metadata Line */}
                <div className="px-6 py-2 flex items-center gap-4 opacity-20 hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Hash: 0x{post.id.substring(0, 12)}</span>
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Region: Global-Core-01</span>
                </div>
            </GlassCard>
        </motion.div>
    )
}
