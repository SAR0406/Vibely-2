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
  Check,
  Image as ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// If you have a stronger "User" type in your app, replace this with it.
// This minimal shape avoids importing next-auth/other libs here.
type MinimalUser = { name?: string | null; email?: string | null; image?: string | null }

interface SettingsModalProps {
  open: boolean
  /**
   * Preferred prop for shadcn Dialog. Called with boolean.
   */
  onOpenChange?: (open: boolean) => void
  /**
   * Convenience alias: called (no args) when modal closes.
   * Keeps older call sites working (onClose={() => setOpen(false)})
   */
  onClose?: () => void
  /**
   * Optional minimal current user - safe to pass `currentUser` from callers.
   */
  currentUser?: MinimalUser | null
}

/** Hook: guard rendering until client mount (prevents next-themes hydration mismatch) */
function useIsMounted() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return mounted
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

export function SettingsModal({
  open,
  onOpenChange,
  onClose,
  currentUser,
}: SettingsModalProps) {
  const isMounted = useIsMounted()
  const { theme, setTheme } = useTheme()
  const {
    accentColor,
    setAccentColor,
    wallpaper,
    setWallpaper,
    soundEnabled,
    toggleSound,
  } = useThemeStore()

  // Map dialog's `onOpenChange` into both callbacks: call onOpenChange if present,
  // and call onClose() as a convenience when modal closes (val === false).
  const handleOpenChange = React.useCallback(
    (val: boolean) => {
      onOpenChange?.(val)
      if (!val) onClose?.()
    },
    [onOpenChange, onClose]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#121216] border border-white/10 p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-xl font-bold text-white">
              Application Settings
            </DialogTitle>

            {/* Optional current user preview (small, non-critical UI) */}
            {currentUser && (
              <div className="flex items-center gap-3">
                {currentUser.image ? (
                  // small avatar
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.image}
                    alt={currentUser.name ?? "User avatar"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-zinc-300">
                    {currentUser.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                )}
                <div className="text-right">
                  <div className="text-xs text-zinc-300 leading-4">
                    {currentUser.name ?? currentUser.email ?? "User"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="appearance">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border-b border-white/5">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications & Sound</TabsTrigger>
          </TabsList>

          <div className="p-6 space-y-6">
            <TabsContent value="appearance">
              {/* Theme mode */}
              <section className="space-y-3">
                <Label className="text-base text-zinc-400">Theme Mode</Label>

                {/* Only render theme-sensitive UI after mount to avoid mismatch */}
                <div className="grid grid-cols-3 gap-3">
                  {(["light", "dark", "system"] as const).map((mode) => {
                    const active = isMounted && theme === mode
                    return (
                      <Button
                        key={mode}
                        variant="outline"
                        onClick={() => setTheme(mode)}
                        className={cn(
                          "flex flex-col items-center justify-center h-20 gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white capitalize transition",
                          active &&
                            "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                        )}
                        aria-pressed={active}
                        aria-label={`Set theme to ${mode}`}
                      >
                        {mode === "light" && <Sun className="w-6 h-6" />}
                        {mode === "dark" && <Moon className="w-6 h-6" />}
                        {mode === "system" && <Monitor className="w-6 h-6" />}
                        <span className="text-xs font-medium">{mode}</span>
                      </Button>
                    )
                  })}
                </div>
              </section>

              {/* Accent colors */}
              <section className="space-y-3">
                <Label className="text-base text-zinc-400">Accent Color</Label>
                <div className="flex flex-wrap gap-3">
                  {ACCENT_COLORS.map(({ value, class: bgClass }) => (
                    <button
                      key={value}
                      onClick={() => setAccentColor(value)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ring-2 ring-offset-2 ring-offset-[#121216]",
                        bgClass,
                        accentColor === value
                          ? "ring-white"
                          : "ring-transparent opacity-80"
                      )}
                      aria-label={`Set accent color to ${value}`}
                    >
                      {accentColor === value && (
                        <Check className="w-5 h-5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Wallpapers */}
              <section className="space-y-3">
                <Label className="text-base text-zinc-400">Chat Wallpaper</Label>
                <div className="grid grid-cols-2 gap-3">
                  {WALLPAPERS.map((wp) => (
                    <WallpaperOption
                      key={wp.value}
                      wp={wp}
                      selected={wallpaper === wp.value}
                      onSelect={() => setWallpaper(wp.value)}
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

/** Wallpaper tile component */
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
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-xl overflow-hidden aspect-video border-2 transition-all text-left",
        selected ? "border-indigo-500 shadow-lg" : "border-white/10 hover:border-white/20"
      )}
      aria-pressed={selected}
      aria-label={`Select wallpaper ${wp.label}`}
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
        {selected && <Check className="w-3 h-3 text-indigo-400" />}
      </div>
    </button>
  )
}

/** Sound row */
function NotificationSoundRow({
  soundEnabled,
  toggleSound,
}: {
  soundEnabled: boolean
  toggleSound: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-3">
        {soundEnabled ? (
          <Volume2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <VolumeX className="w-5 h-5 text-zinc-500" />
        )}
        <div>
          <Label className="text-base font-medium text-zinc-100">Sound Effects</Label>
          <p className="text-sm text-zinc-500">Sounds for messages and UI interactions</p>
        </div>
      </div>

      <Switch checked={soundEnabled} onCheckedChange={toggleSound} aria-label="Toggle sound effects" />
    </div>
  )
}

/** Disabled placeholder */
function DesktopNotificationsPlaceholder() {
  return (
    <div className="opacity-50 cursor-not-allowed">
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
        <div>
          <Label className="text-base font-medium text-zinc-100">Desktop Notifications</Label>
          <p className="text-sm text-zinc-500">Unavailable on this platform</p>
        </div>
        <Switch disabled checked={false} />
      </div>
    </div>
  )
}
