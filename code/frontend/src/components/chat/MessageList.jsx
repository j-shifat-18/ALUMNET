"use client";

import { useEffect, useRef, useCallback } from "react";
import { Loader2, MessageCircle, Sparkles } from "lucide-react";
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
  if (!dateStr) return "";
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
      container.scrollHeight - container.scrollTop - container.clientHeight < 140;

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
      <div className="flex-1 flex flex-col justify-end p-6 gap-4 animate-pulse">
        <div className="flex items-end gap-2.5 max-w-[60%]">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-bl-xs w-48" />
        </div>
        <div className="flex items-end gap-2.5 max-w-[60%] self-end flex-row-reverse">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-br-xs w-56" />
        </div>
        <div className="flex items-end gap-2.5 max-w-[60%]">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
          <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-bl-xs w-64" />
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3 text-center select-none">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-xs">
          <MessageCircle className="w-7 h-7 stroke-[1.5]" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
            No messages yet
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            Send a friendly greeting or start collaborating with your fellow alumni or student!
          </p>
        </div>
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
          className="flex items-center justify-center my-4 px-4 select-none"
        >
          <div className="relative flex items-center justify-center w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/80 dark:border-gray-800" />
            </div>
            <span className="relative z-10 px-3 py-0.5 text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">
              {formatDateSeparator(msg.createdAt)}
            </span>
          </div>
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
      className="flex-1 min-h-0 overflow-y-auto py-4 flex flex-col gap-0.5 overscroll-contain bg-gray-50/40 dark:bg-black/20"
    >
      {/* Top sentinel for infinite scroll */}
      {hasMore && (
        <div ref={topSentinelRef} className="flex justify-center py-2 shrink-0">
          {loadingMore && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-gray-500 shadow-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Loading older messages…</span>
            </div>
          )}
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


