import React from 'react';
import { cn } from '@/lib/utils';

interface DateSeparatorProps {
    date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
    return (
        <div className="flex items-center justify-center my-6">
            <div className="bg-zinc-900/60 border border-white/5 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                <span className="text-[11px] font-medium text-zinc-500 tracking-wide uppercase">
                    {date}
                </span>
            </div>
        </div>
    );
}
