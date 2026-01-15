"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Check, Loader2, X, Camera, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/design-system/button";
import { Input } from "@/components/design-system/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { friendsApi, chatApi } from "@/services/api";
import { useChatStore, User } from "@/store/use-chat-store";
import { cn } from "@/lib/utils";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MAX_MEMBERS = 50;

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
    const [groupName, setGroupName] = React.useState('');
    const [groupDescription, setGroupDescription] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [friends, setFriends] = React.useState<User[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [loading, setLoading] = React.useState(false);
    const [loadingFriends, setLoadingFriends] = React.useState(false);
    const [groupAvatar, setGroupAvatar] = React.useState<string>('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { addConversation, selectConversation } = useChatStore();

    React.useEffect(() => {
        if (isOpen) {
            setGroupName('');
            setGroupDescription('');
            setSearchQuery('');
            setSelectedIds(new Set());
            setGroupAvatar('');
            loadFriends();
        }
    }, [isOpen]);

    const loadFriends = async () => {
        setLoadingFriends(true);
        try {
            const { data } = await friendsApi.getFriends();
            setFriends(data.map((f: any) => f.friend));
        } catch (error) {
            console.error('Failed to load friends:', error);
        } finally {
            setLoadingFriends(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setGroupAvatar(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleUser = (userId: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else if (newSelected.size < MAX_MEMBERS) {
            newSelected.add(userId);
        }
        setSelectedIds(newSelected);
    };

    const handleCreate = async () => {
        if (!groupName || selectedIds.size === 0) return;

        setLoading(true);
        try {
            const { data } = await chatApi.createGroup({
                name: groupName,
                participantIds: Array.from(selectedIds),
                avatar: groupAvatar || undefined,
            });

            const otherParticipants = data.participants.map((p: any) => ({
                id: p.user.id,
                name: p.user.name,
                avatar: p.user.avatar,
                isOnline: p.user.isOnline,
            }));

            const newConvo = {
                id: data.id,
                name: data.name,
                isGroup: true,
                avatar: data.avatar || groupAvatar || '',
                participants: otherParticipants,
                unreadCount: 0,
            };

            addConversation(newConvo);
            selectConversation(data.id);
            onClose();
        } catch (error) {
            console.error('Failed to create group:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFriends = friends.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedFriends = friends.filter(f => selectedIds.has(f.id));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#09090b]/95 backdrop-blur-2xl border-white/5 text-white p-0 gap-0 sm:rounded-[28px] overflow-hidden shadow-2xl max-w-lg">
                {/* Animated gradient background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-6 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"
                >
                    <div className="flex items-center justify-between">
                        <DialogHeader className="p-0">
                            <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
                                <motion.div
                                    className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Users className="h-5 w-5 text-indigo-400" />
                                </motion.div>
                                <span className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                    Create Group
                                </span>
                            </DialogTitle>
                        </DialogHeader>
                        <motion.button
                            onClick={onClose}
                            className="rounded-full p-2.5 hover:bg-white/10 transition-all duration-200 text-zinc-400 hover:text-white hover:rotate-90"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>

                <div className="relative p-6 space-y-6">
                    {/* Group Avatar & Name Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-start gap-4"
                    >
                        {/* Avatar Picker */}
                        <motion.div
                            onClick={handleAvatarClick}
                            className="relative cursor-pointer group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="relative">
                                <Avatar className="h-20 w-20 border-2 border-dashed border-white/20 group-hover:border-indigo-500/50 transition-colors">
                                    {groupAvatar ? (
                                        <AvatarImage src={groupAvatar} />
                                    ) : (
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400">
                                            <Users className="h-8 w-8" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-500 rounded-full border-2 border-[#09090b] shadow-lg">
                                    <Camera className="h-3 w-3 text-white" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Name & Description */}
                        <div className="flex-1 space-y-3">
                            <Input
                                placeholder="Group name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="bg-zinc-900/50 border-white/10 h-12 text-base font-medium focus:border-indigo-500/50 focus:ring-indigo-500/20"
                            />
                            <Input
                                placeholder="Description (optional)"
                                value={groupDescription}
                                onChange={(e) => setGroupDescription(e.target.value)}
                                className="bg-zinc-900/50 border-white/10 h-10 text-sm text-zinc-400 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                            />
                        </div>
                    </motion.div>

                    {/* Selected Members Preview */}
                    <AnimatePresence>
                        {selectedFriends.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center gap-2 px-1">
                                    <Sparkles className="h-4 w-4 text-indigo-400" />
                                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                        Selected
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedFriends.map((friend) => (
                                        <motion.div
                                            key={friend.id}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            layout
                                            className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full pl-1 pr-3 py-1"
                                        >
                                            <Avatar className="h-6 w-6 border border-indigo-500/20">
                                                <AvatarImage src={friend.avatar} />
                                                <AvatarFallback className="bg-indigo-500/20 text-xs">{friend.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-medium text-indigo-200">{friend.name.split(' ')[0]}</span>
                                            <button
                                                onClick={() => toggleUser(friend.id)}
                                                className="text-indigo-400 hover:text-white transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Member Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                Add Members
                            </label>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-xs font-medium px-2.5 py-1 rounded-full border transition-colors",
                                    selectedIds.size > 0
                                        ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                                        : "text-zinc-500 bg-zinc-800/50 border-zinc-700/50"
                                )}>
                                    {selectedIds.size} / {MAX_MEMBERS}
                                </span>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-11 pl-11 pr-4 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>

                        <ScrollArea className="h-[200px] -mx-2 px-2">
                            {loadingFriends ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                                    <span className="text-sm text-zinc-500">Loading friends...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-1.5">
                                    {filteredFriends.map((friend, index) => (
                                        <motion.div
                                            key={friend.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => toggleUser(friend.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 border group",
                                                selectedIds.has(friend.id)
                                                    ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                                                    : "hover:bg-white/5 border-transparent bg-transparent"
                                            )}
                                        >
                                            <div className="relative">
                                                <Avatar className={cn(
                                                    "h-11 w-11 border-2 transition-colors",
                                                    selectedIds.has(friend.id) ? "border-indigo-500/50" : "border-white/5"
                                                )}>
                                                    <AvatarImage src={friend.avatar} />
                                                    <AvatarFallback className="bg-zinc-800 text-zinc-400">{friend.name[0]}</AvatarFallback>
                                                </Avatar>
                                                {friend.isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#09090b]" />
                                                )}
                                                <AnimatePresence>
                                                    {selectedIds.has(friend.id) && (
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0, opacity: 0 }}
                                                            className="absolute -bottom-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-1 ring-2 ring-[#09090b] shadow-lg"
                                                        >
                                                            <Check className="h-2.5 w-2.5 text-white" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                                                    {friend.name}
                                                    {friend.isOnline && (
                                                        <span className="text-[10px] text-green-400 font-normal">online</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-zinc-500 truncate">
                                                    @{friend.username || friend.name.toLowerCase().replace(/\s+/g, '')}
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedIds.has(friend.id)
                                                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent"
                                                    : "border-zinc-600 group-hover:border-zinc-400"
                                            )}>
                                                {selectedIds.has(friend.id) && <Check className="h-3.5 w-3.5 text-white" />}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {filteredFriends.length === 0 && !loadingFriends && (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
                                                <Users className="h-8 w-8 text-zinc-600" />
                                            </div>
                                            <p className="text-zinc-500 text-sm">No friends found</p>
                                            <p className="text-zinc-600 text-xs mt-1">Try a different search</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </motion.div>

                    {/* Create Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Button
                            onClick={handleCreate}
                            disabled={loading || !groupName || selectedIds.size === 0}
                            variant="primary"
                            className={cn(
                                "w-full h-13 text-base font-bold rounded-xl transition-all duration-300",
                                "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
                                "hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600",
                                "shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30",
                                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            )}
                            isLoading={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Crown className="h-5 w-5" />
                                    Create Group
                                </span>
                            )}
                        </Button>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
