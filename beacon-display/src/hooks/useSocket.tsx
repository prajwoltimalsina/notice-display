import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Notice } from "@/types/database";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface SocketEvents {
  onNoticeCreated?: (notice: Notice) => void;
  onNoticeUpdated?: (notice: Notice) => void;
  onNoticeDeleted?: (data: { _id: string }) => void;
  onNoticeToggled?: (notice: Notice) => void;
}

export function useSocket(events: SocketEvents) {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Listen for notice events
    if (events.onNoticeCreated) {
      socketRef.current.on("notice:created", events.onNoticeCreated);
    }
    if (events.onNoticeUpdated) {
      socketRef.current.on("notice:updated", events.onNoticeUpdated);
    }
    if (events.onNoticeDeleted) {
      socketRef.current.on("notice:deleted", events.onNoticeDeleted);
    }
    if (events.onNoticeToggled) {
      socketRef.current.on("notice:toggled", events.onNoticeToggled);
    }
  }, [events]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
  };
}
