"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
    Search,
    MoreHorizontal,
    Trash2,
    Shield,
    UserMinus,
    UserCheck,
    Mail,
    Calendar,
    Crown,
    ShieldCheck
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { adminApi } from "@/services/api"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface User {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    createdAt: string
    lastSeen: string
    tier: 'FREE' | 'PRO' | 'BUSINESS'
}

export default function UserManagement() {
    const [users, setUsers] = React.useState<User[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [page, setPage] = React.useState(1)

    const fetchUsers = React.useCallback(async () => {
        try {
            const { data } = await adminApi.getUsers(page)
            setUsers(data.users)
        } catch (error) {
            console.error("Failed to fetch users", error)
        } finally {
            setLoading(false)
        }
    }, [page])

    React.useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            await adminApi.updateUserRole(userId, newRole)
            fetchUsers()
        } catch (error) {
            alert("Failed to update role")
        }
    }

    const handleUpgradeUser = async (userId: string, tier: 'FREE' | 'PRO' | 'BUSINESS') => {
        try {
            await adminApi.upgradeUser(userId, tier)
            fetchUsers()
            alert(`User upgraded to ${tier} successfully`)
        } catch (error) {
            console.error(error)
            alert("Failed to upgrade user")
        }
    }

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await adminApi.updateUserStatus(userId, !currentStatus)
            fetchUsers()
        } catch (error) {
            alert("Failed to update status")
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return
        try {
            await adminApi.deleteUser(userId)
            fetchUsers()
        } catch (error) {
            alert("Failed to delete user")
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-zinc-500 mt-1">Manage user roles, account status, and permissions.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Search names or emails..."
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-zinc-400">User</TableHead>
                                <TableHead className="text-zinc-400">Role</TableHead>
                                <TableHead className="text-zinc-400">Tier</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                                <TableHead className="text-zinc-400">Joined</TableHead>
                                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{user.name}</span>
                                            <span className="text-xs text-zinc-500">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "rounded-full font-medium px-2.5 py-0.5 border-0 bg-white/5",
                                            user.role === 'ADMIN' ? "text-purple-400" : "text-blue-400"
                                        )}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "rounded-full font-medium px-2.5 py-0.5 border-0 bg-white/5",
                                            user.tier === 'BUSINESS' ? "text-amber-400 border-amber-500/20 bg-amber-500/10" :
                                                user.tier === 'PRO' ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" :
                                                    "text-zinc-400"
                                        )}>
                                            {user.tier || 'FREE'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                user.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"
                                            )} />
                                            <span className="text-sm text-zinc-300">
                                                {user.isActive ? "Active" : "Banned"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-sm">
                                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-xl">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-white/10 text-white rounded-xl">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-white/10" />

                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="gap-2 cursor-pointer focus:bg-white/10">
                                                        <Crown className="w-4 h-4 text-amber-500" />
                                                        Change Plan
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                                                            <DropdownMenuItem onClick={() => handleUpgradeUser(user.id, 'FREE')}>
                                                                Free Tier
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpgradeUser(user.id, 'PRO')}>
                                                                Pro Tier
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpgradeUser(user.id, 'BUSINESS')}>
                                                                Business Tier
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>

                                                <DropdownMenuItem
                                                    className="gap-2 focus:bg-purple-500/10 focus:text-purple-400 cursor-pointer"
                                                    onClick={() => handleUpdateRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    {user.role === 'ADMIN' ? "Demote to User" : "Promote to Admin"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className={cn(
                                                        "gap-2 focus:bg-white/10 cursor-pointer",
                                                        user.isActive ? "focus:text-red-400" : "focus:text-green-400"
                                                    )}
                                                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                >
                                                    {user.isActive ? (
                                                        <>
                                                            <UserMinus className="w-4 h-4" />
                                                            Ban Account
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck className="w-4 h-4" />
                                                            Unban Account
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem
                                                    className="gap-2 focus:bg-red-500/10 text-red-400 cursor-pointer"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    )
}


