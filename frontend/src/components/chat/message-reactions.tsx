'use client';

import * as React from 'react';
import { Smile, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';

interface MessageReactionsProps {
    reactions: any[];
    onReact: (emoji: string) => void;
    currentUserId?: string;
}

export function MessageReactions({ reactions, onReact, currentUserId }: MessageReactionsProps) {
    const [showPicker, setShowPicker] = React.useState(false);

    // Group reactions by emoji
    const reactionGroups = reactions.reduce((acc: any, curr: any) => {
        if (!acc[curr.emoji]) {
            acc[curr.emoji] = { count: 0, hasReacted: false };
        }
        acc[curr.emoji].count += 1;
        if (curr.userId === currentUserId) {
            acc[curr.emoji].hasReacted = true;
        }
        return acc;
    }, {});

    return (
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {Object.entries(reactionGroups).map(([emoji, data]: [string, any]) => (
                <motion.button
                    key={emoji}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onReact(emoji)}
                    className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all text-[11px] font-medium backdrop-blur-sm select-none",
                        data.hasReacted
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200 hover:bg-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                            : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-zinc-400 hover:text-zinc-300"
                    )}
                >
                    <span>{emoji}</span>
                    <span className={cn("text-[10px]", data.hasReacted ? "opacity-100" : "opacity-70")}>{data.count}</span>
                </motion.button>
            ))}

            <div className="relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPicker(!showPicker)}
                    className="h-5 w-5 rounded-full bg-white/0 border border-transparent hover:border-white/10 hover:bg-white/5 text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                    <Plus className="h-3 w-3" />
                </Button>

                {showPicker && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setShowPicker(false)}
                        />
                        <div className="absolute bottom-full left-0 z-50 mb-2">
                            <div className="shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#18181b]">
                                <EmojiPicker
                                    theme={Theme.DARK}
                                    onEmojiClick={(emojiData: EmojiClickData) => {
                                        onReact(emojiData.emoji);
                                        setShowPicker(false);
                                    }}
                                    width={320}
                                    height={400}
                                    lazyLoadEmojis={true}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
