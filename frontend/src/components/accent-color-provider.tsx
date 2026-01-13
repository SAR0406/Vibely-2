"use client"

import * as React from "react"
import { useThemeStore } from "@/store/use-theme-store"

export function AccentColorProvider({ children }: { children: React.ReactNode }) {
    const accentColor = useThemeStore((state) => state.accentColor)

    React.useEffect(() => {
        const root = window.document.documentElement

        // Remove existing accent classes
        const classesToRemove = Array.from(root.classList).filter(c => c.startsWith('accent-'))
        classesToRemove.forEach(c => root.classList.remove(c))

        // Add new accent class
        root.classList.add(`accent-${accentColor}`)
    }, [accentColor])

    return <>{children}</>
}
