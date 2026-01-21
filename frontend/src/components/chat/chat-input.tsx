"use client"

import * as React from "react"
import { Send, Paperclip, Smile, Mic, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/design-system/button"
import { cn } from "@/lib/utils"
import EmojiPicker, { Theme, EmojiClickData, EmojiStyle } from 'emoji-picker-react'

interface ChatInputProps {
    value: string
    onChange: (value: string) => void
    onSend: () => void
    onTyping: () => void
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
    fileInputRef: React.RefObject<HTMLInputElement>
    isRecording?: boolean // Placeholder for future audio hook
}

export function ChatInput({
    value,
    onChange,
    onSend,
    onTyping,
    onFileSelect,
    fileInputRef,
}: ChatInputProps) {
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
        }
    }

    return (
        <div className="flex items-end gap-2 bg-[#121212] border border-white/10 rounded-[2rem] p-2 pl-4 pr-2 shadow-2xl transition-all duration-300 focus-within:border-indigo-500/30 focus-within:bg-[#161616] backdrop-blur-xl relative">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 text-zinc-500 hover:text-white rounded-full shrink-0 mb-0.5"
            >
                <Paperclip className="h-5 w-5" />
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                className="hidden"
            />

            <textarea
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    onTyping()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none min-h-[44px] max-h-[160px] py-3 text-[15px] font-medium text-white placeholder:text-zinc-600 scrollbar-hide"
                rows={1}
            />

            <div className="flex items-center gap-1.5 mb-0.5">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={cn(
                        "h-10 w-10 rounded-full transition-all",
                        showEmojiPicker ? "text-cyan-400 bg-cyan-500/10" : "text-zinc-500 hover:text-white"
                    )}
                >
                    <Smile className="h-5.5 w-5.5" />
                </Button>

                {value.trim() ? (
                    <Button
                        onClick={onSend}
                        size="icon"
                        className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all active:scale-95 ease-out-expo"
                    >
                        <Send className="h-4.5 w-4.5 ml-0.5" />
                    </Button>
                ) : (
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-full text-zinc-500 hover:text-white transition-all"
                        >
                            <Mic className="h-5.5 w-5.5" />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-full text-zinc-500 hover:text-white transition-all"
                        >
                            <ImageIcon className="h-5.5 w-5.5" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Emoji Popover */}
            {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-4 z-50">
                    <div className="shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#1a1a1a] backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-2 origin-bottom-right">
                        <EmojiPicker
                            theme={Theme.DARK}
                            emojiStyle={EmojiStyle.APPLE}
                            onEmojiClick={(data) => {
                                onChange(value + data.emoji)
                                setShowEmojiPicker(false)
                            }}
                            searchDisabled
                            skinTonesDisabled
                            width={320}
                            height={400}
                        />
                    </div>
                    <div className="fixed inset-0 -z-10" onClick={() => setShowEmojiPicker(false)} />
                </div>
            )}
        </div>
    )
}
