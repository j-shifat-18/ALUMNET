"use client";

import { useSocket } from "@/context/SocketProvider";

/**
 * OnlineStatus
 *
 * Shows a green dot + "Online" or a grey dot + "Offline" for a given userId.
 * userId is the integer DB id (User.id).
 */
export default function OnlineStatus({ userId, className = "" }) {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.has(userId);

  return (
    <span className={`flex items-center gap-1.5 text-xs ${className}`}>
      <span
        className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
          isOnline
            ? "bg-green-500"
            : "bg-gray-300 dark:bg-gray-600"
        }`}
      />
      <span
        className={
          isOnline
            ? "text-green-600 dark:text-green-400"
            : "text-gray-400 dark:text-gray-500"
        }
      >
        {isOnline ? "Online" : "Offline"}
      </span>
    </span>
  );
}
