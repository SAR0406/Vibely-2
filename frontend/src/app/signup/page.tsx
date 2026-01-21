"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useRouter } from "next/navigation"
import { authApi } from "@/services/api"
import { cookieUtils } from "@/lib/cookies"

export default function SignupPage() {
    const router = useRouter()
    const [name, setName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await authApi.signup({ name, email, password })
            cookieUtils.setToken(data.access_token)
            cookieUtils.setUser(data.user)
            router.push('/chat')
        } catch (error: any) {
            console.error("Signup failed", error)
            const message = error.response?.data?.message || "Error creating account. Check fields or try another email."
            alert(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <Card className="w-[380px] md:w-[420px] bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-purple-500/20">
                            <span className="text-2xl font-bold text-white">V</span>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">
                            Create an account
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Join the future of messaging today
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSignup}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity border-0 shadow-lg shadow-purple-500/25 text-white"
                            >
                                {loading ? "Creating Account..." : "Sign Up"}
                            </Button>
                            <div className="text-center text-sm text-zinc-500">
                                Already have an account?{" "}
                                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    )
}
