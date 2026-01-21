'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function NexusCoreVisual() {
    return (
        <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

            <div className="relative group perspective-1000">
                {/* Visual Glows */}
                <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full scale-150 group-hover:scale-[2] transition-transform duration-1000" />
                <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full -translate-x-10 scale-125" />

                {/* Floating Nexus Core */}
                <motion.div
                    animate={{
                        y: [-20, 20, -20],
                        rotateY: [0, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="relative z-20 w-80 h-80 pointer-events-none"
                >
                    <img
                        src="/nexus-core.png"
                        alt="Nexus Core"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_50px_rgba(34,211,238,0.5)]"
                    />
                </motion.div>

                {/* Circular Orbits */}
                <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.5] pointer-events-none" />
                <div className="absolute inset-0 border border-white/5 rounded-full scale-[2.2] pointer-events-none opacity-50" />
                <div className="absolute inset-0 border border-white/5 rounded-full scale-[3] pointer-events-none opacity-20" />
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] to-transparent" />
        </div>
    );
}
