"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useThemeStore, AccentColor, Wallpaper } from "@/store/use-theme-store"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/design-system/button"
import {
    Moon,
    Sun,
    Monitor,
    Volume2,
    VolumeX,
    Image as ImageIcon,
    Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const ACCENT_COLORS: { value: AccentColor; label: string; class: string }[] = [
    { value: "violet", label: "Violet", class: "bg-violet-500" },
    { value: "emerald", label: "Emerald", class: "bg-emerald-500" },
    { value: "rose", label: "Rose", class: "bg-rose-500" },
    { value: "amber", label: "Amber", class: "bg-amber-500" },
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "cyan", label: "Cyan", class: "bg-cyan-500" },
]

const WALLPAPERS: { value: Wallpaper; label: string; preview?: string }[] = [
    { value: "default", label: "Deep Space" },
    { value: "grid", label: "Cyber Grid" },
    { value: "dots", label: "Polka Dots" },
    { value: "gradient", label: "Aurora Gradient" },
]

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    const { theme, setTheme } = useTheme()
    const {
        accentColor,
        setAccentColor,
        wallpaper,
        setWallpaper,
        soundEnabled,
        toggleSound,
    } = useThemeStore()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-[#121216] border border-white/10 p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-white/5 bg-white/5">
                    <DialogTitle className="text-xl font-bold text-white">
                        Application Settings
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="appearance">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 border-b border-white/5">
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                        <TabsTrigger value="notifications">
                            Notifications & Sound
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-6 space-y-6">
                        <TabsContent value="appearance">
                            {/** THEME MODE */}
                            <section className="space-y-3">
                                <Label className="text-base text-zinc-400">
                                    Theme Mode
                                </Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(["light", "dark", "system"] as const).map(
                                        (mode) => (
                                            <Button
                                                key={mode}
                                                variant="outline"
                                                onClick={() =>
                                                    setTheme(mode)
                                                }
                                                className={cn(
                                                    "flex flex-col items-center justify-center h-20 gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white capitalize transition",
                                                    theme === mode &&
                                                        "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                )}
                                            >
                                                {mode === "light" && (
                                                    <Sun className="w-6 h-6" />
                                                )}
                                                {mode === "dark" && (
                                                    <Moon className="w-6 h-6" />
                                                )}
                                                {mode === "system" && (
                                                    <Monitor className="w-6 h-6" />
                                                )}
                                                <span className="text-xs font-medium">
                                                    {mode}
                                                </span>
                                            </Button>
                                        )
                                    )}
                                </div>
                            </section>

                            {/** ACCENT COLOR */}
                            <section className="space-y-3">
                                <Label className="text-base text-zinc-400">
                                    Accent Color
                                </Label>
                                <div className="flex flex-wrap gap-3">
                                    {ACCENT_COLORS.map(
                                        ({ value, class: bgClass }) => (
                                            <button
                                                key={value}
                                                onClick={() =>
                                                    setAccentColor(value)
                                                }
                                                className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ring-2 ring-offset-2 ring-offset-[#121216]",
                                                    bgClass,
                                                    accentColor === value
                                                        ? "ring-white"
                                                        : "ring-transparent opacity-80"
                                                )}
                                            >
                                                {accentColor === value && (
                                                    <Check className="w-5 h-5 text-white" />
                                                )}
                                            </button>
                                        )
                                    )}
                                </div>
                            </section>

                            {/** WALLPAPER */}
                            <section className="space-y-3">
                                <Label className="text-base text-zinc-400">
                                    Chat Wallpaper
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {WALLPAPERS.map((wp) => (
                                        <WallpaperOption
                                            key={wp.value}
                                            wp={wp}
                                            selected={wallpaper === wp.value}
                                            onSelect={() =>
                                                setWallpaper(wp.value)
                                            }
                                        />
                                    ))}
                                </div>
                            </section>
                        </TabsContent>

                        <TabsContent value="notifications">
                            <NotificationSoundRow
                                soundEnabled={soundEnabled}
                                toggleSound={toggleSound}
                            />

                            <DesktopNotificationsPlaceholder />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

/** Wallpaper Tile */
function WallpaperOption({
    wp,
    selected,
    onSelect,
}: {
    wp: { value: Wallpaper; label: string }
    selected: boolean
    onSelect: () => void
}) {
    return (
        <div
            onClick={onSelect}
            className={cn(
                "relative cursor-pointer rounded-xl overflow-hidden aspect-video border-2 transition-all",
                selected
                    ? "border-indigo-500 shadow-lg"
                    : "border-white/10 hover:border-white/20"
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-40" />

            {wp.value === "grid" && (
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
            )}
            {wp.value === "dots" && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_1px_at_0_0,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]" />
            )}

            <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-black/60 text-xs text-zinc-200 flex items-center justify-between">
                <span>{wp.label}</span>
                {selected && (
                    <Check className="w-3 h-3 text-indigo-400" />
                )}
            </div>
        </div>
    )
}

/** Sound Row */
function NotificationSoundRow({
    soundEnabled,
    toggleSound,
}: {
    soundEnabled: boolean
    toggleSound: () => void
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
                {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-emerald-400" />
                ) : (
                    <VolumeX className="w-5 h-5 text-zinc-500" />
                )}
                <div className="space-y-1">
                    <Label className="text-base font-medium text-zinc-100">
                        Sound Effects
                    </Label>
                    <p className="text-sm text-zinc-500">
                        Sounds for messages and UI interactions
                    </p>
                </div>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
        </div>
    )
}

/** Disabled placeholder */
function DesktopNotificationsPlaceholder() {
    return (
        <div className="opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                    <Label className="text-base font-medium text-zinc-100">
                        Desktop Notifications
                    </Label>
                    <p className="text-sm text-zinc-500">
                        Unavailable on this platform
                    </p>
                </div>
                <Switch disabled checked={false} />
            </div>
        </div>
    )
}
