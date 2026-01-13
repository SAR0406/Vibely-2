"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, MapPin, Globe, User, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/design-system/button"
import { Input } from "@/components/design-system/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/design-system/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { useChatStore } from "@/store/use-chat-store"
import { usersApi, uploadApi } from "@/services/api"
import { cn } from "@/lib/utils"

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { currentUser, setCurrentUser } = useChatStore()
    const [loading, setLoading] = React.useState(false)
    const [uploading, setUploading] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: currentUser?.name || "",
        username: currentUser?.username || "",
        bio: currentUser?.bio || "",
        website: currentUser?.website || "",
        location: currentUser?.location || "",
        avatar: currentUser?.avatar || "",
    })

    React.useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name,
                username: currentUser.username || "",
                bio: currentUser.bio || "",
                website: currentUser.website || "",
                location: currentUser.location || "",
                avatar: currentUser.avatar,
            })
        }
    }, [currentUser])

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        try {
            const { data } = await uploadApi.uploadFile(uploadFormData)
            setFormData(prev => ({ ...prev, avatar: data.url }))
        } catch (error) {
            console.error("Avatar upload failed:", error)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data } = await usersApi.updateProfile(formData)
            setCurrentUser(data)
            onClose()
        } catch (error) {
            console.error("Failed to update profile:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#09090b] border-white/5 text-white p-0 gap-0 sm:rounded-[24px] overflow-hidden shadow-2xl max-w-lg">

                {/* Header / Banner */}
                <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile Content */}
                <div className="px-8 pb-8 -mt-12 max-h-[75vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <Avatar className="w-24 h-24 border-4 border-[#09090b] shadow-2xl">
                                    <AvatarImage src={formData.avatar} className="object-cover" />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-400 text-2xl">{formData.name[0]}</AvatarFallback>
                                </Avatar>
                                <label
                                    className={cn(
                                        "absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer text-white backdrop-blur-[2px]",
                                        uploading && "opacity-100"
                                    )}
                                >
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={uploading}
                                    />
                                    {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8 drop-shadow-md" />}
                                </label>
                            </div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white tracking-tight">{formData.name || "Your Name"}</h2>
                                <p className="text-indigo-400 font-medium text-sm">@{formData.username || "username"}</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Display Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="bg-zinc-900/50 border-white/5"
                                        placeholder="Enter name"
                                        icon={<User className="h-4 w-4" />}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Username</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium z-10 text-sm">@</span>
                                        <Input
                                            value={formData.username}
                                            onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                            className="bg-zinc-900/50 border-white/5 pl-7"
                                            placeholder="username"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Bio</Label>
                                <Textarea
                                    value={formData.bio}
                                    onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    className="bg-zinc-900/50 border-white/5 min-h-[100px] rounded-xl focus-visible:ring-indigo-500/50 text-white placeholder:text-zinc-600 resize-none"
                                    placeholder="Tell the world about your vibe..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Website</Label>
                                    <Input
                                        value={formData.website}
                                        onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                        className="bg-zinc-900/50 border-white/5"
                                        placeholder="https://..."
                                        icon={<Globe className="h-4 w-4" />}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Location</Label>
                                    <Input
                                        value={formData.location}
                                        onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        className="bg-zinc-900/50 border-white/5"
                                        placeholder="City, Country"
                                        icon={<MapPin className="h-4 w-4" />}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="flex-1 h-12 rounded-xl text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                isLoading={loading}
                                className="flex-1 h-12 rounded-xl text-base font-semibold shadow-xl shadow-indigo-600/20"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
