"use client"

import React, { useState, useRef, useEffect } from "react"
import { Mic, Square, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AudioRecorderProps {
    onSend: (file: File) => void
    onCancel: () => void
}

export function AudioRecorder({ onSend, onCancel }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [duration, setDuration] = useState(0)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        startRecording()
        return () => {
            stopRecordingContext()
        }
    }, [])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorderRef.current = new MediaRecorder(stream)
            chunksRef.current = []

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorderRef.current.start()
            setIsRecording(true)

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1)
            }, 1000)

        } catch (error) {
            console.error("Error accessing microphone:", error)
            onCancel()
        }
    }

    const stopRecordingContext = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
        if (timerRef.current) clearInterval(timerRef.current)
    }

    const handleSend = () => {
        if (!mediaRecorderRef.current) return

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: "audio/webm" })
            const file = new File([blob], "voice-message.webm", { type: "audio/webm" })
            onSend(file)
        }
        stopRecordingContext()
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="flex items-center gap-4 w-full bg-zinc-900/50 p-2 rounded-2xl border border-indigo-500/30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 px-2 flex-1">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-sm text-indigo-300 min-w-[40px]">{formatTime(duration)}</span>
                <div className="h-8 flex-1 bg-zinc-800/50 rounded-full overflow-hidden flex items-center px-3 relative">
                    {/* Visualizer bars simulation */}
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-50">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-indigo-500 rounded-full transition-all duration-75"
                                style={{
                                    height: `${Math.random() * 80 + 20}%`,
                                    animation: `pulse 0.5s infinite ${Math.random()}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                    stopRecordingContext()
                    onCancel()
                }}
                className="hover:bg-red-500/10 hover:text-red-500"
            >
                <Trash2 className="h-5 w-5" />
            </Button>

            <Button
                size="icon"
                onClick={handleSend}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20"
            >
                <Send className="h-5 w-5" />
            </Button>
        </div>
    )
}
