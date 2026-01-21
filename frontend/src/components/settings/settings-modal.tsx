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
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/design-system/avatar"
import {
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Check,
  Zap,
  Image as ImageIcon,
  Activity,
  Server,
  Database,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

// If you have a stronger "User" type in your app, replace this with it.
// This minimal shape avoids importing next-auth/other libs here.
type MinimalUser = { name?: string | null; email?: string | null; image?: string | null; avatar?: string | null }

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
  { value: "gold", label: "Gold", class: "bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600" },
]

const WALLPAPERS: { value: Wallpaper; label: string; preview?: string; isPro?: boolean }[] = [
  { value: "default", label: "Deep Space" },
  { value: "grid", label: "Cyber Grid" },
  { value: "dots", label: "Polka Dots" },
  { value: "gradient", label: "Aurora Gradient" },
  { value: "cyberpunk", label: "Neo Tokyo", isPro: true },
  { value: "glass", label: "Frosted Glass", isPro: true },
  { value: "nebula", label: "Interstellar", isPro: true },
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
    userTier,
  } = useThemeStore()

  const handleOpenChange = React.useCallback(
    (val: boolean) => {
      onOpenChange?.(val)
      if (!val) onClose?.()
    },
    [onOpenChange, onClose]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-[#050505]/95 backdrop-blur-3xl border border-white/5 p-0 overflow-hidden shadow-2xl shadow-indigo-500/10">
        <div className="absolute inset-0 noise-texture opacity-40 pointer-events-none" />

        <DialogHeader className="p-10 border-b border-white/5 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_var(--color-indigo-500)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Node Configuration</span>
              </div>
              <DialogTitle className="text-4xl font-black text-white uppercase tracking-tighter italic">
                Interface <span className="text-indigo-500">Elite</span>
              </DialogTitle>
            </div>

            {currentUser && (
              <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                <Avatar size="md">
                  <AvatarImage src={currentUser.avatar || currentUser.image || undefined} />
                  <AvatarFallback className="bg-zinc-900">{currentUser.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-black text-white italic">
                    {currentUser.name || "UNIDENTIFIED"}
                  </div>
                  <p className="blockchain-hash">SIG: 0406_AX</p>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="relative z-10">
          <TabsList className="flex w-full bg-[#050505] border-b border-white/5 rounded-none h-16 px-6 gap-8">
            <TabsTrigger value="appearance" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 text-zinc-600 font-black uppercase tracking-widest text-[10px] h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 transition-all">Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 text-zinc-600 font-black uppercase tracking-widest text-[10px] h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 transition-all">Telemetry</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 text-zinc-600 font-black uppercase tracking-widest text-[10px] h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 transition-all">Core Engine</TabsTrigger>
          </TabsList>

          <div className="p-10 space-y-12">
            <TabsContent value="appearance" className="space-y-10 mt-0">
              {/* Theme mode */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Environment Mode</Label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {(["light", "dark", "system"] as const).map((mode) => {
                    const active = isMounted && theme === mode
                    return (
                      <button
                        key={mode}
                        onClick={() => setTheme(mode)}
                        className={cn(
                          "relative group flex flex-col items-center justify-center h-28 gap-3 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden",
                          active && "border-indigo-500/50 bg-indigo-500/10"
                        )}
                        aria-pressed={active}
                      >
                        {active && <div className="absolute inset-0 bg-indigo-500/5 blur-xl" />}
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10",
                          active ? "bg-indigo-500 text-black" : "bg-white/5 text-zinc-600 group-hover:text-white"
                        )}>
                          {mode === "light" && <Sun className="w-6 h-6" />}
                          {mode === "dark" && <Moon className="w-6 h-6" />}
                          {mode === "system" && <Monitor className="w-6 h-6" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10 transition-colors group-hover:text-white">{mode}</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Accent colors */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Accent Telemetry</Label>
                </div>
                <div className="flex flex-wrap gap-4">
                  {ACCENT_COLORS.map(({ value, class: bgClass }) => (
                    <button
                      key={value}
                      onClick={() => setAccentColor(value)}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 relative group",
                        bgClass,
                        accentColor === value
                          ? "ring-4 ring-white shadow-2xl"
                          : "ring-0 opacity-60 hover:opacity-100"
                      )}
                    >
                      {accentColor === value && (
                        <div className="absolute inset-x-0 -bottom-8 flex justify-center">
                          <div className="w-1 h-1 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Wallpapers */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Nexus Atmosphere</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {WALLPAPERS.map((wp) => (
                    <WallpaperOption
                      key={wp.value}
                      wp={wp}
                      userTier={userTier}
                      selected={wallpaper === wp.value}
                      onSelect={() => {
                        if ((wp as any).isPro && userTier === 'FREE') {
                          alert('Ascend to ELITE to unlock this node vibe.');
                          return
                        }
                        setWallpaper(wp.value)
                      }}
                    />
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-0">
              <NotificationSoundRow
                soundEnabled={soundEnabled}
                toggleSound={toggleSound}
              />
              <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                  <Zap className="w-32 h-32" />
                </div>
                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest">Premium Alerts</h4>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-[80%]">
                  Unlocked elite notification patterns. Every sound is synthesized for the highest neural resonance.
                </p>
                <Button variant="outline" size="sm" className="border-indigo-500/20 text-indigo-400">
                  Sync Devices
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-8 mt-0">
              <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-emerald-400 uppercase tracking-tighter italic">Engine Operational</h3>
                  <div className="flex gap-4">
                    <p className="blockchain-hash">UP: 99.9%</p>
                    <p className="blockchain-hash">LAT: 0.002ms</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SystemCard icon={Server} label="Matrix Core" status="v4.2-Alpha" color="text-indigo-400" />
                <SystemCard icon={Database} label="Distributed Ledger" status="Synced" color="text-cyan-400" />
                <SystemCard icon={ShieldCheck} label="Quantum Lock" status="RSA-8192" color="text-rose-400" />
                <SystemCard icon={Activity} label="Neural Cache" status="Heat: 24°C" color="text-amber-400" />
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Node Identity</span>
                  <span className="text-indigo-400">Verified Signature</span>
                </div>
                <div className="blockchain-hash break-all bg-black/40 p-4 rounded-xl border border-white/5 opacity-60">
                  NEXUS-0x89274-VIBELY-CORE-ALPHA-9-SIG-ENABLED
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function WallpaperOption({
  wp,
  selected,
  onSelect,
  userTier,
}: {
  wp: { value: Wallpaper; label: string; isPro?: boolean }
  selected: boolean
  onSelect: () => void
  userTier: string
}) {
  const isLocked = wp.isPro && userTier === 'FREE'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-3xl overflow-hidden aspect-video border-2 transition-all duration-700 group",
        selected ? "border-indigo-500 scale-[1.02] shadow-[0_0_30px_rgba(99,102,241,0.2)]" : "border-white/5 hover:border-white/10 opacity-70 hover:opacity-100",
        isLocked && "opacity-60 grayscale-[0.5]"
      )}
    >
      {isLocked && (
        <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center group-hover:bg-black/40 transition-colors">
          <Zap className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity" />

      {wp.value === "grid" && (
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 scale-150 group-hover:scale-100 transition-transform duration-1000" />
      )}
      {wp.value === "dots" && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_1px_at_0_0,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:15px_15px]" />
      )}

      <div className="absolute bottom-3 left-3 right-3 px-4 py-3 rounded-2xl bg-[#050505]/80 backdrop-blur-md border border-white/5 flex items-center justify-between z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-100">{wp.label}</span>
        {selected && (
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_var(--color-indigo-500)]" />
        )}
      </div>
    </button>
  )
}

function NotificationSoundRow({
  soundEnabled,
  toggleSound,
}: {
  soundEnabled: boolean
  toggleSound: () => void
}) {
  return (
    <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
      <div className="flex items-center gap-6">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
          soundEnabled ? "bg-indigo-500 text-black shadow-2xl" : "bg-white/5 text-zinc-600"
        )}>
          {soundEnabled ? (
            <Volume2 className="w-6 h-6" />
          ) : (
            <VolumeX className="w-6 h-6" />
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-lg font-black uppercase tracking-tighter text-white italic">Neural Audio</Label>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Interface Frequency Modulation</p>
        </div>
      </div>

      <Switch checked={soundEnabled} onCheckedChange={toggleSound} className="data-[state=checked]:bg-indigo-500" />
    </div>
  )
}

function SystemCard({ icon: Icon, label, status, color }: any) {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 group hover:bg-white/[0.04] hover:border-white/10 transition-all">
      <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em] mb-1">{label}</p>
        <p className="text-sm font-black text-white italic tracking-tight">{status}</p>
      </div>
    </div>
  )
}
