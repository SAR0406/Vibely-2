'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { cookieUtils } from '@/lib/cookies';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context.socket;
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = cookieUtils.getToken();
    if (!token) return;

    const s = io(SOCKET_URL, {
      auth: { token },
      extraHeaders: { authorization: `Bearer ${token}` },
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
