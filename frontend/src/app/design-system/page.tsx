"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { VibeButton } from "@/components/ui/vibe-button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { VibeShell } from "@/components/layout/vibe-shell"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Activity, Shield, Zap, Box } from "lucide-react"

export default function DesignSystemPage() {
    return (
        <VibeShell
            headerContent={
                <div className="flex items-center gap-2">
                    <Zap className="text-primary w-6 h-6" />
                    <span className="font-bold text-xl tracking-tight">Vibe<span className="text-primary">UI</span></span>
                </div>
            }
            sidebarContent={
                <div className="space-y-4">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">Components</div>
                    {["Overview", "Inputs", "Feedback", "Layouts"].map((item) => (
                        <div key={item} className="px-4 py-2 rounded-xl hover:bg-white/5 text-sm cursor-pointer transition-colors">
                            {item}
                        </div>
                    ))}
                </div>
            }
        >
            <div className="space-y-12 pb-24">

                {/* Section: Typography & Intro */}
                <section className="space-y-4">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
                        Design System 2026
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        A showcase of the Vibe UI Kit, featuring Glassmorphism, Neumorphism, and Skeuomorphic elements in a unified immersive environment.
                    </p>
                </section>

                {/* Section: Core Inputs */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold border-b border-white/5 pb-2">Future Controls</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <GlassCard className="p-8 space-y-6" variant="deep">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Neumorphic Inputs</h3>
                            <div className="space-y-4">
                                <Input placeholder="Standard Input..." />
                                <Input type="password" value="secretpassword" readOnly />
                                <div className="flex gap-4">
                                    <Input placeholder="First Name" />
                                    <Input placeholder="Last Name" />
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 space-y-6" variant="neon">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Skeuomorphic Toggles</h3>
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Airplane Mode</span>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">High Performance</span>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Neural Engine</span>
                                    <Switch disabled />
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </section>

                {/* Section: Feedback & Overlays */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold border-b border-white/5 pb-2">Glass Feedback</h2>
                    <div className="flex gap-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <VibeButton variant="default" glow>Open Glass Modal</VibeButton>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Futuristic Confirmation</DialogTitle>
                                    <DialogDescription>
                                        This modal uses a glassmorphic overlay with blur effects. It feels grounded yet floating.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <GlassCard variant="minimal" className="p-4 flex items-center gap-4">
                                        <Shield className="w-8 h-8 text-primary" />
                                        <div>
                                            <div className="font-bold">Secure Environment</div>
                                            <div className="text-xs text-muted-foreground">Encryption Active</div>
                                        </div>
                                    </GlassCard>
                                </div>
                                <DialogFooter>
                                    <VibeButton variant="ghost">Cancel</VibeButton>
                                    <VibeButton>Confirm Action</VibeButton>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <VibeButton variant="outline">Trigger Toast</VibeButton>
                    </div>
                </section>

                {/* Section: Bento Grid */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold border-b border-white/5 pb-2">Bento Layouts</h2>
                    <BentoGrid>
                        <BentoGridItem
                            title="Real-time Analytics"
                            description="Live streams of data from the neural network."
                            icon={<Activity className="w-6 h-6 text-primary" />}
                            i={0}
                            className="md:col-span-2 bg-gradient-to-br from-primary/10 to-transparent border-primary/20"
                        />
                        <BentoGridItem
                            title="Security Shield"
                            description="Active threat monitoring enabled."
                            icon={<Shield className="w-6 h-6 text-emerald-500" />}
                            i={1}
                        />
                        <BentoGridItem
                            title="System Health"
                            description="All nodes operational."
                            icon={<Box className="w-6 h-6 text-amber-500" />}
                            i={2}
                        />
                        <BentoGridItem
                            title="Power Consumption"
                            description="Optimized for efficiency."
                            icon={<Zap className="w-6 h-6 text-rose-500" />}
                            i={3}
                            className="md:col-span-2"
                        />
                    </BentoGrid>
                </section>

            </div>
        </VibeShell>
    )
}
