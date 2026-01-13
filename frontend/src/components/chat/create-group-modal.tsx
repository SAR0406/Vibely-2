"use client";

import * as React from "react";
import { Users, Search, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/design-system/button";
import { Input } from "@/components/design-system/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { friendsApi, chatApi } from "@/services/api";
import { useChatStore, User } from "@/store/use-chat-store";
import { cn } from "@/lib/utils";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
    const [groupName, setGroupName] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [friends, setFriends] = React.useState<User[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [loading, setLoading] = React.useState(false);
    const { addConversation, selectConversation } = useChatStore();

    React.useEffect(() => {
        if (isOpen) {
            loadFriends();
        }
    }, [isOpen]);

    const loadFriends = async () => {
        try {
            const { data } = await friendsApi.getFriends();
            setFriends(data.map((f: any) => f.friend));
        } catch (error) {
            console.error('Failed to load friends:', error);
        }
    };

    const toggleUser = (userId: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
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
                avatar: data.avatar || '',
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#09090b] border-white/5 text-white p-0 gap-0 sm:rounded-[24px] overflow-hidden shadow-2xl max-w-md">
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 flex items-center justify-between">
                    <DialogHeader className="p-0">
                        <DialogTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/10">
                                <Users className="h-5 w-5 text-indigo-400" />
                            </div>
                            Create Group
                        </DialogTitle>
                    </DialogHeader>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-white/5 transition-colors text-zinc-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                            Group Name
                        </label>
                        <Input
                            placeholder="e.g. Weekend Trip Squad"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="bg-zinc-900/50 border-white/5 h-12 text-base"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                Select Members
                            </label>
                            <span className="text-xs text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/10">
                                {selectedIds.size} selected
                            </span>
                        </div>

                        <Input
                            placeholder="Search friends..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<Search className="h-4 w-4" />}
                            className="bg-zinc-900/50 border-white/5"
                        />

                        <ScrollArea className="h-[240px] -mx-2 px-2 mt-2">
                            <div className="grid grid-cols-1 gap-1">
                                {filteredFriends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        onClick={() => toggleUser(friend.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border",
                                            selectedIds.has(friend.id)
                                                ? "bg-indigo-500/10 border-indigo-500/20 shadow-[inset_0_0_10px_rgba(99,102,241,0.05)]"
                                                : "hover:bg-white/5 border-transparent bg-transparent"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border border-white/5">
                                                <AvatarImage src={friend.avatar} />
                                                <AvatarFallback className="bg-zinc-800 text-zinc-400">{friend.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {selectedIds.has(friend.id) && (
                                                <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-0.5 ring-2 ring-[#09090b] animate-in zoom-in-50 duration-200">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white truncate">
                                                {friend.name}
                                            </div>
                                            <div className="text-xs text-zinc-500 truncate">
                                                @{friend.username || friend.name.toLowerCase().replace(/\s+/g, '')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredFriends.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-zinc-500 text-sm">No friends found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <Button
                        onClick={handleCreate}
                        disabled={loading || !groupName || selectedIds.size === 0}
                        variant="primary"
                        className="w-full h-12 text-base font-semibold shadow-xl shadow-indigo-500/10"
                        isLoading={loading}
                    >
                        Create Group
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
