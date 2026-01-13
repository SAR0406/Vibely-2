import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/store/use-chat-store';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const { handleMessageReceived, updateUserStatus, updateMessageStatus } = useChatStore();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                extraHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        socket.on('message', (message: any) => {
            console.log('Received message (active):', message);
            handleMessageReceived(message);
        });

        socket.on('messageUpdate', (message: any) => {
            console.log('Received message update (sidebar):', message);
            handleMessageReceived(message);
        });

        socket.on('userStatusChanged', (data: any) => {
            console.log('User status changed:', data);
            updateUserStatus(data.id, data.isOnline, data.lastSeen);
        });

        socket.on('messagesSeen', (data: any) => {
            console.log('Messages seen:', data);
            updateMessageStatus(data.conversationId, 'seen');
        });

        socket.on('reactionAdded', (data: { messageId: string, reaction: any, conversationId: string }) => {
            console.log('Reaction added:', data);
            const { handleReactionAdded } = useChatStore.getState();
            handleReactionAdded(data);
        });

        socket.on('system:announcement', (data: { content: string, type: string }) => {
            console.log('System Announcement:', data);
            // In a real app we'd use a nice toast. For now, alert to ensure it's seen.
            alert(`📢 VIBELY SYSTEM ALERT:\n\n${data.content}`);
        });

        socket.on('auth:stale', () => {
            console.warn('Authentication stale (user not found in DB). Clearing storage.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        });

        return () => {
            // Keep connection alive across re-renders unless explicitly destroyed
            // or if the token changes
        };
    }, [handleMessageReceived, updateUserStatus, updateMessageStatus]);

    return socketRef.current;
};
