"use client";

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axios";

/**
 * useChat
 *
 * Manages the conversations list for the current user.
 * Provides helpers to create/get a direct conversation and mark one as read.
 *
 * Call refreshConversations() after sending a message or receiving
 * message_notification to keep the list up-to-date.
 */
export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/v1/conversations");
      setConversations(res.data.data ?? []);
      setError(null);
    } catch (err) {
      console.error("[useChat] fetch error:", err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /**
   * Create or retrieve an existing direct conversation with participantId.
   * Returns the conversation object on success.
   */
  const createOrGetConversation = useCallback(async (participantId) => {
    const res = await axiosInstance.post("/api/v1/conversations", {
      participantId,
    });
    // Refresh list so the new conversation appears
    await fetchConversations();
    return res.data.data;
  }, [fetchConversations]);

  /**
   * Mark a conversation as read on the server and update local unreadCount to 0.
   */
  const markAsRead = useCallback(async (conversationId) => {
    try {
      await axiosInstance.patch(`/api/v1/conversations/${conversationId}/read`);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      );
    } catch (err) {
      console.error("[useChat] markAsRead error:", err);
    }
  }, []);

  /**
   * Called when a new message_notification socket event arrives.
   * Increments the unread count for that conversation and bumps it to the top.
   */
  const handleIncomingMessage = useCallback((conversationId, lastMessage) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === conversationId);
      if (idx === -1) {
        // Unknown conversation — refresh the whole list
        fetchConversations();
        return prev;
      }
      const updated = {
        ...prev[idx],
        unreadCount: (prev[idx].unreadCount ?? 0) + 1,
        lastMessage,
        updatedAt: lastMessage.createdAt,
      };
      // Move to top
      const next = [...prev];
      next.splice(idx, 1);
      return [updated, ...next];
    });
  }, [fetchConversations]);

  /**
   * Update the lastMessage preview for a conversation (called after we send a message).
   */
  const updateLastMessage = useCallback((conversationId, message) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: message, updatedAt: message.createdAt }
          : c,
      ),
    );
  }, []);

  return {
    conversations,
    loading,
    error,
    refreshConversations: fetchConversations,
    createOrGetConversation,
    markAsRead,
    handleIncomingMessage,
    updateLastMessage,
  };
}
