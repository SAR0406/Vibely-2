"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useThemeStore, AccentColor, Wallpaper } from "@/store/use-theme-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/design-system/button"
import { Moon, Sun, Monitor, Volume2, VolumeX, Image as ImageIcon, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const ACCENT_COLORS: { value: AccentColor, label: string, class: string }[] = [
    { value: 'violet', label: 'Violet', class: 'bg-violet-500' },
    { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
    { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
    { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
]

const WALLPAPERS: { value: Wallpaper, label: string, preview?: string }[] = [
    { value: 'default', label: 'Default (Deep Space)' },
    { value: 'grid', label: 'Cyber Grid' },
    { value: 'dots', label: 'Polka Dots' },
    { value: 'gradient', label: 'Aurora Gradient' },
]

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    const { theme, setTheme } = useTheme()
    const { accentColor, setAccentColor, wallpaper, setWallpaper, soundEnabled, toggleSound } = useThemeStore()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-[#121216] border-white/10 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-white/5 bg-white/5">
                    <DialogTitle className="text-xl font-bold tracking-tight text-white">Application Settings</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="appearance" className="w-full">
                    <div className="px-6 pt-4">
                        <TabsList className="w-full bg-white/5 border border-white/5">
                            <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
                            <TabsTrigger value="notifications" className="flex-1">Notifications & Sound</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
                        <TabsContent value="appearance" className="space-y-8 mt-0">
                            {/* Theme Mode */}
                            <div className="space-y-4">
                                <Label className="text-base text-zinc-400">Theme Mode</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['light', 'dark', 'system'] as const).map((mode) => (
                                        <Button
                                            key={mode}
                                            variant="outline"
                                            onClick={() => setTheme(mode)}
                                            className={cn(
                                                "h-20 flex flex-col gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white capitalize",
                                                theme === mode && "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                            )}
                                        >
                                            {mode === 'light' && <Sun className="w-6 h-6" />}
                                            {mode === 'dark' && <Moon className="w-6 h-6" />}
                                            {mode === 'system' && <Monitor className="w-6 h-6" />}
                                            <span className="text-xs font-medium">{mode}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Accent Color */}
                            <div className="space-y-4">
                                <Label className="text-base text-zinc-400">Accent Color</Label>
                                <div className="flex flex-wrap gap-3">
                                    {ACCENT_COLORS.map(({ value, class: bgClass }) => (
                                        <button
                                            key={value}
                                            onClick={() => setAccentColor(value)}
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ring-2 ring-offset-2 ring-offset-[#121216]",
                                                bgClass,
                                                accentColor === value ? "ring-white" : "ring-transparent opacity-80 hover:opacity-100"
                                            )}
                                        >
                                            {accentColor === value && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Wallpaper */}
                            <div className="space-y-4">
                                <Label className="text-base text-zinc-400">Chat Wallpaper</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {WALLPAPERS.map((wp) => (
                                        <div
                                            key={wp.value}
                                            onClick={() => setWallpaper(wp.value)}
                                            className={cn(
                                                "cursor-pointer group relative rounded-xl overflow-hidden aspect-video border-2 transition-all",
                                                wallpaper === wp.value ? "border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]" : "border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-50" />
                                            {/* Preview pattern logic simplified for MVP */}
                                            {wp.value === 'grid' && <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />}
                                            {wp.value === 'dots' && <div className="absolute inset-0 bg-[radial-gradient(circle_1px_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]" />}

                                            <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-between">
                                                <span className="text-xs font-medium text-zinc-200">{wp.label}</span>
                                                {wallpaper === wp.value && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="notifications" className="space-y-6 mt-0">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-zinc-500" />}
                                        <Label className="text-base font-medium text-zinc-100">Sound Effects</Label>
                                    </div>
                                    <p className="text-sm text-zinc-500">Play sounds for messages and interactions</p>
                                </div>
                                <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
                            </div>

                            {/* Placeholder for desktop notifications */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 opacity-50 cursor-not-allowed">
                                <div className="space-y-1">
                                    <Label className="text-base font-medium text-zinc-100">Desktop Notifications</Label>
                                    <p className="text-sm text-zinc-500">Show push notifications when backgrounded</p>
                                </div>
                                <Switch disabled checked={false} />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
