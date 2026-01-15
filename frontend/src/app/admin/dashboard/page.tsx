"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users,
    MessageSquare,
    Activity,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    ShieldCheck,
    Cpu,
    Globe,
    Send,
    CheckCircle2,
    ActivitySquare
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminApi } from "@/services/api"
import { Button } from "@/components/design-system/button"
import { cn } from "@/lib/utils"


export interface Stats {
    totalUsers: number
    totalConversations: number
    totalMessages: number
    totalReactions: number
    activeToday: number
    newUsersThisWeek: number
    uptime: number
    systemHealth: string
    memory?: { rss: number; heapTotal: number; heapUsed: number }
    charts?: {
        userGrowth: { date: string; users: number }[]
        activity: { date: string; messages: number; active: number }[]
    }
}

export default function AdminDashboard() {
    const [stats, setStats] = React.useState<Stats | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [broadcastContent, setBroadcastContent] = React.useState("")
    const [isBroadcasting, setIsBroadcasting] = React.useState(false)
    const [broadcastStatus, setBroadcastStatus] = React.useState<"idle" | "success" | "error">("idle")

    React.useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const fetchStats = async () => {
        try {
            const { data } = await adminApi.getStats()
            setStats(data)
        } catch (error) {
            console.error("Failed to fetch stats", error)
        } finally {
            setLoading(false)
        }
    }

    const handleBroadcast = async () => {
        if (!broadcastContent.trim()) return
        setIsBroadcasting(true)
        setBroadcastStatus("idle")
        try {
            await adminApi.broadcastMessage(broadcastContent)
            setBroadcastStatus("success")
            setBroadcastContent("")
            setTimeout(() => setBroadcastStatus("idle"), 3000)
        } catch (error) {
            setBroadcastStatus("error")
        } finally {
            setIsBroadcasting(false)
        }
    }

    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24))
        const h = Math.floor((seconds % (3600 * 24)) / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        return `${d}d ${h}h ${m}m`
    }

    const topStats = [
        { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-400", sub: `${stats?.newUsersThisWeek || 0} this week` },
        { label: "Active Today", value: stats?.activeToday || 0, icon: Activity, color: "text-green-400", sub: "Live presence" },
        { label: "Messages", value: stats?.totalMessages || 0, icon: MessageSquare, color: "text-purple-400", sub: `${stats?.totalReactions || 0} reactions` },
        { label: "Vibe Score", value: "98%", icon: ShieldCheck, color: "text-amber-400", sub: "Community health" },
    ]

    return (
        <AdminLayout>
            <div className="space-y-8 pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="text-sm font-bold tracking-widest uppercase">Nexus Command</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white">System Intelligence</h1>
                        <p className="text-zinc-500 mt-2 max-w-xl">Deep monitoring and global control for the Vibely social mesh.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">System Pulse</span>
                            <span className="text-sm font-mono text-emerald-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {stats?.systemHealth || "Initializing"}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Uptime</span>
                            <span className="text-sm font-mono text-white">{stats ? formatUptime(stats.uptime) : "0d 0h 0m"}</span>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {topStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-zinc-900/50 border-white/5 hover:border-indigo-500/30 transition-all duration-300 group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <stat.icon className="w-20 h-20 -mr-4 -mt-4 text-white" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                                        {stat.label}
                                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-white">{loading ? "..." : stat.value.toLocaleString()}</div>
                                    <p className="text-[10px] text-zinc-500 mt-1 font-medium">{stat.sub}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Analytical Charts */}
                {stats?.charts && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-zinc-900/50 border-white/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    Growth Trajectory
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.charts.userGrowth}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorUsers)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-white/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <ActivitySquare className="w-4 h-4 text-blue-400" />
                                    Network Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.charts.activity}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="messages" fill="#3b82f6" name="Messages" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="active" fill="#10b981" name="Active Users" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}


                <div className="grid gap-6 md:grid-cols-3">
                    {/* Broadcast Tool */}
                    <Card className="md:col-span-2 bg-zinc-900/50 border-white/5 overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Globe className="w-4 h-4 text-indigo-400" />
                                Global Broadcast
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-xs text-zinc-500 mb-4">Send a system-wide announcement to all registered users. Use this wisely, Commander.</p>
                            <div className="space-y-4">
                                <textarea
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50 transition-all min-h-[120px] resize-none"
                                    placeholder="Type your global announcement here..."
                                    value={broadcastContent}
                                    onChange={(e) => setBroadcastContent(e.target.value)}
                                />
                                <div className="flex items-center justify-between">
                                    <AnimatePresence mode="wait">
                                        {broadcastStatus === "success" ? (
                                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                                <CheckCircle2 className="w-4 h-4" /> Message Transmitted
                                            </motion.div>
                                        ) : broadcastStatus === "error" ? (
                                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-red-400 text-xs font-bold">
                                                <AlertCircle className="w-4 h-4" /> Transmission Failed
                                            </motion.div>
                                        ) : (
                                            <div />
                                        )}
                                    </AnimatePresence>
                                    <Button
                                        onClick={handleBroadcast}
                                        disabled={isBroadcasting || !broadcastContent.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl gap-2 px-6"
                                    >
                                        {isBroadcasting ? "Broadcasting..." : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Transmit Global Message
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SysHealth Card */}
                    <Card className="bg-zinc-900/50 border-white/5">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-emerald-400" />
                                Core Vitals
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                                    <span>Database Throughput</span>
                                    <span className="text-zinc-300">Fast</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                                    <span className="text-zinc-300">Optimal (CDN)</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "95%" }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                </div>
                            </div>

                            {stats?.memory && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                                        <span>Memory Load</span>
                                        <span className={stats.memory.heapUsed > 200 ? "text-amber-400" : "text-emerald-400"}>
                                            {stats.memory.heapUsed}MB / {stats.memory.heapTotal}MB
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((stats.memory.heapUsed / stats.memory.heapTotal) * 100, 100)}%` }}
                                            className={cn("h-full shadow-lg transition-all duration-1000", stats.memory.heapUsed > 200 ? "bg-amber-500" : "bg-blue-500")}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500">Node Environment</span>
                                    <span className="text-white font-mono">Production</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500">Real-time Layer</span>
                                    <span className="text-emerald-400 font-mono">Socket.IO v4.x</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
