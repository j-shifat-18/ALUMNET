"use client";

import { useSocket } from "@/context/SocketProvider";

/**
 * OnlineStatus
 *
 * Shows an animated green pulse + "Active now" or a grey dot + "Offline" for a given userId.
 * userId is the integer DB id (User.id).
 */
export default function OnlineStatus({ userId, className = "", showText = true }) {
  const { onlineUsers } = useSocket();
  // Coerce to Number to guarantee Set.has() works regardless of whether
  // the prop arrives as a number or a string.
  const isOnline = onlineUsers.has(Number(userId));

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs select-none ${className}`}>
      {isOnline ? (
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      ) : (
        <span className="inline-block h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
      )}
      {showText && (
        <span
          className={
            isOnline
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {isOnline ? "Active now" : "Offline"}
        </span>
      )}
    </span>
  );
}

