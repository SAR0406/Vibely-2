import { Skeleton } from "@/components/ui/skeleton"

export function SidebarSkeleton() {
    return (
        <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-24 rounded-lg" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-xl" />
                    <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
            </div>

            <Skeleton className="h-11 w-full rounded-xl mb-6" />

            <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-transparent">
                        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24 rounded-md" />
                                <Skeleton className="h-3 w-10 rounded-md" />
                            </div>
                            <Skeleton className="h-3 w-3/4 rounded-md opacity-60" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
