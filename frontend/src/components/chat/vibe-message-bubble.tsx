"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { formatMessageTime } from "@/lib/date-utils"
import {
    Check, CheckCheck, Play, Pause, FileText, Download,
    Smile, Reply, MoreVertical, Flag
} from "lucide-react"
import { Button } from "@/components/design-system/button"
import { MessageReactions } from "./message-reactions"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import EmojiPicker, { Theme, EmojiClickData, EmojiStyle } from 'emoji-picker-react'
import { ReportModal } from "../shared/report-modal"

interface VibeMessageBubbleProps {
    message: {
        id: string
        content: string
        senderId: string
        timestamp: string
        type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'FILE' | 'VIDEO'
        attachmentUrl?: string
        sender?: {
            name: string
            avatar?: string
        }
        status: "sent" | "delivered" | "read" | "seen"
        reactions?: any[]
        replyTo?: {
            id: string
            content: string
            sender?: { name: string }
        }
    }
    isMe: boolean // Keeping naming consistent with ChatWindow usage
    isFirstInGroup?: boolean
    isLastInGroup?: boolean
    showAvatar?: boolean
    senderName?: string
    senderAvatar?: string
    onReact: (emoji: string) => void
    onImageClick: (src: string) => void
    currentUserId?: string
    onReply: (message: any) => void
}

export function VibeMessageBubble({
    message,
    isMe,
    isFirstInGroup = true,
    isLastInGroup = true,
    showAvatar = true,
    senderName,
    senderAvatar,
    onReact,
    onImageClick,
    currentUserId,
    onReply
}: VibeMessageBubbleProps) {
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [showPicker, setShowPicker] = React.useState(false)
    const [isReportOpen, setIsReportOpen] = React.useState(false)
    const audioRef = React.useRef<HTMLAudioElement>(null)

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause()
            else audioRef.current.play()
            setIsPlaying(!isPlaying)
        }
    }

    // Audio end handler
    React.useEffect(() => {
        const audio = audioRef.current
        if (audio) {
            audio.onended = () => setIsPlaying(false)
        }
    }, [])

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
                "group relative flex w-full gap-3 mb-1",
                isMe ? "justify-end" : "justify-start",
                isLastInGroup && "mb-4"
            )}
        >
            {/* Avatar - Left side only for others */}
            {!isMe && (
                <div className="flex flex-col justify-end w-8 shrink-0">
                    {showAvatar && (
                        <Avatar className="w-8 h-8 shadow-lg shadow-black/20">
                            <AvatarImage src={senderAvatar} />
                            <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-[10px] text-white">
                                {senderName?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
            )}

            <div className={cn(
                "relative max-w-[75%] md:max-w-[65%] flex flex-col pointer-events-auto",
                isMe ? "items-end" : "items-start"
            )}>

                {/* Sender Name (First msg in group only) */}
                {!isMe && isFirstInGroup && senderName && (
                    <span className="text-[10px] font-bold text-zinc-500 ml-3 mb-1 block">
                        {senderName}
                    </span>
                )}

                {/* Reply Context */}
                {message.replyTo && (
                    <div
                        onClick={() => onReply(message.replyTo)}
                        className={cn(
                            "mb-1 px-3 py-2 rounded-2xl backdrop-blur-md text-[11px] border-l-2 cursor-pointer transition-all hover:bg-white/5 w-fit max-w-full truncate",
                            isMe ? "bg-indigo-500/10 border-indigo-300 text-indigo-200" : "bg-white/5 border-zinc-600 text-zinc-400"
                        )}>
                        <div className="font-bold opacity-70 mb-0.5">{message.replyTo.sender?.name}</div>
                        <div className="truncate opacity-90">{message.replyTo.content || 'Attachment'}</div>
                    </div>
                )}

                {/* Main Bubble */}
                <div className={cn(
                    "relative px-4 py-2.5 shadow-sm transition-all duration-300 group/bubble w-fit",
                    // Shape
                    "rounded-[1.25rem]",
                    isMe && isFirstInGroup && "rounded-tr-sm",
                    !isMe && isFirstInGroup && "rounded-tl-sm",

                    // Color/Style
                    isMe
                        ? "bg-gradient-to-br from-primary to-purple-600 text-white shadow-[0_4px_15px_rgba(124,58,237,0.25)]"
                        : "bg-[#18181b]/90 backdrop-blur-md border border-white/[0.08] text-zinc-100 dark:text-zinc-100" // Improved dark mode contrast
                )}>
                    {/* Content Renderer */}
                    {message.type === 'TEXT' && (
                        <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                    )}

                    {message.type === 'IMAGE' && (
                        <div className="-mx-4 -mt-2.5 -mb-2.5 rounded-inherit overflow-hidden relative group/image">
                            <img
                                src={message.attachmentUrl}
                                alt="Image"
                                className="max-w-full max-h-[400px] object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500 block"
                                onClick={() => message.attachmentUrl && onImageClick(message.attachmentUrl)}
                            />
                        </div>
                    )}

                    {message.type === 'FILE' && (
                        <div className="flex items-center gap-3 pr-2">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-current opacity-80" />
                            </div>
                            <div className="flex flex-col overflow-hidden max-w-[140px]">
                                <span className="text-sm font-medium truncate">{message.content}</span>
                                <span className="text-[10px] opacity-60 uppercase tracking-wider">File</span>
                            </div>
                            <a href={message.attachmentUrl} download className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <Download className="w-4 h-4" />
                            </a>
                        </div>
                    )}

                    {message.type === 'AUDIO' && (
                        <div className="flex items-center gap-3 min-w-[200px] pr-2">
                            <button onClick={toggleAudio} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0">
                                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                            </button>
                            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <div className={cn(
                                    "h-full bg-white rounded-full transition-all duration-300",
                                    isPlaying ? "w-full animate-[width_30s_linear]" : "w-0" // Rough animation fallback
                                )} />
                            </div>
                            <audio ref={audioRef} src={message.attachmentUrl} className="hidden" />
                        </div>
                    )}

                    {message.type === 'VIDEO' && (
                        <div className="-mx-4 -mt-2.5 -mb-2.5 rounded-inherit overflow-hidden relative group/video">
                            <video
                                src={message.attachmentUrl}
                                controls
                                className="max-w-full max-h-[400px] rounded-inherit block"
                            />
                        </div>
                    )}

                    {/* Metadata (Time + Status) */}
                    <div className={cn(
                        "flex items-center gap-1 mt-1 text-[10px] opacity-60 select-none justify-end float-right ml-3 align-bottom h-4",
                        isMe ? "text-white/90" : "text-zinc-400"
                    )}>
                        <span>{formatMessageTime(message.timestamp)}</span>
                        {isMe && (
                            <span className={cn("ml-0.5", message.status === 'seen' && "text-cyan-300 opacity-100")}>
                                {message.status === 'seen' || message.status === 'read' ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                            </span>
                        )}
                    </div>

                    {/* Reactions - Absolute positioned at bottom */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className={cn(
                            "absolute z-20 flex flex-wrap gap-1",
                            "bottom-[-12px]", // Half overlapping
                            isMe ? "right-2" : "left-2"
                        )}>
                            <MessageReactions
                                reactions={message.reactions}
                                currentUserId={currentUserId}
                                onReact={onReact}
                            />
                        </div>
                    )}
                </div>

                {/* Floating Action Menu (Hover) */}
                <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex gap-1",
                    isMe ? "-left-28 pr-4" : "-right-28 pl-4"
                )}>
                    <Button variant="glass" size="icon" className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl" onClick={() => setShowPicker(!showPicker)}>
                        <Smile className="w-4 h-4 text-zinc-400 hover:text-cyan-400" />
                    </Button>
                    <Button variant="glass" size="icon" className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl" onClick={() => onReply(message)}>
                        <Reply className="w-4 h-4 text-zinc-400 hover:text-indigo-400" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="glass" size="icon" className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl">
                                <MoreVertical className="w-4 h-4 text-zinc-400 hover:text-white" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="p-1 bg-black/90 border-white/10 backdrop-blur-xl text-zinc-300">
                            <DropdownMenuItem onClick={() => setIsReportOpen(true)} className="text-xs text-rose-400 focus:text-rose-400 focus:bg-rose-500/10">
                                <Flag className="w-3 h-3 mr-2" /> Report
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Emoji Picker Popover */}
                    {showPicker && (
                        <div className="absolute bottom-10 z-50 animate-in zoom-in-95 duration-200">
                            <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
                            <div className="relative z-50 shadow-2xl rounded-3xl overflow-hidden border border-white/10 bg-black/90 scale-75 origin-bottom">
                                <EmojiPicker
                                    theme={Theme.DARK}
                                    emojiStyle={EmojiStyle.APPLE}
                                    onEmojiClick={(e) => { onReact(e.emoji); setShowPicker(false) }}
                                    width={300}
                                    height={350}
                                />
                            </div>
                        </div>
                    )}
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
