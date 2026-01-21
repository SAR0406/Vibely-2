"use client"

import { createHash } from 'crypto'

/**
 * Simulates blockchain-style security for the Vibely Nexus platform.
 * Provides message hashing and signature verification.
 */
export const NexusSecurity = {
    /**
     * Generates a unique hash for a message to ensure integrity.
     */
    generateHash: (content: string, senderId: string, timestamp: number) => {
        const payload = `${content}-${senderId}-${timestamp}`
        // Using a simpler hash for frontend demonstration if 'crypto' is unavailable
        // but typically you'd use a real library.
        let hash = 0
        for (let i = 0; i < payload.length; i++) {
            const char = payload.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32bit integer
        }
        return `NXS-${Math.abs(hash).toString(16).padStart(8, '0')}`
    },

    /**
     * Verifies if a message hash matches its contents.
     */
    verifyIntegrity: (content: string, senderId: string, timestamp: number, hash: string) => {
        const expected = NexusSecurity.generateHash(content, senderId, timestamp)
        return expected === hash
    },

    /**
     * Simulation of a private key signature.
     */
    signPayload: (payload: string, privateKey: string) => {
        return `SIG[${btoa(payload + privateKey).slice(0, 12)}]`
    }
}
