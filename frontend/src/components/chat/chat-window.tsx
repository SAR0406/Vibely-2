"use client"

import * as React from "react"
import {
    Send, Phone, Video, Info, Paperclip, Check, CheckCheck, Smile,
    Search, Download, FileText, X, Reply, Mic, ChevronLeft,
    Image as ImageIcon, MoreVertical
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/design-system/button"
import { Input } from "@/components/design-system/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/store/use-chat-store"
import { useSocket } from "@/hooks/use-socket"
import { chatApi, uploadApi } from "@/services/api"
import { cn } from "@/lib/utils"
import { formatMessageTime, formatDistance, isSameDay, formatMessageDate } from "@/lib/date-utils"
import { useCall } from "@/providers/call-provider"
import { EmojiStyle, Theme, EmojiClickData } from 'emoji-picker-react'
import dynamic from 'next/dynamic'
import { MessageBubble } from "./message-bubble"
import { DateSeparator } from "./date-separator"
import { AudioRecorder } from "./audio-recorder"
import { ReplyPreview } from "./reply-preview"
import { useWindowSize } from "@/hooks/use-window-size"
import { useThemeStore } from '@/store/use-theme-store'
import { useSoundEffects } from '@/hooks/use-sound-effects'
import { MessageReactions } from "./message-reactions"
import { Lightbox } from "@/components/ui/lightbox"
import { ChatSkeleton } from "@/components/skeletons/chat-skeleton"
import { SmartReplies } from "./smart-replies"

const EmojiPicker = dynamic(
    () => import('emoji-picker-react'),
    { ssr: false }
)

export function ChatWindow() {
    const socket = useSocket()
    const {
        selectedConversationId,
        conversations,
        messages,
        setMessages,
        currentUser,
        selectConversation,
        handleReactionAdded,
        toggleReactionOptimistic,
        replyingTo,
        setReplyingTo,
        updateMessageStatus,
        updateVibe
    } = useChatStore()
    const { startCall } = useCall()
    const { width } = useWindowSize()
    const isMobile = width !== undefined && width < 768
    const [inputValue, setInputValue] = React.useState("")
    const [remoteTyping, setRemoteTyping] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const { wallpaper } = useThemeStore()
    const { play } = useSoundEffects()
    const lastMsgCountRef = React.useRef(0)

    // Play sound on receive (Only if sound is enabled in store - handled by useSoundEffects)
    React.useEffect(() => {
        const currentMessages = messages[selectedConversationId || ''] || []
        if (currentMessages.length > lastMsgCountRef.current) {
            const lastMsg = currentMessages[currentMessages.length - 1]
            // Only play if it's not from us AND it's not just a status update to existing message
            if (lastMsg.senderId !== currentUser?.id && lastMsgCountRef.current !== 0) {
                play('receive')
            }
        }
        lastMsgCountRef.current = currentMessages.length
    }, [messages, selectedConversationId, currentUser, play])
    const [typingTimeout, setTypingTimeout] = React.useState<NodeJS.Timeout | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)
    const [lightboxOpen, setLightboxOpen] = React.useState(false)
    const [lightboxSrc, setLightboxSrc] = React.useState("")
    const [isRecording, setIsRecording] = React.useState(false)

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            await processFile(files[0])
        }
    }

    const processFile = async (file: File) => {
        if (!file || !selectedConversationId || !socket || !currentUser) return;

        // Optimistic UI update for attachments
        const tempId = Date.now().toString();
        let fileType = 'FILE';
        if (file.type.startsWith('image/')) fileType = 'IMAGE';
        if (file.type.startsWith('audio/')) fileType = 'AUDIO';

        const newMsg: any = {
            id: tempId,
            content: file.name,
            type: fileType,
            attachmentUrl: URL.createObjectURL(file),
            senderId: currentUser.id,
            timestamp: new Date().toISOString(),
            status: "sent",
            reactions: [],
        };
        setMessages(selectedConversationId, [...activeMessages, newMsg]);

        try {
            const { data } = await uploadApi.upload(file);

            socket.emit('sendMessage', {
                conversationId: selectedConversationId,
                content: data.name,
                type: data.type || fileType,
                attachmentUrl: data.url,
            });
        } catch (error) {
            console.error('File upload failed:', error);
            setMessages(selectedConversationId, activeMessages.filter(msg => msg.id !== tempId));
        }
    }

    const onImageClick = (src: string) => {
        setLightboxSrc(src)
        setLightboxOpen(true)
    }


    const activeChat = conversations.find(c => c.id === selectedConversationId)
    const activeMessages = selectedConversationId ? messages[selectedConversationId] || [] : []

    // Check if the other user is online
    const otherUser = activeChat?.participants.find(p => p.id !== currentUser?.id)
    const isOnline = otherUser?.isOnline

    // Load message history and handle seen status
    React.useEffect(() => {
        if (!selectedConversationId || !socket) return

        const loadMessages = async () => {
            setLoading(true)
            try {
                socket.emit('joinRoom', selectedConversationId)
                socket.emit('markSeen', { conversationId: selectedConversationId })

                const { data } = await chatApi.getMessages(selectedConversationId)
                setMessages(selectedConversationId, data.map((msg: any) => ({
                    id: msg.id,
                    content: msg.content,
                    type: msg.type || 'TEXT',
                    attachmentUrl: msg.attachmentUrl,
                    senderId: msg.senderId,
                    timestamp: msg.createdAt,
                    status: msg.status.toLowerCase() as 'sent' | 'delivered' | 'seen',
                    reactions: msg.reactions || [],
                    replyTo: msg.replyTo // Ensure reply info is passed
                })))
            } catch (error) {
                console.error("Failed to load messages:", error)
            } finally {
                setLoading(false)
            }
        }

        loadMessages()

        const handleRemoteTyping = (data: any) => {
            if (data.conversationId === selectedConversationId && data.userId !== currentUser?.id) {
                setRemoteTyping(data.isTyping)
            }
        }

        const handleMessagesSeen = (data: any) => {
            if (data.conversationId === selectedConversationId) {
                updateMessageStatus(data.conversationId, 'seen', data.messageIds)
            }
        }

        const handleVibeUpdate = (data: any) => {
            updateVibe(data.conversationId, data.score, data.label);
        }

        socket.on('typing', handleRemoteTyping)
        socket.on('messages:seen', handleMessagesSeen)
        socket.on('chat:vibe', handleVibeUpdate)

        return () => {
            socket.off('typing', handleRemoteTyping)
            socket.off('messages:seen', handleMessagesSeen)
            socket.off('chat:vibe', handleVibeUpdate)
        }
    }, [selectedConversationId, socket, setMessages, currentUser?.id])

    // Auto scroll to bottom
    React.useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, [activeMessages, remoteTyping])

    // Handle typing indicator
    const handleTyping = () => {
        if (!socket || !selectedConversationId) return

        if (typingTimeout) clearTimeout(typingTimeout)

        socket.emit('typing', { conversationId: selectedConversationId, isTyping: true })

        const timeout = setTimeout(() => {
            socket.emit('typing', { conversationId: selectedConversationId, isTyping: false })
        }, 3000)
        setTypingTimeout(timeout)
    }

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setInputValue(prev => prev + emojiData.emoji)
        setShowEmojiPicker(false)
    }

    const handleReact = (messageId: string, emoji: string) => {
        if (!selectedConversationId || !currentUser || !socket) return;

        // 1. Optimistic Update (Speed of Light)
        toggleReactionOptimistic(messageId, emoji, currentUser.id, selectedConversationId);

        // 2. Real-time update via Socket
        socket.emit('react', { messageId, emoji, conversationId: selectedConversationId });
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await processFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || !selectedConversationId || !socket || !currentUser) return

        const content = inputValue.trim()
        setInputValue("")

        // Optimistic update
        const tempId = Date.now().toString()
        const newMsg: any = {
            id: tempId,
            content,
            type: 'TEXT',
            senderId: currentUser.id,
            timestamp: new Date().toISOString(),
            status: "sent",
            reactions: [],
            replyTo: replyingTo ? {
                id: replyingTo.id,
                content: replyingTo.content,
                sender: { name: replyingTo.sender?.name || 'Unknown' }
            } : undefined
        }

        setMessages(selectedConversationId, [...activeMessages, newMsg])
        setReplyingTo(null)
        play('send')

        try {
            socket.emit('sendMessage', {
                conversationId: selectedConversationId,
                content,
                replyToId: replyingTo?.id
            })
        } catch (error) {
            console.error("Failed to send message:", error)
        }
    }

    React.useEffect(() => {
        if (!socket) return;

        const onReaction = (data: { messageId: string, reaction: any, conversationId: string }) => {
            handleReactionAdded(data);
        };

        socket.on('reactionAdded', onReaction);

        return () => {
            socket.off('reactionAdded', onReaction);
        };
    }, [socket, handleReactionAdded]);

    if (loading) {
        return <ChatSkeleton />
    }

    if (!activeChat) {
        return (
            <div className="h-full w-full flex items-center justify-center flex-col gap-6 bg-[#050505] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(99,102,241,0.15),transparent_40%)]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="relative z-10 flex flex-col items-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_0_60px_-10px_rgba(99,102,241,0.5)] border border-white/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                        <span className="text-4xl select-none relative z-10">✨</span>
                    </div>

                    <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-3 tracking-tighter">Vibely</h3>
                    <p className="text-zinc-500 text-center max-w-sm mb-10 leading-relaxed text-sm">
                        Your workspace for real-time collaboration.<br />Select a chat to begin.
                    </p>

                    <Button
                        variant="glass"
                        size="lg"
                        className="rounded-full px-8 bg-white/5 hover:bg-white/10 border-white/10 backdrop-blur-md"
                        onClick={() => window.location.href = '/search'}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Start a Conversation
                    </Button>
                </motion.div>
            </div>
        )
    }



    return (
        <div
            className="flex flex-col h-full w-full relative bg-[#050505] overflow-hidden"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Wallpaper Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-500 ease-in-out">
                {wallpaper === 'grid' && <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />}
                {wallpaper === 'dots' && <div className="absolute inset-0 bg-[radial-gradient(circle_1px_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]" />}
                {wallpaper === 'gradient' && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />}
            </div>

            <Lightbox
                isOpen={lightboxOpen}
                src={lightboxSrc}
                onClose={() => setLightboxOpen(false)}
            />


            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-indigo-500/10 backdrop-blur-sm border-2 border-indigo-500/50 border-dashed m-6 rounded-3xl flex items-center justify-center pointer-events-none"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl">
                                <Download className="h-8 w-8 text-indigo-300 animate-bounce" />
                            </div>
                            <h3 className="text-xl font-bold text-indigo-100">Drop files here</h3>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="h-18 border-b border-white/5 flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                    {isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 -ml-2 hover:bg-white/5"
                            onClick={() => selectConversation(null)}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div className="relative cursor-pointer group">
                        <Avatar className="h-10 w-10 border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                            <AvatarImage src={activeChat.avatar} />
                            <AvatarFallback>{activeChat.name[0]}</AvatarFallback>
                        </Avatar>
                        {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-[#0a0a0a] rounded-full" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-zinc-100 tracking-tight">{activeChat.name}</span>
                        <span className={cn("text-[11px] font-medium", isOnline ? "text-emerald-500" : "text-zinc-600")}>
                            {remoteTyping ? (
                                <span className="animate-pulse text-indigo-400">typing...</span>
                            ) : (isOnline ? 'Active Now' : (otherUser?.lastSeen ? `Seen ${formatDistance(otherUser.lastSeen)}` : 'Offline'))}
                        </span>
                        <span className={cn("text-[11px] font-medium", isOnline ? "text-emerald-500" : "text-zinc-600")}>
                            {remoteTyping ? (
                                <span className="animate-pulse text-indigo-400">typing...</span>
                            ) : (isOnline ? 'Active Now' : (otherUser?.lastSeen ? `Seen ${formatDistance(otherUser.lastSeen)}` : 'Offline'))}
                        </span>
                    </div>
                </div>

                {/* Vibe Meter */}
                <div className="flex items-center gap-4 mr-4">
                    {activeChat.vibe && (
                        <div className="hidden md:flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                    {activeChat.vibe.label}
                                </span>
                                <span className="text-xs text-zinc-500 font-mono">
                                    {activeChat.vibe.score}%
                                </span>
                            </div>
                            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${activeChat.vibe.score}%` }}
                                    transition={{ duration: 1, type: "spring" }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30" onClick={() => otherUser && startCall(otherUser.id, activeChat.name, activeChat.id, false)} disabled={!isOnline}>
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30" onClick={() => otherUser && startCall(otherUser.id, activeChat.name, activeChat.id, true)} disabled={!isOnline}>
                            <Video className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-8" ref={scrollRef}>
                <div className="max-w-4xl mx-auto w-full flex flex-col gap-1.5">
                    <AnimatePresence initial={false} mode="popLayout">
                        {activeMessages.map((msg, index) => {
                            const isMe = msg.senderId === currentUser?.id;
                            const prevMsg = activeMessages[index - 1];
                            const nextMsg = activeMessages[index + 1];

                            const showDateHeader = !prevMsg || !isSameDay(msg.timestamp, prevMsg.timestamp);
                            const dateLabel = formatMessageDate(msg.timestamp);

                            const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId || !!showDateHeader;
                            const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || !isSameDay(msg.timestamp, nextMsg.timestamp);
                            const showAvatar = !isMe && isLastInGroup;

                            return (
                                <React.Fragment key={msg.id}>
                                    {showDateHeader && <DateSeparator date={dateLabel} />}
                                    <MessageBubble
                                        message={msg}
                                        isMe={isMe}
                                        isFirstInGroup={isFirstInGroup}
                                        isLastInGroup={isLastInGroup}
                                        showAvatar={showAvatar}
                                        senderName={msg.sender?.name}
                                        senderAvatar={msg.sender?.avatar}
                                        onReact={(emoji) => handleReact(msg.id, emoji)}
                                        onImageClick={onImageClick}
                                        currentUserId={currentUser?.id}
                                        onReply={setReplyingTo}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </AnimatePresence>

                    {remoteTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/40 border border-white/5 w-fit px-4 py-3 rounded-2xl rounded-tl-none ml-10 mt-2 flex gap-1 items-center"
                        >
                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.32s]" />
                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.16s]" />
                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                        </motion.div>
                    )}
                    <div ref={scrollRef} className="h-4" />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent z-20">

                {/* Smart Replies */}
                <SmartReplies
                    lastMessageContent={activeMessages[activeMessages.length - 1]?.senderId !== currentUser?.id ? activeMessages[activeMessages.length - 1]?.content : undefined}
                    onSelect={(reply) => {
                        setInputValue(reply)
                        // Optional: Auto-send or focus input?
                        // Let's focus input so they can edit if they want, or just hit send
                        // Or just auto-send for "speed"? Let's set value for now.
                    }}
                />

                {/* Reply Context */}
                <ReplyPreview />

                <div className="relative max-w-4xl mx-auto bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] shadow-2xl p-2 transition-colors focus-within:border-white/20 focus-within:bg-zinc-900/80">
                    {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10">
                            <EmojiPicker
                                theme={Theme.DARK}
                                emojiStyle={EmojiStyle.APPLE}
                                onEmojiClick={handleEmojiClick}
                                searchDisabled
                                skinTonesDisabled
                                width={320}
                                height={380}
                            />
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,application/pdf,.doc,.docx"
                    />

                    <form onSubmit={handleSend} className="flex items-end gap-2">
                        {isRecording ? (
                            <AudioRecorder
                                onSend={(file) => {
                                    processFile(file)
                                    setIsRecording(false)
                                }}
                                onCancel={() => setIsRecording(false)}
                            />
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-10 w-10 text-zinc-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-full shrink-0"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </Button>

                                <textarea
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value)
                                        handleTyping()
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend(e)
                                        }
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-0 focus:ring-0 resize-none min-h-[44px] max-h-[120px] py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600 scrollbar-hide font-normal"
                                    rows={1}
                                />

                                <div className="flex items-center gap-1 shrink-0 pb-0.5">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={cn(
                                            "h-10 w-10 rounded-full transition-colors",
                                            showEmojiPicker ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-400 hover:text-zinc-100"
                                        )}
                                    >
                                        <Smile className="h-5 w-5" />
                                    </Button>

                                    {inputValue.trim() ? (
                                        <Button
                                            type="submit"
                                            disabled={!inputValue.trim()}
                                            size="icon"
                                            variant="primary"
                                            className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                                        >
                                            <Send className="h-4 w-4 ml-0.5" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setIsRecording(true)}
                                            className="h-10 w-10 rounded-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <Mic className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </form>
                </div>
                <div className="text-center mt-2 pb-1">
                    <p className="text-[10px] text-zinc-700">Press Enter to send, Shift + Enter for new line</p>
                </div>
            </div>
        </div>
    )
}
