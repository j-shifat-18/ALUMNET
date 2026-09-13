"use client";

import Image from "next/image";

function formatTime(dateStr) {
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
      className={`flex items-end gap-2 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar — shown once per sender run on the OTHER side only */}
      <div className="w-7 h-7 flex-shrink-0">
        {!isOwn && showAvatar && (
          <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {avatar ? (
              <Image
                src={avatar}
                alt={message.sender?.name ?? "User"}
                width={28}
                height={28}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {initials}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bubble + timestamp */}
      <div
        className={`flex flex-col gap-0.5 max-w-[72%] ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
            isOwn
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-br-sm"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm"
          }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
