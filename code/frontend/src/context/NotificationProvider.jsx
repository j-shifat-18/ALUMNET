"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axiosInstance from "@/lib/axios";
import { useSocket } from "@/context/SocketProvider";
import { useAuth } from "@/context/AuthProvider";

const NotificationContext = createContext(null);

const PAGE_SIZE = 20;

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket() ?? {};

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError] = useState(null);

  // ── Fetch Unread Count ─────────────────────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await axiosInstance.get("/api/v1/notifications/unread-count");
      if (res.data?.success) {
        setUnreadCount(res.data.data?.count ?? 0);
      }
    } catch (err) {
      console.error("[useNotifications] fetch unread count error:", err);
    }
  }, [user]);

  // ── Fetch Notifications List ───────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/notifications", {
          params: { limit: PAGE_SIZE },
        }),
        axiosInstance.get("/api/v1/notifications/unread-count"),
      ]);

      if (listRes.status === "fulfilled" && listRes.value.data?.success) {
        const {
          notifications: items = [],
          nextCursor: cursor = null,
          hasMore: more = false,
        } = listRes.value.data.data ?? {};
        setNotifications(items);
        setNextCursor(cursor);
        setHasMore(more);
        setError(null);
      } else if (listRes.status === "rejected") {
        console.error("[useNotifications] fetch list error:", listRes.reason);
        setError("Failed to load notifications");
      }

      if (countRes.status === "fulfilled" && countRes.value.data?.success) {
        setUnreadCount(countRes.value.data.data?.count ?? 0);
      }
    } catch (err) {
      console.error("[useNotifications] fetch error:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount or when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Socket listener for real-time notifications ────────────────────────────
  useEffect(() => {
    if (!socket || !user) return;

    function onNotification(notification) {
      if (!notification || !notification.id) return;

      setNotifications((prev) => {
        // Prevent duplicate if already added
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) {
          return prev.map((n) => (n.id === notification.id ? notification : n));
        }
        return [notification, ...prev];
      });

      // Increment unread count if it is unread
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    }

    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
    };
  }, [socket, user]);

  // ── Mark single notification as read (Optimistic) ──────────────────────────
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      // Check if it was currently unread before updating
      let wasUnread = false;
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === notificationId) {
            if (!n.isRead) wasUnread = true;
            return { ...n, isRead: true };
          }
          return n;
        })
      );

      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await axiosInstance.patch(`/api/v1/notifications/${notificationId}/read`);
      } catch (err) {
        console.error("[useNotifications] markAsRead error:", err);
      }
    },
    []
  );

  // ── Mark all notifications as read (Optimistic) ────────────────────────────
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await axiosInstance.patch("/api/v1/notifications/read-all");
    } catch (err) {
      console.error("[useNotifications] markAllAsRead error:", err);
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

  // ── Delete single notification (Optimistic) ────────────────────────────────
  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      let wasUnread = false;
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === notificationId);
        if (target && !target.isRead) {
          wasUnread = true;
        }
        return prev.filter((n) => n.id !== notificationId);
      });

      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await axiosInstance.delete(`/api/v1/notifications/${notificationId}`);
      } catch (err) {
        console.error("[useNotifications] deleteNotification error:", err);
      }
    },
    []
  );

  // ── Load more (pagination) ─────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;

    setLoadingMore(true);
    try {
      const res = await axiosInstance.get("/api/v1/notifications", {
        params: { limit: PAGE_SIZE, cursor: nextCursor },
      });

      if (res.data?.success) {
        const {
          notifications: older = [],
          nextCursor: newCursor = null,
          hasMore: more = false,
        } = res.data.data ?? {};

        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const uniqueOlder = older.filter((n) => !existingIds.has(n.id));
          return [...prev, ...uniqueOlder];
        });
        setNextCursor(newCursor);
        setHasMore(more);
      }
    } catch (err) {
      console.error("[useNotifications] loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor]);

  const value = {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refetch: fetchNotifications,
    fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
