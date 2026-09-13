"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { useSocket } from "@/context/SocketProvider";

const PAGE_SIZE = 30;

/**
 * useMessages
 *
 * Manages messages for a single conversation.
 *
 * - Loads the initial page via REST on mount.
 * - Listens for new_message socket events and appends them live.
 * - Tracks who is currently typing in this conversation.
 * - Exposes sendMessage (via socket) and loadMore (cursor-based pagination).
 * - Joins/leaves the socket room on mount/unmount.
 */
export function useMessages({ conversationId, currentUserId }) {
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set()); // Set<userId>

  // Keep a ref to the latest messages array so socket handlers don't capture stale state
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);
    setMessages([]);
    setNextCursor(null);
    setHasMore(false);

    axiosInstance
      .get(`/api/v1/conversations/${conversationId}/messages`, {
        params: { limit: PAGE_SIZE },
      })
      .then((res) => {
        const { messages: msgs, nextCursor: cursor, hasMore: more } = res.data.data;
        // API returns newest-first; reverse so oldest is at the top for rendering
        setMessages([...msgs].reverse());
        setNextCursor(cursor);
        setHasMore(more);
        setError(null);
      })
      .catch((err) => {
        console.error("[useMessages] load error:", err);
        setError("Failed to load messages");
      })
      .finally(() => setLoading(false));
  }, [conversationId]);

  // ── Socket room join/leave + event listeners ───────────────────────────────
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join_conversation", { conversationId });

    function onNewMessage(message) {
      // Avoid duplicate if we already appended optimistically
      const alreadyExists = messagesRef.current.some((m) => m.id === message.id);
      if (!alreadyExists) {
        setMessages((prev) => [...prev, message]);
      }

      // Stop typing indicator for this sender
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(message.senderId);
        return next;
      });
    }

    function onUserTyping({ userId, conversationId: cid }) {
      if (cid !== conversationId) return;
      if (userId === currentUserId) return;
      setTypingUsers((prev) => new Set([...prev, userId]));
    }

    function onUserStoppedTyping({ userId, conversationId: cid }) {
      if (cid !== conversationId) return;
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }

    function onMessagesRead({ conversationId: cid }) {
      // Could mark messages as read visually — left for Module 4 UI polish
      if (cid !== conversationId) return;
    }

    function onMessageError({ code, message: msg }) {
      console.error("[socket] message_error:", code, msg);
      setError(msg);
      // Clear after 4 seconds
      setTimeout(() => setError(null), 4000);
    }

    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stopped_typing", onUserStoppedTyping);
    socket.on("messages_read", onMessagesRead);
    socket.on("message_error", onMessageError);

    return () => {
      socket.emit("leave_conversation", { conversationId });
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stopped_typing", onUserStoppedTyping);
      socket.off("messages_read", onMessagesRead);
      socket.off("message_error", onMessageError);
    };
  }, [socket, conversationId, currentUserId]);

  // ── Load more (older) messages ─────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;

    setLoadingMore(true);
    try {
      const res = await axiosInstance.get(
        `/api/v1/conversations/${conversationId}/messages`,
        { params: { limit: PAGE_SIZE, cursor: nextCursor } },
      );
      const { messages: older, nextCursor: newCursor, hasMore: more } = res.data.data;
      // Prepend reversed older messages to the top
      setMessages((prev) => [...[...older].reverse(), ...prev]);
      setNextCursor(newCursor);
      setHasMore(more);
    } catch (err) {
      console.error("[useMessages] loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, hasMore, loadingMore, nextCursor]);

  // ── Send message ───────────────────────────────────────────────────────────
  // Optimistic UI: append immediately, the server will emit new_message back
  // which the onNewMessage handler deduplicates via the id check.
  const sendMessage = useCallback(
    (content) => {
      if (!socket || !content.trim()) return;

      // Stop typing indicator immediately
      socket.emit("typing_stop", { conversationId });

      socket.emit("send_message", { conversationId, content: content.trim() });
    },
    [socket, conversationId],
  );

  // ── Typing notifications ───────────────────────────────────────────────────
  const typingTimerRef = useRef(null);

  const notifyTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("typing_start", { conversationId });

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId });
    }, 2000);
  }, [socket, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket) return;
    clearTimeout(typingTimerRef.current);
    socket.emit("typing_stop", { conversationId });
  }, [socket, conversationId]);

  // ── Mark read ──────────────────────────────────────────────────────────────
  const markRead = useCallback(() => {
    if (!socket) return;
    socket.emit("message_read", { conversationId });
  }, [socket, conversationId]);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    typingUsers,
    sendMessage,
    loadMore,
    notifyTyping,
    stopTyping,
    markRead,
  };
}
