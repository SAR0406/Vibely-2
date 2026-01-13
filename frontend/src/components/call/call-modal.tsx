'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';
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

    const isVisible = callState.isIncoming || callState.isRinging || callState.isInCall;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center"
                >
                    {/* Ambient glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-[150px] pointer-events-none" />

                    {/* Incoming Call UI */}
                    {callState.isIncoming && !callState.isInCall && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center gap-8 p-12"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse" />
                                <Avatar className="h-32 w-32 border-4 border-green-500/50 relative z-10">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500 to-purple-600">
                                        {callState.remoteUserName?.[0] || '?'}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.div>

                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {callState.remoteUserName || 'Unknown'}
                                </h2>
                                <p className="text-green-400 animate-pulse">Incoming call...</p>
                            </div>

                            <div className="flex gap-6 mt-4">
                                <Button
                                    onClick={onReject}
                                    size="lg"
                                    className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40"
                                >
                                    <PhoneOff className="h-6 w-6" />
                                </Button>
                                <Button
                                    onClick={() => onAnswer(false)}
                                    size="lg"
                                    className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/40"
                                >
                                    <Phone className="h-6 w-6" />
                                </Button>
                                <Button
                                    onClick={() => onAnswer(true)}
                                    size="lg"
                                    className="h-16 w-16 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/40"
                                >
                                    <Video className="h-6 w-6" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Ringing UI (Outgoing) */}
                    {callState.isRinging && !callState.isIncoming && !callState.isInCall && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center gap-8 p-12"
                        >
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                            >
                                <Avatar className="h-32 w-32 border-4 border-indigo-500/50">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500 to-purple-600">
                                        {callState.remoteUserName?.[0] || '?'}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.div>

                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {callState.remoteUserName || 'Calling...'}
                                </h2>
                                <p className="text-indigo-400 animate-pulse">Ringing...</p>
                            </div>

                            <Button
                                onClick={onEnd}
                                size="lg"
                                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40 mt-4"
                            >
                                <PhoneOff className="h-6 w-6" />
                            </Button>
                        </motion.div>
                    )}

                    {/* Active Call UI */}
                    {callState.isInCall && (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Remote Video (Main) */}
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />

                            {/* Local Video (PIP) */}
                            <motion.div
                                drag
                                dragConstraints={{ left: -200, right: 200, top: -100, bottom: 100 }}
                                className="absolute bottom-28 right-6 w-40 h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl cursor-move"
                            >
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                                {!callState.isVideoEnabled && (
                                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                                        <VideoOff className="h-8 w-8 text-zinc-600" />
                                    </div>
                                )}
                            </motion.div>

                            {/* Call Info */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-lg px-4 py-2 rounded-full">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-white font-medium">{callState.remoteUserName}</span>
                            </div>

                            {/* Controls */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10">
                                <Button
                                    onClick={onToggleAudio}
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-12 w-12 rounded-full",
                                        !callState.isAudioEnabled ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20"
                                    )}
                                >
                                    {callState.isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                </Button>
                                <Button
                                    onClick={onToggleVideo}
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-12 w-12 rounded-full",
                                        !callState.isVideoEnabled ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20"
                                    )}
                                >
                                    {callState.isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                                </Button>
                                <Button
                                    onClick={onEnd}
                                    size="icon"
                                    className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40"
                                >
                                    <PhoneOff className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Close button */}
                    {!callState.isInCall && (
                        <Button
                            onClick={onEnd}
                            variant="ghost"
                            size="icon"
                            className="absolute top-6 right-6 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
