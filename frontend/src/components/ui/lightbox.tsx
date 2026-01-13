"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LightboxProps {
    src: string;
    alt?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function Lightbox({ src, alt, isOpen, onClose }: LightboxProps) {
    const [scale, setScale] = React.useState(1);

    // Reset scale when opening a new image
    useEffect(() => {
        if (isOpen) setScale(1);
    }, [isOpen, src]);

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(s => Math.min(s + 0.5, 3));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(s => Math.max(s - 0.5, 1));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            >
                {/* Toolbar */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-50" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={scale <= 1} className="text-white hover:bg-white/10 rounded-full">
                        <ZoomOut className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={scale >= 3} className="text-white hover:bg-white/10 rounded-full">
                        <ZoomIn className="h-5 w-5" />
                    </Button>
                    <a href={src} download target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                            <Download className="h-5 w-5" />
                        </Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full bg-white/5">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Image */}
                <motion.img
                    src={src}
                    alt={alt || "Lightbox image"}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: scale, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.stopPropagation()}
                    drag
                    dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                    whileDrag={{ cursor: "grabbing" }}
                />
            </motion.div>
        </AnimatePresence>
    );
}
