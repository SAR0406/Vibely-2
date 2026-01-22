"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Flag,
    AlertCircle,
    CheckCircle2,
    XCircle,
    User,
    MessageSquare,
    MoreHorizontal,
    Search,
    Filter,
    Clock,
    Shield,
    Sparkles,
    Bug,
    AlertTriangle
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { adminApi } from "@/services/api"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface UserInfo {
    id: string
    name: string
    email: string
    avatar: string | null
}

interface Report {
    id: string
    type: string
    reporterId: string
    targetId: string | null
    reason: string
    description: string | null
    status: string
    createdAt: string
    resolvedAt: string | null
    resolvedById: string | null
    reporter?: UserInfo
    target?: UserInfo
}

export default function ReportsManagement() {
    const [reports, setReports] = React.useState<Report[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filter, setFilter] = React.useState<"ALL" | "OPEN" | "RESOLVED">("ALL")

    const fetchReports = React.useCallback(async () => {
        try {
            const { data } = await adminApi.getReports()
            setReports(data.reports)
        } catch (error) {
            console.error("Failed to fetch reports", error)
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchReports()
    }, [fetchReports])

    const handleUpdateStatus = async (reportId: string, status: string) => {
        try {
            await adminApi.updateReportStatus(reportId, status)
            fetchReports()
        } catch (error) {
            alert("Failed to update report status")
        }
    }

    const filteredReports = reports.filter(r => {
        const matchesFilter = filter === "ALL" || r.status === filter
        const matchesSearch =
            r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.targetId && r.targetId.toLowerCase().includes(searchQuery.toLowerCase())) ||
            r.reporterId.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const statusColors = {
        OPEN: "bg-red-500/10 text-red-500",
        RESOLVED: "bg-green-500/10 text-green-500",
        DISMISSED: "bg-zinc-500/10 text-zinc-500"
    }

    const typeIcons: Record<string, any> = {
        user: User,
        message: MessageSquare,
        app: Sparkles
    }

    const typeColors: Record<string, string> = {
        user: "text-indigo-400 bg-indigo-500/10",
        message: "text-amber-400 bg-amber-500/10",
        app: "text-purple-400 bg-purple-500/10"
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase italic">Reports Inbox</h1>
                        <p className="text-zinc-500 mt-1 font-medium tracking-tight">Review and resolve user-submitted reports and disputes.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        {(["ALL", "OPEN", "RESOLVED"] as const).map((f) => (
                            <Button
                                key={f}
                                size="sm"
                                variant={filter === f ? "default" : "ghost"}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "rounded-xl px-6 uppercase text-[10px] font-black tracking-widest transition-all",
                                    filter === f ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-zinc-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {f}
                            </Button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <Input
                            placeholder="Search reports..."
                            className="pl-10 bg-black/40 border-white/5 text-white rounded-xl h-10 placeholder:text-zinc-700 transition-all focus:border-indigo-500/30 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse" />
                        ))
                    ) : filteredReports.length === 0 ? (
                        <div className="py-24 text-center text-zinc-500 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                            <Flag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-600">All Clear</h3>
                            <p className="text-sm mt-1 text-zinc-500">No reports found.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredReports.map((report) => {
                                const TypeIcon = typeIcons[report.type] || Flag
                                return (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        layout
                                    >
                                        <Card className="bg-zinc-950/40 border-white/5 overflow-hidden hover:border-white/10 transition-all duration-500 group rounded-3xl">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
                                                    <div className="p-6 md:w-1/4 space-y-4">
                                                        <div className="flex flex-col gap-2">
                                                            <Badge className={cn("inline-flex w-fit rounded-full px-3 py-1 border-0 font-black tracking-widest text-[9px] uppercase", (statusColors as any)[report.status] || "bg-zinc-500/10")}>
                                                                {report.status}
                                                            </Badge>
                                                            <Badge variant="outline" className={cn("inline-flex w-fit rounded-full px-3 py-1 border-white/5 font-black tracking-widest text-[9px] uppercase gap-1.5", typeColors[report.type])}>
                                                                <TypeIcon className="w-3 h-3" />
                                                                {report.type}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-zinc-600">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] uppercase font-black tracking-widest">
                                                                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 flex-1 space-y-3">
                                                        <div className="space-y-1">
                                                            <h3 className="text-white font-black uppercase italic text-lg tracking-tight flex items-center gap-2">
                                                                {report.reason}
                                                            </h3>
                                                            <p className="text-sm text-zinc-500 font-medium leading-relaxed italic">
                                                                "{report.description || "No additional detail provided."}"
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-wrap gap-6 pt-4 border-t border-white/[0.02]">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Reporter</span>
                                                                <span className="text-sm text-indigo-500 font-medium">
                                                                    {report.reporter?.name || `ID: ${report.reporterId.substring(0, 8)}...`}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Target</span>
                                                                {report.targetId ? (
                                                                    <span className="text-sm text-rose-500 font-medium">
                                                                        {report.target?.name || `ID: ${report.targetId.substring(0, 8)}...`}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-zinc-500 font-medium italic">General Feedback</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 md:w-1/5 flex flex-col justify-center gap-3 bg-white/[0.01]">
                                                        {report.status === "OPEN" ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-black uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
                                                                    onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="w-full rounded-2xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-widest h-10 active:scale-95 transition-all"
                                                                    onClick={() => handleUpdateStatus(report.id, "DISMISSED")}
                                                                >
                                                                    <XCircle className="w-3.5 h-3.5" /> Dismiss
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <div className="text-center space-y-2 py-2">
                                                                <div className="p-2 bg-white/5 rounded-2xl inline-block">
                                                                    <Shield className="w-5 h-5 text-indigo-400 opacity-50" />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Resolved By</span>
                                                                    <p className="text-xs text-white font-medium">{report.resolvedById?.substring(0, 8) || "System"}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
