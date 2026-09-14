"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";
import { useAuth } from "@/context/AuthProvider";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  // Track all users who are currently online: Set<userId(number)>
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Global unread message count across all conversations — for the navbar badge
  const [totalUnread, setTotalUnread] = useState(0);

  // Ref so event handlers always have the latest value without re-registering
  const onlineUsersRef = useRef(onlineUsers);
  onlineUsersRef.current = onlineUsers;

  useEffect(() => {
    if (!user) {
      // Not authenticated — disconnect if we were connected
      if (socket.connected) {
        socket.disconnect();
      }
      setIsConnected(false);
      return;
    }

    // Get a fresh Firebase ID token then connect
    async function connect() {
      try {
        const token = await user.getIdToken(/* forceRefresh */ false);
        socket.auth = { token };
        socket.connect();
      } catch (err) {
        console.error("[socket] failed to get token:", err);
      }
    }

    connect();

    // ── Lifecycle ──────────────────────────────────────────────────────────
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    async function onConnectError(err) {
      console.error("[socket] connect error:", err.message);
      setIsConnected(false);

      if (err?.message?.toLowerCase().includes("auth") && user) {
        try {
          const freshToken = await user.getIdToken(true);
          socket.auth = { token: freshToken };
          if (!socket.connected) {
            socket.connect();
          }
        } catch (refreshErr) {
          console.error("[socket] token refresh on connect error failed:", refreshErr);
        }
      }
    }

    // ── Presence ───────────────────────────────────────────────────────────
    // Seed the full online user list when we first connect.
    // The server sends this immediately after authentication so we never
    // start with a stale/empty set.
    function onOnlineUsersList({ userIds }) {
      setOnlineUsers(new Set(userIds.map(Number)));
    }

    function onUserOnline({ userId }) {
      setOnlineUsers((prev) => new Set([...prev, Number(userId)]));
    }

    function onUserOffline({ userId }) {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(Number(userId));
        return next;
      });
    }

    // ── Unread badge — lightweight ping when a message arrives ─────────────
    // The full message_notification payload is handled per-conversation in
    // useMessages. Here we only increment the global badge.
    function onMessageNotification() {
      setTotalUnread((n) => n + 1);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("online_users_list", onOnlineUsersList);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);
    socket.on("message_notification", onMessageNotification);

    // Re-connect with a fresh token every 55 minutes (Firebase tokens expire at 60m)
    const tokenRefreshInterval = setInterval(async () => {
      try {
        const freshToken = await user.getIdToken(true);
        socket.auth = { token: freshToken };
        // Re-connect so the new token is verified server-side
        if (socket.connected) {
          socket.disconnect();
          socket.connect();
        }
      } catch (err) {
        console.error("[socket] token refresh failed:", err);
      }
    }, 55 * 60 * 1000);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("online_users_list", onOnlineUsersList);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
      socket.off("message_notification", onMessageNotification);
      clearInterval(tokenRefreshInterval);
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, onlineUsers, totalUnread, setTotalUnread }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
