import { Skeleton } from "@/components/ui/skeleton"

export function ChatSkeleton() {
    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32 rounded-md" />
                        <Skeleton className="h-3 w-20 rounded-md opacity-60" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 space-y-8 flex flex-col justify-end">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        <div className={`space-y-2 max-w-[60%] w-full ${i % 2 === 0 ? 'items-end flex flex-col' : ''}`}>
                            <Skeleton className={`h-16 w-full rounded-2xl ${i % 2 === 0 ? 'rounded-tr-sm' : 'rounded-tl-sm'}`} />
                            <Skeleton className="h-3 w-12 opacity-50" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
        </div>
    )
}
