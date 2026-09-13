"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, MessageSquare, Search, X, CheckCheck } from "lucide-react";
import { useState, useMemo } from "react";
import { useSocket } from "@/context/SocketProvider";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function truncate(str, max = 36) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/**
 * ConversationList
 *
 * Left-panel sidebar listing all conversations, ordered by most recent.
 * Shows participant name, avatar, last message preview, unread count, and online status.
 */
export default function ConversationList({ conversations = [], loading, currentUserId }) {
  const pathname = usePathname();
  const { onlineUsers } = useSocket();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL"); // "ALL" | "UNREAD"

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      if (activeFilter === "UNREAD" && (!c.unreadCount || c.unreadCount <= 0)) {
        return false;
      }
      if (!search.trim()) return true;
      const name = c.participant?.name ?? "";
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [conversations, activeFilter, search]);

  if (loading) {
    return (
      <div className="flex flex-col p-3 gap-2 animate-pulse">
        <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded-xl w-full mb-2" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl">
            <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-24" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-transparent">
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800/80 space-y-2 shrink-0">
        {/* Search input */}
        <div className="relative flex items-center bg-gray-100/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-gray-700 transition">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === "ALL"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("UNREAD")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === "UNREAD"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <span>Unread</span>
            {totalUnreadCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeFilter === "UNREAD"
                    ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
                    : "bg-blue-600 text-white dark:bg-blue-500"
                }`}
              >
                {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 scrollbar-thin overscroll-contain">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400 dark:text-gray-600 select-none text-center px-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <MessageSquare className="w-5 h-5 stroke-[1.5]" />
            </div>
            <p className="text-xs">
              {search
                ? "No conversations match your search."
                : activeFilter === "UNREAD"
                ? "No unread messages."
                : "No conversations yet."}
            </p>
          </div>
        ) : (
          filtered.map((conv) => {
            const participant = conv.participant;
            const isActive = pathname === `/chat/${conv.id}`;
            const isOnline = participant ? onlineUsers.has(Number(participant.id)) : false;
            const unread = conv.unreadCount ?? 0;

            const initials = participant?.name
              ? participant.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "?";

            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 group relative ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800/90 text-gray-900 dark:text-white shadow-2xs"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-zinc-900 dark:bg-zinc-100 rounded-r-full" />
                )}

                {/* Avatar + Online Badge */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-200/80 dark:border-gray-700 shadow-2xs">
                    {participant?.profileImage ? (
                      <Image
                        src={participant.profileImage}
                        alt={participant.name ?? "User"}
                        width={44}
                        height={44}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {initials}
                      </span>
                    )}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full ring-1 ring-emerald-400" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`text-sm truncate leading-snug ${
                          unread > 0 || isActive
                            ? "font-semibold text-gray-900 dark:text-white"
                            : "font-medium text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {participant?.name ?? "Unknown"}
                      </span>
                      {participant?.role && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                            participant.role.toUpperCase() === "ALUMNI"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                              : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                          }`}
                        >
                          {participant.role}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 font-normal">
                      {formatTime(conv.lastMessage?.createdAt ?? conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    <p
                      className={`text-xs truncate ${
                        unread > 0
                          ? "font-medium text-gray-900 dark:text-gray-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {conv.lastMessage
                        ? (conv.lastMessage.senderId === currentUserId ? "You: " : "") +
                          truncate(conv.lastMessage.content)
                        : "No messages yet"}
                    </p>
                    {unread > 0 && (
                      <span className="shrink-0 min-w-[18px] h-[18px] px-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-bold rounded-full flex items-center justify-center shadow-2xs">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
