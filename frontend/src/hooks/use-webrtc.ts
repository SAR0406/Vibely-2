'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/providers/SocketProvider';

/* -------------------- ICE SERVERS -------------------- */
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

/* -------------------- TYPES -------------------- */
export interface CallState {
  isInCall: boolean;
  isIncoming: boolean;
  isRinging: boolean;
  remoteUserId: string | null;
  remoteUserName: string | null;
  conversationId: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

const initialCallState: CallState = {
  isInCall: false,
  isIncoming: false,
  isRinging: false,
  remoteUserId: null,
  remoteUserName: null,
  conversationId: null,
  localStream: null,
  remoteStream: null,
  isVideoEnabled: true,
  isAudioEnabled: true,
};

/* -------------------- HOOK -------------------- */
export function useWebRTC() {
  const socket = useSocket();
  const [callState, setCallState] = useState<CallState>(initialCallState);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  /* -------------------- MEDIA -------------------- */
  const getLocalStream = useCallback(async (video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720 } : false,
        audio: true,
      });
      localStreamRef.current = stream;
      setCallState(s => ({ ...s, localStream: stream }));
      return stream;
    } catch (err) {
      console.error("Failed to get local stream", err);
      return null; // Return null if failed
    }
  }, []);

  /* -------------------- PEER -------------------- */
  const createPeer = useCallback(
    (remoteUserId: string) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
      }

      pc.ontrack = e => setCallState(s => ({ ...s, remoteStream: e.streams[0] }));

      pc.onicecandidate = e => {
        if (e.candidate && socket) {
          socket.emit('call:ice-candidate', { to: remoteUserId, candidate: e.candidate });
        }
      };

      pc.onconnectionstatechange = () => {
        if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
          console.log("Peer connection closed/failed");
          endCall();
        }
      };

      peerRef.current = pc;
      return pc;
    },
    [socket]
  );

  /* -------------------- ACTIONS -------------------- */
  const startCall = useCallback(
    async (userId: string, userName: string, conversationId: string, isVideo = true) => {
      if (!socket) return;
      const stream = await getLocalStream(isVideo);
      if (!stream) return;

      const pc = createPeer(userId);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call:start', { to: userId, offer, conversationId });

      setCallState(s => ({
        ...s,
        isRinging: true,
        remoteUserId: userId,
        remoteUserName: userName,
        conversationId,
        isVideoEnabled: isVideo,
      }));
    },
    [socket, getLocalStream, createPeer]
  );

  const answerCall = useCallback(
    async (isVideo = true) => {
      if (!socket || !callState.remoteUserId) return;
      const stream = await getLocalStream(isVideo);
      if (!stream) return;

      const pc = createPeer(callState.remoteUserId);

      // The remote description should have been set in the incoming listener
      // But we need to make sure we are ready.

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('call:accept', { to: callState.remoteUserId, answer });

      setCallState(s => ({ ...s, isIncoming: false, isInCall: true, isVideoEnabled: isVideo }));
    },
    [socket, callState.remoteUserId, getLocalStream, createPeer]
  );

  const rejectCall = useCallback(() => {
    if (socket && callState.remoteUserId) {
      socket.emit('call:reject', { to: callState.remoteUserId });
    }
    endCall();
  }, [socket, callState.remoteUserId]);

  const endCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerRef.current?.close();

    // We only emit endCall if we are in a call or ringing?
    // Actually, backend didn't implement 'call:end' yet.
    // We should probably allow the user to just stop.
    // If we want to notify the other side, we need 'call:leave' or similar.
    // But for now, let's just clean up locally.
    // Ideally, we emit 'call:end' and the other side handles it.

    localStreamRef.current = null;
    peerRef.current = null;
    pendingCandidatesRef.current = [];

    setCallState(initialCallState);
  }, []);

  const toggleVideo = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) track.enabled = !track.enabled;
    setCallState(s => ({ ...s, isVideoEnabled: !!track?.enabled }));
  }, []);

  const toggleAudio = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) track.enabled = !track.enabled;
    setCallState(s => ({ ...s, isAudioEnabled: !!track?.enabled }));
  }, []);

  /* -------------------- SOCKET EVENTS -------------------- */
  useEffect(() => {
    if (!socket) return;

    socket.on('call:incoming', async (data) => {
      // Don't auto-answer, but set up the peer to specific state if needed?
      // Actually we just show the ringing state.
      // We do NOT setRemoteDescription yet because we haven't created the peer.
      // Wait, we need to create the peer to setRemoteDescription?
      // Yes, usually we wait until "Answer" to create peer, BUT we need to know the offer.
      // So let's store the offer in a specific way or just store it in state?
      // Simpler: We create the peer in 'answerCall' but we need the offer passed to it.
      // OR we create the peer here but don't get media yet.

      // Better approach:
      // We set state 'isIncoming' with the offer data.
      // When user clicks accept, we create peer, set remote desc (from stored offer), then create answer.

      // HOWEVER, createPeer inside useCallback depends on 'localStream'.
      // Check 'answerCall' logic: It calls getLocalStream, then createPeer.
      // Then it needs to setRemoteDescription!
      // So we must access the offer from the event data.
      // The event data is NOT stored in callState currently (except implied).

      // Quick fix: Attach the offer to the socket object temporarily or use a ref?
      // Or update CallState to include 'offer'.

      // Let's use a ref for the pending offer.
      // (Added activeOfferRef below)

      activeOfferRef.current = data.offer;

      setCallState(s => ({
        ...s,
        isIncoming: true,
        isRinging: true,
        remoteUserId: data.from,
        remoteUserName: data.callerName,
        conversationId: data.conversationId,
      }));
    });

    socket.on('call:accepted', async (data) => {
      await peerRef.current?.setRemoteDescription(data.answer);
      // Drain buffered candidates
      pendingCandidatesRef.current.forEach(cand => {
        peerRef.current?.addIceCandidate(cand).catch(e => console.error("Error adding buffered candidate", e));
      });
      pendingCandidatesRef.current = [];
      setCallState(s => ({ ...s, isRinging: false, isInCall: true }));
    });

    socket.on('call:rejected', () => {
      endCall();
      alert("Call rejected");
    });

    socket.on('call:ice-candidate', async (data) => {
      try {
        const pc = peerRef.current;
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(data.candidate);
        } else {
          pendingCandidatesRef.current.push(data.candidate);
        }
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    });

    return () => {
      socket.off('call:incoming');
      socket.off('call:accepted');
      socket.off('call:rejected');
      socket.off('call:ice-candidate');
    };
  }, [socket, endCall]);

  const activeOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  // Update answerCall to use the ref
  const answerCallWithOffer = useCallback(async (isVideo = true) => {
    if (!socket || !callState.remoteUserId || !activeOfferRef.current) return;
    const stream = await getLocalStream(isVideo);
    if (!stream) return;

    const pc = createPeer(callState.remoteUserId);
    await pc.setRemoteDescription(activeOfferRef.current);

    // Drain buffered candidates
    pendingCandidatesRef.current.forEach(cand => {
      pc.addIceCandidate(cand).catch(e => console.error("Error adding buffered candidate", e));
    });
    pendingCandidatesRef.current = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('call:accept', { to: callState.remoteUserId, answer });
    setCallState(s => ({ ...s, isIncoming: false, isInCall: true, isVideoEnabled: isVideo }));
  }, [socket, callState.remoteUserId, getLocalStream, createPeer]);

  return {
    callState,
    startCall,
    answerCall: answerCallWithOffer,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio
  };
}
