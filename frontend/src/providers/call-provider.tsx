'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { useWebRTC, type CallState } from '@/hooks/use-webrtc';
import { CallModal } from '@/components/call/call-modal';

/* -------------------- TYPES -------------------- */

interface CallContextType {
  callState: CallState;
  startCall: (userId: string, userName: string, conversationId: string, isVideo?: boolean) => Promise<void>;
  answerCall: (isVideoCall?: boolean) => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
}

/* -------------------- CONTEXT -------------------- */

const CallContext = createContext<CallContextType | undefined>(undefined);

/* -------------------- HOOK -------------------- */

export function useCall(): CallContextType {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error('useCall must be used inside CallProvider');
  }

  return context;
}

/* -------------------- PROVIDER -------------------- */

export function CallProvider({ children }: { children: ReactNode }) {
  const webrtc = useWebRTC();

  /**
   * Memoize context value to avoid
   * re-rendering the entire app on every state change
   */
  const value = useMemo<CallContextType>(
    () => ({
      callState: webrtc.callState,
      startCall: webrtc.startCall,
      answerCall: webrtc.answerCall,
      rejectCall: webrtc.rejectCall,
      endCall: webrtc.endCall,
      toggleVideo: webrtc.toggleVideo,
      toggleAudio: webrtc.toggleAudio,
    }),
    [webrtc]
  );

  return (
    <CallContext.Provider value={value}>
      {children}

      {/* Global Call UI */}
      <CallModal
        callState={webrtc.callState}
        onAnswer={webrtc.answerCall}
        onReject={webrtc.rejectCall}
        onEnd={webrtc.endCall}
        onToggleVideo={webrtc.toggleVideo}
        onToggleAudio={webrtc.toggleAudio}
      />
    </CallContext.Provider>
  );
}
