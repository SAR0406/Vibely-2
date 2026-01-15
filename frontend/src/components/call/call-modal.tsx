'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone,
    PhoneOff,
    Video,
    VideoOff,
    Mic,
    MicOff,
    X,
    Maximize2,
    Minimize2,
    MonitorUp,
    Signal,
    SignalHigh,
    SignalLow,
    SignalMedium
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CallState } from '@/hooks/use-webrtc';
import { cn } from '@/lib/utils';

interface CallModalProps {
    callState: CallState;
    onAnswer: (video?: boolean) => void;
    onReject: () => void;
    onEnd: () => void;
    onToggleVideo: () => void;
    onToggleAudio: () => void;
}

// Ripple animation component
const RippleButton = ({
    children,
    onClick,
    className,
    variant = 'default'
}: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    variant?: 'accept' | 'reject' | 'default';
}) => {
    const [ripples, setRipples] = React.useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples(prev => [...prev, { x, y, id }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
        onClick();
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "relative overflow-hidden rounded-full transition-all duration-300",
                className
            )}
        >
            {ripples.map(ripple => (
                <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute rounded-full bg-white/30 pointer-events-none"
                    style={{
                        left: ripple.x - 10,
                        top: ripple.y - 10,
                        width: 20,
                        height: 20,
                    }}
                />
            ))}
            {children}
        </button>
    );
};

// Call Timer Component
const CallTimer = ({ startTime }: { startTime: Date | null }) => {
    const [duration, setDuration] = React.useState('00:00');

    React.useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            const diff = Math.floor((Date.now() - startTime.getTime()) / 1000);
            const mins = Math.floor(diff / 60).toString().padStart(2, '0');
            const secs = (diff % 60).toString().padStart(2, '0');
            setDuration(`${mins}:${secs}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <span className="font-mono text-sm text-white/80">{duration}</span>
    );
};

// Connection Quality Indicator
const ConnectionQuality = ({ quality = 'good' }: { quality?: 'poor' | 'fair' | 'good' | 'excellent' }) => {
    const getIcon = () => {
        switch (quality) {
            case 'poor': return <SignalLow className="h-4 w-4 text-red-400" />;
            case 'fair': return <SignalMedium className="h-4 w-4 text-yellow-400" />;
            case 'good': return <SignalHigh className="h-4 w-4 text-green-400" />;
            case 'excellent': return <Signal className="h-4 w-4 text-green-400" />;
        }
    };

    return (
        <div className="flex items-center gap-1.5">
            {getIcon()}
            <span className="text-xs text-white/60 capitalize">{quality}</span>
        </div>
    );
};

export function CallModal({
    callState,
    onAnswer,
    onReject,
    onEnd,
    onToggleVideo,
    onToggleAudio,
}: CallModalProps) {
    const localVideoRef = React.useRef<HTMLVideoElement>(null);
    const remoteVideoRef = React.useRef<HTMLVideoElement>(null);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [callStartTime, setCallStartTime] = React.useState<Date | null>(null);
    const [pipPosition, setPipPosition] = React.useState({ x: 0, y: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Set up local video stream
    React.useEffect(() => {
        if (localVideoRef.current && callState.localStream) {
            localVideoRef.current.srcObject = callState.localStream;
        }
    }, [callState.localStream]);

    // Set up remote video stream
    React.useEffect(() => {
        if (remoteVideoRef.current && callState.remoteStream) {
            remoteVideoRef.current.srcObject = callState.remoteStream;
        }
    }, [callState.remoteStream]);

    // Track call start time
    React.useEffect(() => {
        if (callState.isInCall && !callStartTime) {
            setCallStartTime(new Date());
        } else if (!callState.isInCall) {
            setCallStartTime(null);
        }
    }, [callState.isInCall]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const isVisible = callState.isIncoming || callState.isRinging || callState.isInCall;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
                >
                    {/* Animated gradient orbs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -50, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[150px]"
                        />
                        <motion.div
                            animate={{
                                x: [0, -80, 0],
                                y: [0, 60, 0],
                                scale: [1, 1.3, 1]
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[150px]"
                        />
                        <motion.div
                            animate={{
                                x: [0, 60, 0],
                                y: [0, -40, 0],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[120px]"
                        />
                    </div>

                    {/* Incoming Call UI */}
                    {callState.isIncoming && !callState.isInCall && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full gap-8"
                        >
                            {/* Caller Avatar with Pulse Rings */}
                            <div className="relative">
                                {/* Pulse rings */}
                                {[1, 2, 3].map((ring) => (
                                    <motion.div
                                        key={ring}
                                        initial={{ scale: 0.8, opacity: 0.5 }}
                                        animate={{ scale: 2, opacity: 0 }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: ring * 0.4,
                                            ease: "easeOut"
                                        }}
                                        className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                    />
                                ))}
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Avatar className="h-36 w-36 border-4 border-green-500/50 relative z-10 shadow-2xl shadow-green-500/30">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                                            {callState.remoteUserName?.[0] || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            </div>

                            {/* Caller Info */}
                            <div className="text-center space-y-2">
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl font-bold text-white"
                                >
                                    {callState.remoteUserName || 'Unknown'}
                                </motion.h2>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg text-green-400 flex items-center justify-center gap-2"
                                >
                                    <motion.span
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        📞
                                    </motion.span>
                                    Incoming call...
                                </motion.p>
                            </div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-8 mt-8"
                            >
                                {/* Reject Button */}
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-red-500/40 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                                    <RippleButton
                                        onClick={onReject}
                                        className="relative h-18 w-18 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl shadow-red-500/50 flex items-center justify-center"
                                        variant="reject"
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, -15, 15, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                        >
                                            <PhoneOff className="h-8 w-8 text-white" />
                                        </motion.div>
                                    </RippleButton>
                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-zinc-400 font-medium">Decline</span>
                                </motion.div>

                                {/* Answer Audio Button */}
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-green-500/40 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                                    <RippleButton
                                        onClick={() => onAnswer(false)}
                                        className="relative h-18 w-18 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl shadow-green-500/50 flex items-center justify-center"
                                        variant="accept"
                                    >
                                        <motion.div
                                            animate={{
                                                rotate: [0, 15, -15, 0],
                                                y: [0, -2, 0]
                                            }}
                                            transition={{ duration: 0.7, repeat: Infinity }}
                                        >
                                            <Phone className="h-8 w-8 text-white" />
                                        </motion.div>
                                    </RippleButton>
                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-zinc-400 font-medium">Audio</span>
                                </motion.div>

                                {/* Answer Video Button */}
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-indigo-500/40 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                                    <RippleButton
                                        onClick={() => onAnswer(true)}
                                        className="relative h-18 w-18 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-2xl shadow-indigo-500/50 flex items-center justify-center"
                                    >
                                        <Video className="h-8 w-8 text-white" />
                                    </RippleButton>
                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-zinc-400 font-medium">Video</span>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Ringing UI (Outgoing Call) */}
                    {callState.isRinging && !callState.isIncoming && !callState.isInCall && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full gap-8"
                        >
                            {/* Callee Avatar with Ringing Animation */}
                            <motion.div
                                animate={{
                                    rotate: [0, 8, -8, 0],
                                }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
                                <Avatar className="h-36 w-36 border-4 border-indigo-500/50 relative z-10 shadow-2xl">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                                        {callState.remoteUserName?.[0] || '?'}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.div>

                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold text-white">
                                    {callState.remoteUserName || 'Calling...'}
                                </h2>
                                <motion.p
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-lg text-indigo-400"
                                >
                                    Ringing...
                                </motion.p>
                            </div>

                            {/* Cancel Button */}
                            <motion.div
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="relative group mt-8"
                            >
                                <div className="absolute inset-0 bg-red-500/40 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                                <RippleButton
                                    onClick={onEnd}
                                    className="relative h-18 w-18 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl shadow-red-500/50 flex items-center justify-center"
                                    variant="reject"
                                >
                                    <PhoneOff className="h-8 w-8 text-white" />
                                </RippleButton>
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-zinc-400 font-medium">Cancel</span>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Active Call UI */}
                    {callState.isInCall && (
                        <div className="relative w-full h-full">
                            {/* Remote Video (Main) */}
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />

                            {/* When no remote video, show avatar */}
                            {!callState.remoteStream && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Avatar className="h-40 w-40 border-4 border-white/10">
                                        <AvatarFallback className="text-6xl font-bold bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                                            {callState.remoteUserName?.[0] || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            )}

                            {/* Local Video PIP */}
                            <motion.div
                                drag
                                dragConstraints={containerRef}
                                dragElastic={0.1}
                                whileDrag={{ scale: 1.05 }}
                                className="absolute bottom-32 right-6 w-44 h-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl cursor-move bg-zinc-900 group"
                            >
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                                {!callState.isVideoEnabled && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                        <div className="text-center">
                                            <VideoOff className="h-8 w-8 text-zinc-500 mx-auto mb-1" />
                                            <span className="text-xs text-zinc-500">Camera Off</span>
                                        </div>
                                    </div>
                                )}
                                {/* Resize hint on hover */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-xs text-white/80">Drag to move</span>
                                </div>
                            </motion.div>

                            {/* Top Bar - Call Info */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent"
                            >
                                {/* Left - User Info */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
                                        <Avatar className="h-12 w-12 border-2 border-white/20">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold">
                                                {callState.remoteUserName?.[0] || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">{callState.remoteUserName}</h3>
                                        <div className="flex items-center gap-3">
                                            <CallTimer startTime={callStartTime} />
                                            <span className="text-zinc-500">•</span>
                                            <ConnectionQuality quality="good" />
                                        </div>
                                    </div>
                                </div>

                                {/* Right - Utility Buttons */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={toggleFullscreen}
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                                    >
                                        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                                    </Button>
                                    <Button
                                        onClick={onEnd}
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Bottom Controls */}
                            <motion.div
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                            >
                                <div className="flex items-center justify-center gap-4">
                                    {/* Mute Button */}
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <Button
                                            onClick={onToggleAudio}
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-14 w-14 rounded-full backdrop-blur-xl border transition-all duration-300",
                                                !callState.isAudioEnabled
                                                    ? "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                                                    : "bg-white/10 border-white/10 text-white hover:bg-white/20"
                                            )}
                                        >
                                            {callState.isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                                        </Button>
                                    </motion.div>

                                    {/* Video Toggle Button */}
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <Button
                                            onClick={onToggleVideo}
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-14 w-14 rounded-full backdrop-blur-xl border transition-all duration-300",
                                                !callState.isVideoEnabled
                                                    ? "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                                                    : "bg-white/10 border-white/10 text-white hover:bg-white/20"
                                            )}
                                        >
                                            {callState.isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                                        </Button>
                                    </motion.div>

                                    {/* Screen Share Button */}
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-14 w-14 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 backdrop-blur-xl"
                                        >
                                            <MonitorUp className="h-6 w-6" />
                                        </Button>
                                    </motion.div>

                                    {/* End Call Button */}
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative"
                                    >
                                        <div className="absolute inset-0 bg-red-500/40 rounded-full blur-xl" />
                                        <RippleButton
                                            onClick={onEnd}
                                            className="relative h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl shadow-red-500/40 flex items-center justify-center"
                                            variant="reject"
                                        >
                                            <motion.div
                                                whileHover={{ rotate: 135 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <PhoneOff className="h-7 w-7 text-white" />
                                            </motion.div>
                                        </RippleButton>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Close button for non-active states */}
                    {!callState.isInCall && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute top-6 right-6"
                        >
                            <Button
                                onClick={onEnd}
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full text-white/60 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
