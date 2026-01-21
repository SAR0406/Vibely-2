"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { cookieUtils } from "@/lib/cookies"

export default function AdminIndex() {
    const router = useRouter()

    useEffect(() => {
        const user = cookieUtils.getUser()
        if (user) {
            if (user.role === 'ADMIN') {
                router.replace('/admin/dashboard')
            } else {
                router.replace('/chat')
            }
        } else {
            router.replace('/login')
        }
    }, [router])

    return (
        <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase animate-pulse">Establishing Secure Nexus...</p>
            </div>
        </div>
    )
}
