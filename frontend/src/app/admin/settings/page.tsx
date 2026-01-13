"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Settings,
    Shield,
    Activity,
    Lock,
    Unlock,
    RotateCcw,
    Save,
    History,
    Terminal,
    Info,
    AlertTriangle,
    CheckCircle2
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { adminApi } from "@/services/api"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface AuditLog {
    id: string
    adminId: string
    action: string
    targetId: string | null
    details: string | null
    createdAt: string
}

export default function SystemSettings() {
    const [configs, setConfigs] = React.useState<Record<string, string>>({})
    const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([])
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState<string | null>(null)

    const fetchData = React.useCallback(async () => {
        try {
            const [configRes, logRes] = await Promise.all([
                adminApi.getSystemConfig(),
                adminApi.getAuditLogs(1, 10)
            ])
            setConfigs(configRes.data)
            setAuditLogs(logRes.data.logs)
        } catch (error) {
            console.error("Failed to fetch settings", error)
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleToggleConfig = async (key: string, currentValue: string) => {
        const newValue = currentValue === 'true' ? 'false' : 'true'
        setSaving(key)
        try {
            await adminApi.updateSystemConfig(key, newValue)
            setConfigs(prev => ({ ...prev, [key]: newValue }))
            fetchData() // Refresh logs
        } catch (error) {
            alert("Failed to update setting")
        } finally {
            setSaving(null)
        }
    }

    const maintenanceMode = configs['MAINTENANCE_MODE'] === 'true'
    const registrationEnabled = configs['REGISTRATION_ENABLED'] !== 'false'

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Controls</h1>
                    <p className="text-zinc-500 mt-1">Configure global platform behavior and review administrative history.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Security & Global Toggles */}
                    <div className="space-y-6">
                        <Card className="bg-zinc-900/50 border-white/5 overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-purple-400" />
                                    Global Security
                                </CardTitle>
                                <CardDescription className="text-xs">Manage platform access and registration</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Maintenance Mode */}
                                <div className="flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-white">Maintenance Mode</p>
                                            {maintenanceMode && <Badge variant="warning" className="animate-pulse">Active</Badge>}
                                        </div>
                                        <p className="text-xs text-zinc-500 max-w-[200px]">Restrict all non-admin access while performing system updates.</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={maintenanceMode ? "destructive" : "outline"}
                                        className={cn(
                                            "rounded-xl gap-2 min-w-[120px]",
                                            !maintenanceMode && "border-white/10 hover:bg-white/5"
                                        )}
                                        onClick={() => handleToggleConfig('MAINTENANCE_MODE', configs['MAINTENANCE_MODE'] || 'false')}
                                        disabled={saving === 'MAINTENANCE_MODE'}
                                    >
                                        {saving === 'MAINTENANCE_MODE' ? "Working..." : (
                                            maintenanceMode ? <><Unlock className="w-4 h-4" /> Deactivate</> : <><Lock className="w-4 h-4" /> Activate</>
                                        )}
                                    </Button>
                                </div>

                                <div className="h-px bg-white/5" />

                                {/* Registration Toggle */}
                                <div className="flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-white">Public Registration</p>
                                        <p className="text-xs text-zinc-500 max-w-[200px]">Control whether new users can join the platform.</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={registrationEnabled ? "outline" : "warning"}
                                        className={cn(
                                            "rounded-xl gap-2 min-w-[120px]",
                                            registrationEnabled ? "border-white/10 hover:bg-white/5" : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-0"
                                        )}
                                        onClick={() => handleToggleConfig('REGISTRATION_ENABLED', configs['REGISTRATION_ENABLED'] || 'true')}
                                        disabled={saving === 'REGISTRATION_ENABLED'}
                                    >
                                        {saving === 'REGISTRATION_ENABLED' ? "Working..." : (
                                            registrationEnabled ? <><Activity className="w-4 h-4" /> Enabled</> : <><Shield className="w-4 h-4" /> Disabled</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-white/5">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                                    System Utilities
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <Button variant="outline" className="w-full justify-start gap-3 border-white/10 hover:bg-white/5 rounded-xl text-zinc-400">
                                    <Terminal className="w-4 h-4" /> Clear System Cache
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-3 border-white/10 hover:bg-white/5 rounded-xl text-zinc-400">
                                    <History className="w-4 h-4" /> Prune Expired Sessions
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Audit Logs */}
                    <Card className="bg-black/40 border-white/5 flex flex-col">
                        <CardHeader className="bg-white/[0.02] border-b border-white/5 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <History className="w-4 h-4 text-blue-400" />
                                    Nexus Audit Log
                                </CardTitle>
                                <CardDescription className="text-xs">Real-time trail of administrative activity</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={fetchData} className="hover:bg-white/5">
                                <RotateCcw className="w-4 h-4 text-zinc-500" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto max-h-[600px]">
                            {loading ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">Synchronizing logs...</div>
                            ) : auditLogs.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">No administrative actions recorded yet.</div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 border-white/10 bg-white/5">
                                                            {log.action}
                                                        </Badge>
                                                        <span className="text-[10px] text-zinc-600 font-mono">
                                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-300">
                                                        Admin <span className="text-indigo-400 font-mono">{log.adminId.split('-')[0]}...</span> performed action.
                                                    </p>
                                                    {log.details && (
                                                        <div className="mt-2 p-2 bg-black/40 rounded border border-white/5 overflow-hidden">
                                                            <p className="text-[10px] font-mono text-zinc-500 break-all leading-relaxed">
                                                                {log.details.length > 100 ? log.details.substring(0, 100) + '...' : log.details}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
