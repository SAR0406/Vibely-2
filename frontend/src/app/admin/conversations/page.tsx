"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    MessageSquare,
    Search,
    Shield,
    Trash2,
    Eye,
    MessageCircle,
    User,
    Calendar,
    ArrowLeft,
    MoreVertical,
    Lock
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { adminApi } from "@/services/api"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
    id: string
    name: string | null
    isGroup: boolean
    lastMessageAt: string
    participants: { user: { name: string, email: string, avatar: string } }[]
    _count: { messages: number }
}

interface Message {
    id: string
    content: string
    createdAt: string
    senderId: string
    sender: { name: string, avatar: string }
}

export default function ConversationModeration() {
    const [conversations, setConversations] = React.useState<Conversation[]>([])
    const [selectedConvo, setSelectedConvo] = React.useState<Conversation | null>(null)
    const [messages, setMessages] = React.useState<Message[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")

    const fetchConversations = React.useCallback(async () => {
        try {
            const { data } = await adminApi.getAllConversations()
            setConversations(data.conversations)
        } catch (error) {
            console.error("Failed to fetch conversations", error)
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    const handleViewConversation = async (convo: Conversation) => {
        setSelectedConvo(convo)
        try {
            const { data } = await adminApi.getConversationMessages(convo.id)
            setMessages(data)
        } catch (error) {
            console.error("Failed to fetch messages", error)
        }
    }

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return
        try {
            await adminApi.deleteMessage(messageId)
            setMessages(prev => prev.filter(m => m.id !== messageId))
        } catch (error) {
            console.error(error)
            alert("Failed to delete message")
        }
    }

    const filteredConversations = conversations.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.participants.some(p => p.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <AdminLayout>
            <div className="space-y-8">
                <AnimatePresence mode="wait">
                    {!selectedConvo ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Global Conversations</h1>
                                    <p className="text-zinc-500 mt-1">Monitor and moderate all messaging channels across the platform.</p>
                                </div>
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <Input
                                        placeholder="Search participants or groups..."
                                        className="pl-10 bg-white/5 border-white/10 text-white rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {loading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
                                    ))
                                ) : filteredConversations.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-zinc-500">No conversations found.</div>
                                ) : filteredConversations.map((convo) => (
                                    <Card
                                        key={convo.id}
                                        className="bg-zinc-900/50 border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group"
                                        onClick={() => handleViewConversation(convo)}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {convo.participants.slice(0, 3).map((p, i) => (
                                                        <img
                                                            key={i}
                                                            src={p.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user.name}`}
                                                            className="w-8 h-8 rounded-full border-2 border-zinc-900"
                                                            alt={p.user.name}
                                                        />
                                                    ))}
                                                    {convo.participants.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] text-zinc-400">
                                                            +{convo.participants.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="border-white/10 text-zinc-500 bg-white/5">
                                                    {convo.isGroup ? "Group" : "DM"}
                                                </Badge>
                                            </div>
                                            <h3 className="font-bold text-white truncate mb-1">
                                                {convo.name || convo.participants.map(p => p.user.name).join(", ")}
                                            </h3>
                                            <p className="text-xs text-zinc-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Active {formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: true })}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                                                    {convo._count.messages} Total Messages
                                                </span>
                                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Eye className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedConvo(null)}
                                    className="hover:bg-white/5"
                                >
                                    <ArrowLeft className="w-5 h-5 text-zinc-400" />
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold flex items-center gap-3">
                                        {selectedConvo.name || "Conversation Details"}
                                        <Badge className="bg-indigo-500/20 text-indigo-400 border-0">Moderation View</Badge>
                                    </h1>
                                    <p className="text-sm text-zinc-500 mt-1">Viewing history of channel <code>{selectedConvo.id}</code></p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-4">
                                <div className="md:col-span-3 space-y-4">
                                    <Card className="bg-black/40 border-white/5 min-h-[600px] flex flex-col">
                                        <CardHeader className="border-b border-white/5 py-4">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4 text-indigo-400" />
                                                Message History
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 flex-1 overflow-auto max-h-[600px] space-y-6">
                                            {messages.map((msg) => (
                                                <div key={msg.id} className="flex gap-4 group">
                                                    <img
                                                        src={msg.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.name}`}
                                                        className="w-8 h-8 rounded-full"
                                                        alt={msg.sender.name}
                                                    />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-white">{msg.sender.name}</span>
                                                            <span className="text-[10px] text-zinc-600 font-mono">
                                                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                                            {msg.content}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {messages.length === 0 && (
                                                <div className="h-full flex items-center justify-center text-zinc-600 italic">No messages recorded in this scope.</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-6">
                                    <Card className="bg-zinc-900/50 border-white/5 overflow-hidden">
                                        <CardHeader className="bg-white/5 border-b border-white/10">
                                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-400">Participants</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-4">
                                            {selectedConvo.participants.map((p, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <img src={p.user.avatar} className="w-8 h-8 rounded-full" alt="" />
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-bold text-white truncate">{p.user.name}</p>
                                                        <p className="text-[10px] text-zinc-500 truncate">{p.user.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-red-500/5 border-red-500/10">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-bold text-red-400 flex items-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                Danger Zone
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <Button variant="outline" className="w-full text-xs border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl">
                                                Freeze Channel
                                            </Button>
                                            <Button variant="outline" className="w-full text-xs border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl">
                                                Clear History
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    )
}
