"use client"

import * as React from "react"
import { Flag, MoreVertical, Reply, Download, Play, Pause, FileText, Check, CheckCheck, Smile } from "lucide-react"
import EmojiPicker, { Theme, EmojiClickData, EmojiStyle } from 'emoji-picker-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { cn } from "@/lib/utils"
import { formatMessageTime } from "@/lib/date-utils"
import { MessageReactions } from "./message-reactions"
import { Button } from "@/components/design-system/button"
import { ReportModal } from "../shared/report-modal"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

interface MessageBubbleProps {
    message: any
    isMe: boolean
    isFirstInGroup: boolean
    isLastInGroup: boolean
    showAvatar: boolean
    senderName?: string
    senderAvatar?: string
    onReact: (emoji: string) => void
    onImageClick: (src: string) => void
    currentUserId?: string
    onReply: (message: any) => void
}

export function MessageBubble({
    message,
    isMe,
    isFirstInGroup,
    isLastInGroup,
    showAvatar,
    senderName,
    senderAvatar,
    onReact,
    onImageClick,
    currentUserId,
    onReply
}: MessageBubbleProps) {
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [showPicker, setShowPicker] = React.useState(false)
    const [isReportOpen, setIsReportOpen] = React.useState(false)
    const audioRef = React.useRef<HTMLAudioElement>(null)

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    React.useEffect(() => {
        const audio = audioRef.current
        if (audio) {
            audio.onended = () => setIsPlaying(false)
        }
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className={cn(
                "group flex w-full gap-4 relative",
                isMe ? "flex-row-reverse" : "flex-row",
                isLastInGroup ? "mb-6" : "mb-1.5"
            )}
        >
            {/* Avatar Gutter */}
            <div className={cn("flex-shrink-0 w-10 flex flex-col justify-end", isMe ? "items-end" : "items-start")}>
                {showAvatar && !isMe ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-md" />
                        <Avatar className="w-10 h-10 rounded-2xl border border-white/10 shadow-xl relative z-10 transition-transform group-hover:rotate-6">
                            <AvatarImage src={senderAvatar} className="object-cover" />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400 font-black text-xs uppercase">{senderName?.[0]}</AvatarFallback>
                        </Avatar>
                    </motion.div>
                ) : <div className="w-10" />}
            </div>

            {/* Message Content Container */}
            <div className={cn("flex flex-col max-w-[80%] md:max-w-[70%]", isMe ? "items-end" : "items-start")}>

                {/* Sender Name */}
                {(!isMe && isFirstInGroup && senderName) && (
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 mb-2 block">
                        {senderName}
                    </span>
                )}

                {/* Reply Snippet - Premium Glass Style */}
                {message.replyTo && (
                    <div
                        onClick={() => onReply(message.replyTo)}
                        className={cn(
                            "mb-2 rounded-[1.4rem] text-[11px] p-3 border-l-[4px] cursor-pointer transition-all hover:bg-white/5 flex flex-col gap-1 shadow-inner max-w-full backdrop-blur-md",
                            isMe
                                ? "bg-indigo-500/10 border-indigo-400 text-indigo-100/60"
                                : "bg-white/[0.03] border-zinc-700 text-zinc-500"
                        )}
                    >
                        <span className="font-black uppercase tracking-widest text-[9px] opacity-100">{message.replyTo.sender?.name || 'Authorized User'}</span>
                        <span className="truncate font-medium">{message.replyTo.content || 'Data Stream'}</span>
                    </div>
                )}

                {/* The Bubble */}
                <div className="relative group/bubble max-w-full">
                    <div
                        className={cn(
                            "relative px-5 py-3.5 text-[15px] leading-relaxed shadow-2xl transition-all duration-300 overflow-hidden",
                            isMe
                                ? cn(
                                    "rounded-[2rem] rounded-tr-sm",
                                    !isFirstInGroup && "rounded-tr-[2rem]",
                                    !isLastInGroup && "rounded-br-sm",
                                )
                                : cn(
                                    "rounded-[2rem] rounded-tl-sm",
                                    !isFirstInGroup && "rounded-tl-[2rem]",
                                    !isLastInGroup && "rounded-bl-sm",
                                ),
                            isMe
                                ? "bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 text-white border border-white/10 shadow-indigo-500/20"
                                : "glass-card text-zinc-200 shadow-black/40"
                        )}
                    >
                        {/* Shimmer effect for me messages */}
                        {isMe && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-1000 pointer-events-none" />}

                        {/* Image Attachment */}
                        {message.type === 'IMAGE' && (
                            <div className="-mx-5 -mt-3.5 -mb-3.5 rounded-inherit overflow-hidden bg-black/50 relative group/image shadow-inner">
                                <img
                                    src={message.attachmentUrl}
                                    alt="attachment"
                                    onClick={() => onImageClick(message.attachmentUrl)}
                                    className="max-w-full h-auto min-w-[240px] max-h-[500px] object-cover hover:scale-[1.03] transition-transform duration-700 cursor-pointer grayscale-[0.1] hover:grayscale-0"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity" />
                            </div>
                        )}

                        {/* File Attachment */}
                        {message.type === 'FILE' && (
                            <div className="flex items-center gap-4 p-1">
                                <div className="w-12 h-12 rounded-[1.2rem] bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-inner group-hover/bubble:bg-white/10 transition-colors">
                                    <FileText className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div className="flex flex-col overflow-hidden min-w-[150px]">
                                    <span className="font-bold text-sm tracking-tight truncate">{message.content}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mt-0.5">Nexus Data Object</span>
                                </div>
                                <a
                                    href={message.attachmentUrl}
                                    download={message.content}
                                    className="p-3 hover:bg-white/10 rounded-2xl transition-all ml-2 active:scale-90"
                                >
                                    <Download className="w-5 h-5 text-zinc-400" />
                                </a>
                            </div>
                        )}

                        {/* Audio Attachment */}
                        {message.type === 'AUDIO' && (
                            <div className="flex items-center gap-4 min-w-[280px] py-1">
                                <button onClick={toggleAudio} className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 shadow-xl border border-white/10">
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                                </button>
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                        <div className={cn("h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]", isPlaying ? "w-full animate-[width_2s_linear]" : "w-0")} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Audio Signal Analysis</span>
                                </div>
                                <audio ref={audioRef} src={message.attachmentUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                            </div>
                        )}

                        {/* Text Content */}
                        {(message.type === 'TEXT' || message.type === null) && (
                            <p className="whitespace-pre-wrap break-words font-medium tracking-tight leading-[1.6]">{message.content}</p>
                        )}

                        {/* Timestamp & Status */}
                        <div className={cn(
                            "flex items-center justify-end gap-2 mt-2 select-none",
                            isMe ? "text-indigo-100/60" : "text-zinc-600"
                        )}>
                            <span className="text-[9px] font-mono font-bold tracking-widest uppercase">{formatMessageTime(message.timestamp)}</span>
                            {isMe && (
                                <div className={cn("flex transition-colors", message.status === 'seen' ? "text-emerald-400" : "opacity-40")}>
                                    {message.status === 'seen'
                                        ? <CheckCheck className="w-3.5 h-3.5 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
                                        : <Check className="w-3.5 h-3.5" />
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reactions Display */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className={cn("absolute -bottom-4 z-20 flex flex-wrap gap-1.5", isMe ? "right-2" : "left-2")}>
                            <MessageReactions reactions={message.reactions} currentUserId={currentUserId} onReact={(emoji) => onReact(emoji)} />
                        </div>
                    )}

                    {/* Actions Menu (Hover) - Premium Floating Style */}
                    <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-all duration-300 flex flex-col gap-2 z-10",
                        isMe ? "-left-14 pr-2" : "-right-14 pl-2"
                    )}>
                        <div className="relative">
                            <Button
                                variant="glass"
                                size="icon"
                                className="h-9 w-9 rounded-2xl bg-zinc-900 shadow-2xl border border-white/10 hover:bg-zinc-800 hover:scale-110 active:scale-90 transition-all"
                                onClick={() => setShowPicker(!showPicker)}
                            >
                                <Smile className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-cyan-400" />
                            </Button>
                            {showPicker && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
                                    <div className={cn("absolute bottom-11 z-50", isMe ? "right-0" : "left-0")}>
                                        <div className="shadow-2xl rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a] backdrop-blur-2xl">
                                            <EmojiPicker
                                                theme={Theme.DARK}
                                                emojiStyle={EmojiStyle.APPLE}
                                                onEmojiClick={(emojiData: EmojiClickData) => {
                                                    onReact(emojiData.emoji);
                                                    setShowPicker(false);
                                                }}
                                                width={300}
                                                height={400}
                                                searchDisabled
                                                skinTonesDisabled
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <Button
                            variant="glass"
                            size="icon"
                            className="h-9 w-9 rounded-2xl bg-zinc-900 shadow-2xl border border-white/10 hover:bg-zinc-800 hover:scale-110 active:scale-90 transition-all group/btn"
                            onClick={() => onReply(message)}
                        >
                            <Reply className="h-4 w-4 text-zinc-400 group-hover/btn:text-indigo-400 transition-colors" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="glass"
                                    size="icon"
                                    className="h-9 w-9 rounded-2xl bg-zinc-900 shadow-2xl border border-white/10 hover:bg-zinc-800 hover:scale-110 active:scale-90 transition-all group/btn"
                                >
                                    <MoreVertical className="h-4 w-4 text-zinc-400 group-hover/btn:text-white transition-colors" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#09090b]/90 backdrop-blur-2xl border-white/5 text-white rounded-2xl p-1.5 min-w-[160px] shadow-2xl">
                                <DropdownMenuItem
                                    className="rounded-xl flex items-center gap-3 py-2.5 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer text-xs font-bold uppercase tracking-widest text-zinc-400"
                                    onClick={() => setIsReportOpen(true)}
                                >
                                    <Flag className="w-4 h-4" />
                                    Report Signal
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                type="message"
                targetId={message.id}
            />
        </motion.div>
    )
}
