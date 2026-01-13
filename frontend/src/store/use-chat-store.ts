import { create } from 'zustand'
import { formatMessageTime } from '@/lib/date-utils'

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
}

interface ChatState {
    currentUser: User | null
    conversations: Conversation[]
    selectedConversationId: string | null
    messages: Record<string, Message[]>

    setCurrentUser: (user: User) => void
    selectConversation: (id: string | null) => void
    setConversations: (conversations: Conversation[]) => void
    addConversation: (conversation: Conversation) => void
    addMessage: (conversationId: string, message: Message) => void
    setMessages: (conversationId: string, messages: Message[]) => void
    handleMessageReceived: (message: any) => void
    handleReactionAdded: (data: { messageId: string, reaction: any, conversationId: string }) => void
    updateUserStatus: (userId: string, isOnline: boolean, lastSeen?: string) => void
    updateMessageStatus: (conversationId: string, status: 'seen') => void

    replyingTo: Message | null
    setReplyingTo: (message: Message | null) => void

    // Optimistic and real-time updates
    toggleReactionOptimistic: (messageId: string, emoji: string, userId: string, conversationId: string) => void
}

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

    addConversation: (conversation) => set((state) => ({
        conversations: [conversation, ...state.conversations]
    })),

    addMessage: (conversationId, message) => set((state) => {
        const currentMessages = state.messages[conversationId] || [];
        // Check if message already exists (to avoid duplicates from echo)
        if (currentMessages.find(m => m.id === message.id)) return state;

        return {
            messages: {
                ...state.messages,
                [conversationId]: [...currentMessages, message]
            }
        };
    }),

    setMessages: (conversationId, messages) => set((state) => ({
        messages: {
            ...state.messages,
            [conversationId]: messages
        }
    })),

    handleMessageReceived: (message) => set((state) => {
        const conversationId = message.conversationId;
        const formattedMsg: Message = {
            id: message.id,
            content: message.content,
            type: message.type || 'TEXT',
            attachmentUrl: message.attachmentUrl,
            senderId: message.senderId,
            sender: message.sender ? {
                name: message.sender.name,
                avatar: message.sender.avatar
            } : undefined,
            timestamp: message.createdAt || new Date().toISOString(),
            status: (message.status || 'SENT').toLowerCase() as any,
            reactions: message.reactions || [],
            replyTo: message.replyTo
        };

        // 1. Update messages history
        const currentMessages = state.messages[conversationId] || [];

        // Find if there's an optimistic message that "matches" this one
        // (same sender, same content, and it was sent as "Sending...")
        let foundOptimisticIndex = -1;
        if (message.senderId === state.currentUser?.id) {
            foundOptimisticIndex = currentMessages.findIndex(m =>
                (m.id.length > 15 || isNaN(Number(m.id))) === false && // Simple check for temp numeric IDs
                m.content === formattedMsg.content &&
                m.status === 'sent' // Optimistic messages are marked 'sent' but keep numeric IDs
            );
        }

        let updatedMessages;
        if (foundOptimisticIndex !== -1) {
            // Replace the optimistic message with the real one
            updatedMessages = [...currentMessages];
            updatedMessages[foundOptimisticIndex] = formattedMsg;
        } else {
            // Just add if not duplicate by ID
            const isDuplicate = currentMessages.some(m => m.id === message.id);
            updatedMessages = isDuplicate ? currentMessages : [...currentMessages, formattedMsg];
        }

        // 2. Update conversation list item
        const updatedConversations = state.conversations.map(convo => {
            if (convo.id === conversationId) {
                return {
                    ...convo,
                    lastMessage: message.content,
                    lastMessageTime: formattedMsg.timestamp,
                    unreadCount: (convo.id !== state.selectedConversationId && message.senderId !== state.currentUser?.id)
                        ? (convo.unreadCount || 0) + 1
                        : convo.unreadCount
                };
            }
            return convo;
        });

        // 3. Move active conversation to top
        const activeConvo = updatedConversations.find(c => c.id === conversationId);
        const otherConvos = updatedConversations.filter(c => c.id !== conversationId);
        const reorderedConversations = activeConvo ? [activeConvo, ...otherConvos] : updatedConversations;

        return {
            messages: {
                ...state.messages,
                [conversationId]: updatedMessages
            },
            conversations: reorderedConversations
        };
    }),

    handleReactionAdded: ({ messageId, reaction, conversationId }) => set((state) => {
        const convoMessages = state.messages[conversationId];
        if (!convoMessages) return state;

        return {
            messages: {
                ...state.messages,
                [conversationId]: convoMessages.map(m => {
                    if (m.id === messageId) {
                        const existingReactions = m.reactions || [];

                        // Check if the backend response indicates the reaction was added or removed
                        // If 'reaction' is the full object that was just toggled
                        // We need a way to know if it was added or removed.
                        // Usually prisma .delete returns the deleted object.
                        // Let's assume if it exists in locally, we remove it, else add it.
                        // BUT better to check if it's already in the list by some unique constraint (userId, emoji)

                        const existingIndex = existingReactions.findIndex(r => r.id === reaction.id);
                        const sameUserEmojiIndex = existingReactions.findIndex(r =>
                            r.userId === reaction.userId && r.emoji === reaction.emoji
                        );

                        let updatedReactions;

                        if (reaction.isDeleted) {
                            // Server says it's deleted. Remove any matching instances.
                            updatedReactions = existingReactions.filter(r =>
                                r.id !== reaction.id &&
                                !(r.userId === reaction.userId && r.emoji === reaction.emoji)
                            );
                        } else {
                            // Server says it's added.
                            if (sameUserEmojiIndex !== -1) {
                                // Replace optimistic or duplicate with real server one
                                updatedReactions = [...existingReactions];
                                updatedReactions[sameUserEmojiIndex] = reaction;
                            } else {
                                // Add new
                                updatedReactions = [...existingReactions, reaction];
                            }
                        }

                        return { ...m, reactions: updatedReactions };
                    }
                    return m;
                })
            }
        };
    }),

    updateUserStatus: (userId, isOnline, lastSeen) => set((state) => ({
        conversations: state.conversations.map(convo => ({
            ...convo,
            participants: convo.participants.map(p =>
                p.id === userId ? { ...p, isOnline, lastSeen } : p
            )
        }))
    })),

    updateMessageStatus: (conversationId, status) => set((state) => {
        const convoMessages = state.messages[conversationId];
        if (!convoMessages) return state;

        return {
            messages: {
                ...state.messages,
                [conversationId]: convoMessages.map(m => ({ ...m, status }))
            }
        };
    }),
    toggleReactionOptimistic: (messageId, emoji, userId, conversationId) => set((state) => {
        const convoMessages = state.messages[conversationId] || [];
        if (!convoMessages.length) return state;

        return {
            messages: {
                ...state.messages,
                [conversationId]: convoMessages.map(m => {
                    if (m.id === messageId) {
                        const existingReactions = m.reactions || [];
                        const existingIndex = existingReactions.findIndex(r => r.userId === userId && r.emoji === emoji);

                        let updatedReactions;
                        if (existingIndex !== -1) {
                            // Remove (Optimistic toggle off)
                            updatedReactions = existingReactions.filter((_, idx) => idx !== existingIndex);
                        } else {
                            // Add (Optimistic toggle on)
                            updatedReactions = [
                                ...existingReactions,
                                {
                                    id: `opt-${Date.now()}`, // Temporary ID
                                    emoji,
                                    userId,
                                    messageId,
                                    fake: true // Flag to identify optimistic update if needed
                                }
                            ];
                        }
                        return { ...m, reactions: updatedReactions };
                    }
                    return m;
                })
            }
        };
    })
}))
