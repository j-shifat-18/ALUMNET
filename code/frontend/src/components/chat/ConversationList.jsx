"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { useState } from "react";
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

function truncate(str, max = 40) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/**
 * ConversationList
 *
 * Left-panel sidebar listing all conversations, ordered by most recent.
 * Shows participant name, avatar, last message preview, unread count, and online status.
 */
export default function ConversationList({ conversations, loading, currentUserId }) {
  const pathname = usePathname();
  const { onlineUsers } = useSocket();
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const name = c.participant?.name ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400 dark:text-gray-600">
            <MessageSquare className="w-6 h-6" />
            <p className="text-xs text-center px-4">
              {search ? "No conversations match your search." : "No conversations yet."}
            </p>
          </div>
        ) : (
          filtered.map((conv) => {
            const participant = conv.participant;
            const isActive = pathname === `/chat/${conv.id}`;
            const isOnline = participant ? onlineUsers.has(participant.id) : false;
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
                className={`flex items-center gap-3 px-3 py-3 transition-colors ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                }`}
              >
                {/* Avatar + online dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {participant?.profileImage ? (
                      <Image
                        src={participant.profileImage}
                        alt={participant.name ?? "User"}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {initials}
                      </span>
                    )}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  )}
                </div>

                {/* Name + last message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span
                      className={`text-sm truncate ${
                        unread > 0
                          ? "font-semibold text-gray-900 dark:text-white"
                          : "font-medium text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {participant?.name ?? "Unknown"}
                    </span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                      {formatTime(conv.lastMessage?.createdAt ?? conv.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p
                      className={`text-xs truncate ${
                        unread > 0
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {conv.lastMessage
                        ? (conv.lastMessage.senderId === currentUserId ? "You: " : "") +
                          truncate(conv.lastMessage.content)
                        : "No messages yet"}
                    </p>
                    {unread > 0 && (
                      <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold rounded-full flex items-center justify-center">
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
