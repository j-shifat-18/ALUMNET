"use client";

import Image from "next/image";

/**
 * TypingIndicator
 *
 * Renders a modern floating typing bubble.
 * typingUsers is a Set of userIds. We show the participant's avatar/name if available.
 */
export default function TypingIndicator({ typingUsers, participants }) {
  if (!typingUsers || typingUsers.size === 0) return null;

  // Resolve the first typing user's info if available
  const typingId = [...typingUsers][0];
  const p = participants?.find(
    (m) => Number(m.userId) === Number(typingId) || Number(m.user?.id) === Number(typingId)
  );
  const name = p?.user?.name ? p.user.name.split(" ")[0] : "Someone";
  const avatar = p?.user?.profileImage;
  const initials = p?.user?.name
    ? p.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="flex items-end gap-2 px-4 py-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
      {/* Mini avatar */}
      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-200/60 dark:border-gray-700/60">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={24}
            height={24}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
            {initials}
          </span>
        )}
      </div>

      {/* Typing Bubble */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/70 rounded-2xl rounded-bl-xs text-xs text-gray-600 dark:text-gray-300 shadow-xs">
        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          {name} is typing
        </span>
        <span className="flex gap-1 items-center pl-1">
          <span
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "1s" }}
          />
          <span
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "200ms", animationDuration: "1s" }}
          />
          <span
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "400ms", animationDuration: "1s" }}
          />
        </span>
      </div>
    </div>
  );
}

