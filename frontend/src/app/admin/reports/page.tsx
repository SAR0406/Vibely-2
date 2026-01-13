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
    Shield
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { adminApi } from "@/services/api"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface Report {
    id: string
    reporterId: string
    targetId: string
    reason: string
    description: string | null
    status: string
    createdAt: string
    resolvedAt: string | null
    resolvedById: string | null
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
        const matchesSearch = r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.targetId.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const statusColors = {
        OPEN: "bg-red-500/10 text-red-500",
        RESOLVED: "bg-green-500/10 text-green-500",
        DISMISSED: "bg-zinc-500/10 text-zinc-500"
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports Inbox</h1>
                        <p className="text-zinc-500 mt-1">Review and resolve user-submitted reports and disputes.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                        {(["ALL", "OPEN", "RESOLVED"] as const).map((f) => (
                            <Button
                                key={f}
                                size="sm"
                                variant={filter === f ? "default" : "ghost"}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "rounded-xl px-4",
                                    filter === f ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {f}
                            </Button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Search reports..."
                            className="pl-10 bg-black/20 border-white/5 text-white rounded-xl h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : filteredReports.length === 0 ? (
                        <div className="py-20 text-center text-zinc-500 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                            <Flag className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                            No reports matching your current filter.
                        </div>
                    ) : filteredReports.map((report) => (
                        <Card key={report.id} className="bg-zinc-900/50 border-white/5 overflow-hidden hover:border-white/10 transition-colors">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
                                    <div className="p-6 md:w-1/4 space-y-2">
                                        <Badge className={cn("rounded-full px-2.5 py-0.5 border-0 font-bold tracking-widest text-[10px]", (statusColors as any)[report.status] || "bg-zinc-500/10")}>
                                            {report.status}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-zinc-500">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-mono">
                                                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 space-y-2">
                                        <h3 className="text-white font-bold flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-amber-500" />
                                            {report.reason}
                                        </h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed italic">
                                            "{report.description || "No additional details provided."}"
                                        </p>
                                        <div className="flex flex-wrap gap-4 pt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Reporter</span>
                                                <span className="text-xs text-indigo-400 font-mono underline decoration-indigo-500/30">{report.reporterId.split('-')[0]}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Target</span>
                                                <Badge variant="outline" className="text-[10px] font-mono border-white/10 bg-white/5">{report.targetId}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 md:w-1/5 flex flex-col justify-center gap-2">
                                        {report.status === "OPEN" ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-bold text-xs"
                                                    onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                                                >
                                                    <CheckCircle2 className="w-3 h-3" /> Resolve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="w-full rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 text-xs"
                                                    onClick={() => handleUpdateStatus(report.id, "DISMISSED")}
                                                >
                                                    <XCircle className="w-3 h-3" /> Dismiss
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="text-center space-y-1">
                                                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Resolved By</span>
                                                <p className="text-xs text-white font-mono">{report.resolvedById?.split('-')[0] || "System"}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    )
}
