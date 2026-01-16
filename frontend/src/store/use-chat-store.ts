import { create } from 'zustand'

/* =======================
   Types
======================= */

export type User = {
    id: string
    name: string
    username?: string
    avatar: string
    isOnline?: boolean
    statusMessage?: string
    bio?: string
    website?: string
    location?: string
    lastSeen?: string
    role?: 'USER' | 'ADMIN'
}

export type Message = {
    id: string
    content: string
    type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO'
    attachmentUrl?: string
    senderId: string
    sender?: {
        name: string
        avatar: string
    }
    timestamp: string
    status: 'sent' | 'delivered' | 'seen'
    reactions?: any[]
    replyTo?: {
        id: string
        content: string
        sender: {
            name: string
        }
    }
}

export type Conversation = {
    id: string
    name: string
    isGroup: boolean
    avatar: string
    lastMessage?: string
    lastMessageTime?: string
    unreadCount?: number
    participants: User[]
    vibe?: { score: number; label: string }
}

interface ChatState {
    currentUser: User | null
    conversations: Conversation[]
    selectedConversationId: string | null
    messages: Record<string, Message[]>
    replyingTo: Message | null

    setCurrentUser: (user: User) => void
    selectConversation: (id: string | null) => void
    setConversations: (conversations: Conversation[]) => void
    addConversation: (conversation: Conversation) => void
    addMessage: (conversationId: string, message: Message) => void
    setMessages: (conversationId: string, messages: Message[]) => void

    handleMessageReceived: (message: any) => void
    handleReactionAdded: (data: {
        messageId: string
        reaction: any
        conversationId: string
    }) => void

    updateUserStatus: (userId: string, isOnline: boolean, lastSeen?: string) => void
    updateMessageStatus: (
        conversationId: string,
        status: 'seen',
        messageIds?: string[]
    ) => void

    updateVibe: (conversationId: string, score: number, label: string) => void
    setReplyingTo: (message: Message | null) => void
    toggleReactionOptimistic: (
        messageId: string,
        emoji: string,
        userId: string,
        conversationId: string
    ) => void
}

/* =======================
   Store
======================= */

export const useChatStore = create<ChatState>((set) => ({
    currentUser: null,
    conversations: [],
    selectedConversationId: null,
    messages: {},
    replyingTo: null,

    setCurrentUser: (user) => set({ currentUser: user }),
    setReplyingTo: (message) => set({ replyingTo: message }),
    selectConversation: (id) => set({ selectedConversationId: id }),
    setConversations: (conversations) => set({ conversations }),

    addConversation: (conversation) =>
        set((state) => ({
            conversations: [conversation, ...state.conversations],
        })),

    addMessage: (conversationId, message) =>
        set((state) => {
            const existing = state.messages[conversationId] || []
            if (existing.some((m) => m.id === message.id)) return state

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: [...existing, message],
                },
            }
        }),

    setMessages: (conversationId, messages) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: messages,
            },
        })),

    handleMessageReceived: (message) =>
        set((state) => {
            const conversationId = message.conversationId

            const formatted: Message = {
                id: message.id,
                content: message.content,
                type: message.type || 'TEXT',
                attachmentUrl: message.attachmentUrl,
                senderId: message.senderId,
                sender: message.sender
                    ? {
                        name: message.sender.name,
                        avatar: message.sender.avatar,
                    }
                    : undefined,
                timestamp: message.createdAt || new Date().toISOString(),
                status: (message.status || 'sent').toLowerCase(),
                reactions: message.reactions || [],
                replyTo: message.replyTo,
            }

            const current = state.messages[conversationId] || []
            const updatedMessages = current.some((m) => m.id === formatted.id)
                ? current
                : [...current, formatted]

            const conversations = state.conversations.map((c) =>
                c.id === conversationId
                    ? {
                        ...c,
                        lastMessage: formatted.content,
                        lastMessageTime: formatted.timestamp,
                        unreadCount:
                            c.id !== state.selectedConversationId &&
                                message.senderId !== state.currentUser?.id
                                ? (c.unreadCount || 0) + 1
                                : c.unreadCount,
                    }
                    : c
            )

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: updatedMessages,
                },
                conversations,
            }
        }),

    handleReactionAdded: ({ messageId, reaction, conversationId }) =>
        set((state) => {
            const msgs = state.messages[conversationId]
            if (!msgs) return state

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: msgs.map((m) =>
                        m.id === messageId
                            ? {
                                ...m,
                                reactions: reaction.isDeleted
                                    ? (m.reactions || []).filter(
                                        (r) =>
                                            !(
                                                r.userId === reaction.userId &&
                                                r.emoji === reaction.emoji
                                            )
                                    )
                                    : [...(m.reactions || []), reaction],
                            }
                            : m
                    ),
                },
            }
        }),

    updateUserStatus: (userId, isOnline, lastSeen) =>
        set((state) => ({
            conversations: state.conversations.map((c) => ({
                ...c,
                participants: c.participants.map((p) =>
                    p.id === userId ? { ...p, isOnline, lastSeen } : p
                ),
            })),
        })),

    updateMessageStatus: (conversationId, status, messageIds) =>
        set((state) => {
            const msgs = state.messages[conversationId]
            if (!msgs) return state

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: msgs.map((m) =>
                        messageIds && !messageIds.includes(m.id)
                            ? m
                            : { ...m, status }
                    ),
                },
            }
        }),

    updateVibe: (conversationId, score, label) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === conversationId
                    ? { ...c, vibe: { score, label } }
                    : c
            ),
        })),

    toggleReactionOptimistic: (messageId, emoji, userId, conversationId) =>
        set((state) => {
            const msgs = state.messages[conversationId]
            if (!msgs) return state

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: msgs.map((m) => {
                        if (m.id !== messageId) return m

                        const reactions = m.reactions || []
                        const index = reactions.findIndex(
                            (r) => r.userId === userId && r.emoji === emoji
                        )

                        return {
                            ...m,
                            reactions:
                                index !== -1
                                    ? reactions.filter((_, i) => i !== index)
                                    : [
                                        ...reactions,
                                        {
                                            id: `opt-${Date.now()}`,
                                            emoji,
                                            userId,
                                            messageId,
                                            fake: true,
                                        },
                                    ],
                        }
                    }),
                },
            }
        }),
}))
