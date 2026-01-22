"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, ShieldCheck, Flag, MessageSquare, Info, ShieldAlert, Sparkles } from "lucide-react"
import { Button } from "@/components/design-system/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { reportsApi } from "@/services/api"

export type ReportType = "user" | "app" | "message"

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    type: ReportType
    targetId?: string
    targetName?: string
}

const CATEGORIES = {
    user: [
        { id: "harassment", label: "Harassment", icon: ShieldAlert },
        { id: "spam", label: "Spam", icon: MessageSquare },
        { id: "inappropriate", label: "Inappropriate Content", icon: Flag },
        { id: "other", label: "Other", icon: Info },
    ],
    app: [
        { id: "bug", label: "Technical Bug", icon: AlertTriangle },
        { id: "performance", label: "Performance Issue", icon: ShieldCheck },
        { id: "suggestion", label: "Feature Suggestion", icon: Sparkles },
        { id: "other", label: "Other", icon: Info },
    ],
    message: [
        { id: "hate_speech", label: "Hate Speech", icon: ShieldAlert },
        { id: "spam", label: "Spam", icon: MessageSquare },
        { id: "violence", label: "Violence", icon: Flag },
        { id: "other", label: "Other", icon: Info },
    ]
}

export function ReportModal({ isOpen, onClose, type, targetId, targetName }: ReportModalProps) {
    const [selectedCategory, setSelectedCategory] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)

    const categories = CATEGORIES[type] || []

    const handleSubmit = async () => {
        if (!selectedCategory) return

        setIsSubmitting(true)
        try {
            await reportsApi.createReport({
                type,
                targetId,
                category: selectedCategory,
                description
            })
            setIsSuccess(true)
            setTimeout(() => {
                onClose()
                setIsSuccess(false)
                setSelectedCategory("")
                setDescription("")
            }, 2000)
        } catch (error) {
            console.error("Report submission failed:", error)
            alert("Failed to transmit report. Please signal again later.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#09090b]/90 backdrop-blur-3xl border-white/5 text-white p-0 gap-0 sm:rounded-[28px] overflow-hidden shadow-2xl max-w-md">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-br from-red-500/10 to-transparent">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-500/20 rounded-xl border border-red-500/20">
                                <Flag className="w-5 h-5 text-red-400" />
                            </div>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">
                                {isSuccess ? "Report Filed" : `Report ${type === 'app' ? 'Vibely' : 'Subject'}`}
                            </DialogTitle>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-zinc-500" />
                        </button>
                    </div>
                    {!isSuccess && (
                        <p className="text-xs text-zinc-500 font-medium tracking-tight mt-2">
                            {type === 'user' ? `Reporting ${targetName || 'this node'} for specialized review.` : "Help us optimize the Nexus experience."}
                        </p>
                    )}
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-10 gap-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div className="text-center">
                                    <h4 className="text-lg font-black uppercase tracking-tight mb-1">Nexus Verified</h4>
                                    <p className="text-sm text-zinc-500 font-medium">Your signal has been recorded for processing.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Category Selection</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {categories.map((cat) => {
                                            const Icon = cat.icon
                                            return (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 text-left",
                                                        selectedCategory === cat.id
                                                            ? "bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                                            : "bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/10 hover:bg-white/[0.04]"
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4 shrink-0" />
                                                    <span className="text-xs font-bold leading-none pt-0.5">{cat.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Additional Signal Detail</label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Briefly describe the anomaly..."
                                        className="bg-black/40 border-white/5 rounded-2xl min-h-[120px] focus:border-red-500/30 focus:ring-red-500/10 transition-all placeholder:text-zinc-700 text-sm"
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={!selectedCategory || isSubmitting}
                                    className={cn(
                                        "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-500",
                                        "bg-red-500 hover:bg-red-400 text-white shadow-xl shadow-red-500/20 active:scale-95"
                                    )}
                                    isLoading={isSubmitting}
                                >
                                    Transmit Report
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    )
}
