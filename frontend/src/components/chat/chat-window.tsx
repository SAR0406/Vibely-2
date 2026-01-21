"use client"

import * as React from "react"
import {
    Send, Phone, Video, Info, Paperclip, Check, CheckCheck, Smile,
    Search, Download, FileText, X, Reply, Mic, ChevronLeft,
    Image as ImageIcon, MoreVertical, Sparkles
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
import { ProfileModal } from "./profile-modal"

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
    const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false)
    const [isReportModalOpen, setIsReportModalOpen] = React.useState(false)
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
            <div className="h-full w-full flex items-center justify-center flex-col gap-8 bg-[#050505] relative overflow-hidden">
                {/* Harmonic Background Layers */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute inset-0 noise-overlay opacity-[0.03] pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    className="relative z-10 flex flex-col items-center text-center px-6"
                >
                    <div className="relative mb-10">
                        <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full opacity-50 animate-pulse" />
                        <div className="w-32 h-32 bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-700 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_80px_-20px_rgba(34,211,238,0.4)] border border-white/20 relative overflow-hidden group hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <Sparkles className="w-12 h-12 text-white relative z-10 brightness-110" />
                        </div>
                    </div>

                    <h3 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">
                        Establishing <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Connection</span>
                    </h3>
                    <p className="text-zinc-500 text-center max-w-sm mb-12 font-medium tracking-tight text-base leading-relaxed">
                        Nexus Core is standing by. Synchronize with a Node to begin data transmission and collaborative processing.
                    </p>

                    <Button
                        variant="glass"
                        size="lg"
                        className="h-14 rounded-2xl px-10 bg-white/5 hover:bg-white/10 border-white/10 backdrop-blur-2xl group transition-all"
                        onClick={() => window.location.href = '/search'}
                    >
                        <Search className="w-5 h-5 mr-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase tracking-[0.2em] text-xs">Scan for Nodes</span>
                    </Button>
                </motion.div>

                {/* Bottom Status Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Nexus Operational // Region Alpha</span>
                </div>
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
            {/* Background Texture Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-700 ease-in-out noise-overlay opacity-20" />

            {/* Wallpaper Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-500 ease-in-out">
                {wallpaper === 'grid' && <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />}
                {wallpaper === 'dots' && <div className="absolute inset-0 bg-[radial-gradient(circle_1px_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:30px_30px]" />}
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
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-50 bg-indigo-500/10 backdrop-blur-md border-2 border-indigo-500/30 border-dashed m-10 rounded-[3rem] flex items-center justify-center pointer-events-none"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center backdrop-blur-xl shadow-2xl border border-indigo-500/20">
                                <Download className="h-10 w-10 text-indigo-300 animate-bounce" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-white uppercase tracking-widest">Inject Data</h3>
                                <p className="text-zinc-500 text-sm mt-2 font-medium tracking-tight">Drop files to broadcast to Nexus Node</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header - Nexus Control Bar */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#050505]/40 backdrop-blur-3xl z-20 relative">
                <div className="flex items-center gap-5">
                    {isMobile && (
                        <Button
                            variant="glass"
                            size="icon"
                            className="text-zinc-400 -ml-2 hover:bg-white/5 rounded-2xl"
                            onClick={() => selectConversation(null)}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div className="relative group cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-[1.2rem] blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Avatar className="h-12 w-12 border border-white/10 rounded-[1.2rem] shadow-2xl relative z-10 transition-all group-hover:border-white/20">
                                <AvatarImage src={activeChat.avatar} className="object-cover" />
                                <AvatarFallback className="bg-zinc-800 text-zinc-500 font-black tracking-tight">{activeChat.name[0]}</AvatarFallback>
                            </Avatar>
                        </motion.div>
                        {isOnline && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3.5px] border-[#050505] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-white tracking-tight uppercase text-base">{activeChat.name}</span>
                            <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">
                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Node Verified</span>
                            </div>
                        </div>
                        <div className="mt-1">
                            {remoteTyping ? (
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 animate-pulse">Analyzing Input...</span>
                            ) : (
                                <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isOnline ? "text-emerald-500/80" : "text-zinc-600")}>
                                    {isOnline ? 'Nexus Stream Active' : (otherUser?.lastSeen ? `Disconnected ${formatDistance(otherUser.lastSeen)}` : 'Node Offline')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vibe Meter - Premium Analyzer Style */}
                <div className="flex items-center gap-8">
                    {activeChat.vibe && (
                        <div className="hidden lg:flex flex-col items-end gap-2">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-zinc-600 tracking-widest uppercase mb-0.5">Atmosphere Analyser</span>
                                    <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase tracking-tighter">
                                        {activeChat.vibe.label}
                                    </span>
                                </div>
                                <div className="h-10 w-[1px] bg-white/5" />
                                <div className="flex flex-col items-start min-w-[3rem]">
                                    <span className="text-[9px] font-black text-zinc-600 tracking-widest uppercase mb-0.5">Vector</span>
                                    <span className="text-xs font-mono font-black text-zinc-400">
                                        {activeChat.vibe.score}.00
                                    </span>
                                </div>
                            </div>
                            <div className="w-40 h-1 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${activeChat.vibe.score}%` }}
                                    transition={{ duration: 1.5, type: "spring", bounce: 0 }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Button
                            variant="glass"
                            size="icon"
                            className="h-10 w-10 text-white hover:bg-white/10 rounded-2xl border-white/10 transition-all active:scale-90"
                            onClick={() => otherUser && startCall(otherUser.id, activeChat.name, activeChat.id, false)}
                            disabled={!isOnline}
                        >
                            <Phone className="h-4.5 w-4.5" />
                        </Button>
                        <Button
                            variant="glass"
                            size="icon"
                            className="h-10 w-10 text-white hover:bg-indigo-500/20 hover:text-indigo-300 rounded-2xl border-white/10 transition-all active:scale-90"
                            onClick={() => otherUser && startCall(otherUser.id, activeChat.name, activeChat.id, true)}
                            disabled={!isOnline}
                        >
                            <Video className="h-4.5 w-4.5" />
                        </Button>
                        <div className="w-[1px] h-8 bg-white/5 mx-2" />
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500 hover:text-white rounded-2xl">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="glass"
                            size="icon"
                            className="h-10 w-10 text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-2xl border-white/5 transition-all"
                            onClick={() => setIsReportModalOpen(true)}
                        >
                            <Flag className="h-4.5 w-4.5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <ScrollArea className="flex-1" ref={scrollRef}>
                <div className="max-w-4xl mx-auto w-full flex flex-col gap-2 px-8 py-12">
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
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/[0.03] border border-white/10 w-fit px-5 py-4 rounded-[2rem] rounded-tl-none ml-14 mt-2 flex gap-1.5 items-center shadow-2xl backdrop-blur-xl"
                        >
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.32s] shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.16s] shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                        </motion.div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area - Nexus Floating Command Node */}
            <div className="px-8 pb-8 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
                <div className="max-w-4xl mx-auto flex flex-col">

                    <SmartReplies
                        lastMessageContent={activeMessages[activeMessages.length - 1]?.senderId !== currentUser?.id ? activeMessages[activeMessages.length - 1]?.content : undefined}
                        onSelect={(reply) => setInputValue(reply)}
                    />

                    <ReplyPreview />

                    <div className="relative glass-card border-white/10 rounded-[2.5rem] p-3 transition-all duration-500 focus-within:border-indigo-500/40 focus-within:bg-black/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">

                        {/* Status Light */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px w-12 h-1 bg-indigo-500/40 rounded-b-full blur-sm group-focus-within:bg-cyan-400 transition-colors" />

                        {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 mb-6 z-50 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a0a0a] backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-5 duration-300">
                                <EmojiPicker
                                    theme={Theme.DARK}
                                    emojiStyle={EmojiStyle.APPLE}
                                    onEmojiClick={handleEmojiClick}
                                    searchDisabled
                                    skinTonesDisabled
                                    width={340}
                                    height={400}
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

                        <form onSubmit={handleSend} className="flex items-end gap-3 px-2">
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
                                        variant="glass"
                                        size="icon"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-12 w-12 text-zinc-500 hover:text-cyan-400 hover:bg-white/5 rounded-3xl shrink-0 transition-all active:scale-90"
                                    >
                                        <Paperclip className="h-5.5 w-5.5" />
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
                                        placeholder="Transmit signal to Nexus..."
                                        className="flex-1 bg-transparent border-0 focus:ring-0 resize-none min-h-[52px] max-h-[200px] py-4 text-[15px] font-medium text-white placeholder:text-zinc-700 scrollbar-hide"
                                        rows={1}
                                    />

                                    <div className="flex items-center gap-2 shrink-0 pb-1.5">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className={cn(
                                                "h-12 w-12 rounded-3xl transition-all active:scale-90",
                                                showEmojiPicker ? "text-cyan-400 bg-cyan-400/10" : "text-zinc-500 hover:text-white"
                                            )}
                                        >
                                            <Smile className="h-6 w-6" />
                                        </Button>

                                        {inputValue.trim() ? (
                                            <Button
                                                type="submit"
                                                size="icon"
                                                className="h-12 w-12 rounded-[1.4rem] bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-90 transition-all"
                                            >
                                                <Send className="h-5 w-5 ml-0.5" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setIsRecording(true)}
                                                className="h-12 w-12 rounded-3xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all"
                                            >
                                                <Mic className="h-6 w-6" />
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                type="user"
                targetId={activeChat?.id}
                targetName={activeChat?.name}
            />
        </div>
    )
}
