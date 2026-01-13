"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usersApi } from "@/services/api"

export default function SettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState(false)
    const [profile, setProfile] = React.useState({
        name: "",
        username: "",
        bio: "",
        statusMessage: "",
        avatar: "",
    })

    React.useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const { data } = await usersApi.getMe()
            setProfile({
                name: data.name || "",
                username: data.username || "",
                bio: data.bio || "",
                statusMessage: data.statusMessage || "",
                avatar: data.avatar || "",
            })
        } catch (error) {
            console.error("Failed to load profile:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await usersApi.updateProfile(profile)
            alert("Profile updated successfully!")
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-zinc-400">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    ← Back
                </Button>

                <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                <p className="text-zinc-400 mb-8">Customize your profile information</p>

                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profile.avatar} />
                            <AvatarFallback className="text-2xl">
                                {profile.name[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-white font-semibold">{profile.name}</div>
                            {profile.username && (
                                <div className="text-zinc-400">@{profile.username}</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-zinc-300">Display Name</Label>
                            <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="bg-white/5 border-white/10 text-white mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="username" className="text-zinc-300">Username</Label>
                            <Input
                                id="username"
                                value={profile.username}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                className="bg-white/5 border-white/10 text-white mt-2"
                                placeholder="username"
                            />
                        </div>

                        <div>
                            <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
                            <Input
                                id="bio"
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                className="bg-white/5 border-white/10 text-white mt-2"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="status" className="text-zinc-300">Status Message</Label>
                            <Input
                                id="status"
                                value={profile.statusMessage}
                                onChange={(e) => setProfile({ ...profile, statusMessage: e.target.value })}
                                className="bg-white/5 border-white/10 text-white mt-2"
                                placeholder="What's on your mind?"
                            />
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        variant="premium"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
