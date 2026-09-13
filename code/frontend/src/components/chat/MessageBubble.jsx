"use client";

import Image from "next/image";
import { Check, CheckCheck } from "lucide-react";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * MessageBubble
 *
 * Props:
 *   message   — full message object (id, content, senderId, createdAt, sender)
 *   isOwn     — boolean, true if current user sent this message
 *   showAvatar — boolean, true when this is the first message in a sender run
 */
export default function MessageBubble({ message, isOwn, showAvatar }) {
  const avatar = message.sender?.profileImage;
  const initials = message.sender?.name
    ? message.sender.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className={`flex items-end gap-2.5 group my-0.5 ${
        isOwn ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar — shown on the receiver's side */}
      <div className="w-8 h-8 flex-shrink-0">
        {!isOwn && (
          showAvatar ? (
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-xs border border-gray-200/80 dark:border-gray-700/80">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={message.sender?.name ?? "User"}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {initials}
                </span>
              )}
            </div>
          ) : (
            <div className="w-8" />
          )
        )}
      </div>

      {/* Bubble + timestamp */}
      <div
        className={`flex flex-col gap-1 max-w-[82%] sm:max-w-[70%] md:max-w-[62%] ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs transition-all ${
            isOwn
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-br-xs font-normal"
              : "bg-white dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 border border-gray-200/80 dark:border-gray-700/80 rounded-bl-xs"
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp and delivery indicator */}
        <div
          className={`flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 px-1 select-none transition-opacity duration-150 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span title="Delivered">
              <Check className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

