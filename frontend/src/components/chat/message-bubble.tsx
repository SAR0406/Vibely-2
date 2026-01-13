"use client"

import * as React from "react"
import { MoreVertical, Reply, Download, Play, Pause, FileText, Check, CheckCheck, Smile } from "lucide-react"
import EmojiPicker, { Theme, EmojiClickData, EmojiStyle } from 'emoji-picker-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { cn } from "@/lib/utils"
import { formatMessageTime } from "@/lib/date-utils"
import { MessageReactions } from "./message-reactions"
import { Button } from "@/components/design-system/button"
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
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "group flex w-full gap-3 relative",
                isMe ? "flex-row-reverse" : "flex-row",
                isLastInGroup ? "mb-5" : "mb-1.5"
            )}
        >
            {/* Avatar Gutter */}
            <div className={cn("flex-shrink-0 w-8 flex flex-col justify-end", isMe ? "items-end" : "items-start")}>
                {showAvatar && !isMe ? (
                    <Avatar className="w-8 h-8 rounded-full ring-2 ring-[#050505]">
                        <AvatarImage src={senderAvatar} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-300 text-[10px]">{senderName?.[0]}</AvatarFallback>
                    </Avatar>
                ) : <div className="w-8" />}
            </div>

            {/* Message Content Container */}
            <div className={cn("flex flex-col max-w-[70%] md:max-w-[65%]", isMe ? "items-end" : "items-start")}>

                {/* Sender Name */}
                {(!isMe && isFirstInGroup && senderName) && (
                    <span className="text-[11px] text-zinc-500 font-medium ml-1 mb-1 block tracking-tight">
                        {senderName}
                    </span>
                )}

                {/* Reply Snippet */}
                {message.replyTo && (
                    <div
                        onClick={() => onReply(message.replyTo)}
                        className={cn(
                            "mb-1.5 rounded-xl text-xs p-2.5 border-l-[3px] cursor-pointer transition-all hover:opacity-100 opacity-90 flex flex-col gap-0.5 shadow-sm max-w-full",
                            isMe
                                ? "bg-indigo-500/10 border-indigo-400 text-indigo-100"
                                : "bg-zinc-800/40 border-zinc-600 text-zinc-400"
                        )}
                    >
                        <span className="font-bold text-[11px]">{message.replyTo.sender?.name || 'User'}</span>
                        <span className="truncate opacity-80">{message.replyTo.content || 'Attachment'}</span>
                    </div>
                )}

                {/* The Bubble */}
                <div className="relative group/bubble">
                    <div
                        className={cn(
                            "relative px-4 py-2.5 text-[15px] leading-relaxed shadow-sm transition-all duration-200 overflow-hidden",
                            isMe
                                ? cn(
                                    "rounded-[20px] rounded-tr-sm",
                                    !isFirstInGroup && "rounded-tr-[20px]",
                                    !isLastInGroup && "rounded-br-sm",
                                )
                                : cn(
                                    "rounded-[20px] rounded-tl-sm",
                                    !isFirstInGroup && "rounded-tl-[20px]",
                                    !isLastInGroup && "rounded-bl-sm",
                                ),
                            isMe
                                ? "bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/10 border border-white/10"
                                : "bg-[#18181b]/90 backdrop-blur-md text-zinc-100 border border-white/5 shadow-md"
                        )}
                    >
                        {/* Shimmer effect for me messages */}
                        {isMe && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-700 pointer-events-none" />}

                        {/* Image Attachment */}
                        {message.type === 'IMAGE' && (
                            <div className="-mx-4 -mt-2.5 -mb-2.5 rounded-inherit overflow-hidden bg-black/50 relative group/image">
                                <img
                                    src={message.attachmentUrl}
                                    alt="attachment"
                                    onClick={() => onImageClick(message.attachmentUrl)}
                                    className="max-w-full h-auto min-w-[200px] max-h-[400px] object-cover hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors pointer-events-none" />
                            </div>
                        )}

                        {/* File Attachment */}
                        {message.type === 'FILE' && (
                            <div className="flex items-center gap-3 p-1">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                                    <FileText className="w-5 h-5 opacity-90" />
                                </div>
                                <div className="flex flex-col overflow-hidden min-w-[120px]">
                                    <span className="font-medium text-sm truncate">{message.content}</span>
                                    <span className="text-[10px] opacity-70 uppercase tracking-wider font-semibold">File</span>
                                </div>
                                <a
                                    href={message.attachmentUrl}
                                    download={message.content}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors ml-1"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                            </div>
                        )}

                        {/* Audio Attachment */}
                        {message.type === 'AUDIO' && (
                            <div className="flex items-center gap-3 min-w-[240px] py-1">
                                <button onClick={toggleAudio} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all active:scale-95 shadow-lg">
                                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                </button>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                        <div className={cn("h-full bg-white/90 rounded-full transition-all duration-300 shadow-[0_0_10px_white]", isPlaying ? "w-full animate-[width_2s_linear]" : "w-0")} />
                                    </div>
                                    <span className="text-[10px] font-medium opacity-70 ml-0.5">Voice Message</span>
                                </div>
                                <audio ref={audioRef} src={message.attachmentUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                            </div>
                        )}

                        {/* Text Content */}
                        {(message.type === 'TEXT' || message.type === null) && (
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        )}

                        {/* Timestamp & Status */}
                        <div className={cn(
                            "flex items-center justify-end gap-1 mt-1 select-none",
                            isMe ? "text-indigo-100/70" : "text-zinc-500"
                        )}>
                            <span className="text-[10px] font-medium tracking-tight">{formatMessageTime(message.timestamp)}</span>
                            {isMe && (
                                <span className={cn("ml-0.5", message.status === 'seen' ? "text-indigo-200" : "opacity-70")}>
                                    {message.status === 'seen' ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Reactions Display */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className={cn("absolute -bottom-3 z-20 flex flex-wrap gap-1 filter drop-shadow-md", isMe ? "right-0" : "left-0")}>
                            <MessageReactions reactions={message.reactions} currentUserId={currentUserId} onReact={(emoji) => onReact(emoji)} />
                        </div>
                    )}

                    {/* Actions Menu (Hover) */}
                    <div className={cn(
                        "absolute top-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 z-10",
                        isMe ? "-left-20 top-0.5" : "-right-20 top-0.5"
                    )}>
                        <div className="relative">
                            <Button
                                variant="glass"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-[#1e1e24]/90 border border-white/10 hover:bg-zinc-700 hover:scale-105 transition-all shadow-xl"
                                onClick={() => setShowPicker(!showPicker)}
                            >
                                <Smile className="h-4 w-4 text-zinc-400 group-hover:text-zinc-100" />
                            </Button>
                            {showPicker && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
                                    <div className="absolute top-10 right-0 z-50">
                                        <div className="shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#18181b]">
                                            <EmojiPicker
                                                theme={Theme.DARK}
                                                emojiStyle={EmojiStyle.APPLE}
                                                onEmojiClick={(emojiData: EmojiClickData) => {
                                                    onReact(emojiData.emoji);
                                                    setShowPicker(false);
                                                }}
                                                width={280}
                                                height={350}
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
                            className="h-8 w-8 rounded-full bg-[#1e1e24]/90 border border-white/10 hover:bg-zinc-700 hover:scale-105 transition-all shadow-xl"
                            onClick={() => onReply(message)}
                        >
                            <Reply className="h-4 w-4 text-zinc-400 group-hover:text-zinc-100" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="glass"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-[#1e1e24]/90 border border-white/10 hover:bg-zinc-700 hover:scale-105 transition-all shadow-xl"
                                >
                                    <MoreVertical className="h-4 w-4 text-zinc-400 group-hover:text-zinc-100" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isMe ? "end" : "start"} className="bg-[#18181b]/95 border-zinc-800 text-zinc-300 backdrop-blur-xl">
                                <DropdownMenuItem onClick={() => onReply(message)} className="focus:bg-white/5">
                                    <Reply className="mr-2 h-4 w-4" /> Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)} className="focus:bg-white/5">
                                    Copy Text
                                </DropdownMenuItem>
                                {message.senderId === currentUserId && (
                                    <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10">
                                        Delete Message
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
