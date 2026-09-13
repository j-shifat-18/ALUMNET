"use client";

import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

/**
 * MessageList
 *
 * Renders all messages in the conversation. Handles:
 *   - Auto-scroll to bottom on new messages
 *   - Infinite scroll upward to load older messages
 *   - Grouping consecutive same-sender messages (avatar shown once per run)
 *   - Date separators
 *   - Loading states
 */

function formatDateSeparator(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export default function MessageList({
  messages,
  loading,
  loadingMore,
  hasMore,
  currentUserId,
  typingUsers,
  members,
  onLoadMore,
}) {
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (loading) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Preserve scroll position when loading older messages at the top
  useEffect(() => {
    if (!loadingMore) {
      const container = scrollContainerRef.current;
      if (!container) return;
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
    }
  }, [loadingMore]);

  // Intersection Observer to trigger loadMore when the top sentinel is visible
  const topSentinelRef = useCallback(
    (node) => {
      if (!node || !hasMore || loadingMore) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            prevScrollHeightRef.current =
              scrollContainerRef.current?.scrollHeight ?? 0;
            onLoadMore?.();
          }
        },
        { root: scrollContainerRef.current, threshold: 0.1 },
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMore, loadingMore, onLoadMore],
  );

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600 select-none">
        <span className="text-3xl">💬</span>
        <p className="text-sm">No messages yet. Say hello!</p>
      </div>
    );
  }

  // ── Group messages + date separators ──────────────────────────────────────
  const rendered = [];
  let lastDate = null;
  let lastSenderId = null;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const msgDate = new Date(msg.createdAt).toDateString();

    // Date separator
    if (msgDate !== lastDate) {
      lastDate = msgDate;
      lastSenderId = null; // Reset grouping on date boundary
      rendered.push(
        <div
          key={`sep-${msg.id}`}
          className="flex items-center gap-3 my-3 px-4"
        >
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          <span className="text-xs text-gray-400 dark:text-gray-600 whitespace-nowrap">
            {formatDateSeparator(msg.createdAt)}
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>,
      );
    }

    const isOwn = msg.senderId === currentUserId;
    const showAvatar = !isOwn && msg.senderId !== lastSenderId;
    lastSenderId = msg.senderId;

    rendered.push(
      <div key={msg.id} className="px-4">
        <MessageBubble message={msg} isOwn={isOwn} showAvatar={showAvatar} />
      </div>,
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 scroll-smooth"
    >
      {/* Top sentinel for infinite scroll */}
      {hasMore && (
        <div ref={topSentinelRef} className="flex justify-center py-2">
          {loadingMore && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>
      )}

      {rendered}

      {/* Typing indicator */}
      <TypingIndicator typingUsers={typingUsers} participants={members} />

      {/* Bottom anchor for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}
