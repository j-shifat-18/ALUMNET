"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Handshake,
  GraduationCap,
  Heart,
  MessageCircle,
  Calendar,
  Bell,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  getNotificationLink,
  formatRelativeTime,
  parseNotificationData,
} from "@/lib/notificationHelpers";

/**
 * Returns icon, colors, and badge label depending on notification type.
 */
function getNotificationVisuals(type) {
  switch (type) {
    case "MESSAGE":
      return {
        icon: <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        bgColor: "bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-800/60",
        badge: "Message",
      };
    case "MENTOR_REQUEST":
      return {
        icon: <Handshake className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        bgColor: "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-800/60",
        badge: "Mentorship",
      };
    case "MENTOR_REQUEST_ACCEPTED":
      return {
        icon: <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        bgColor: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-800/60",
        badge: "Accepted",
      };
    case "POST_LIKE":
      return {
        icon: <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400 fill-rose-500/20" />,
        bgColor: "bg-rose-50 dark:bg-rose-950/50 border-rose-200/60 dark:border-rose-800/60",
        badge: "Like",
      };
    case "POST_COMMENT":
      return {
        icon: <MessageCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
        bgColor: "bg-sky-50 dark:bg-sky-950/50 border-sky-200/60 dark:border-sky-800/60",
        badge: "Comment",
      };
    case "EVENT_CREATED":
      return {
        icon: <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        bgColor: "bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-800/60",
        badge: "Event",
      };
    case "SYSTEM":
    default:
      return {
        icon: <Bell className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />,
        bgColor: "bg-gray-100 dark:bg-gray-800 border-gray-200/60 dark:border-gray-700/60",
        badge: "System",
      };
  }
}

/**
 * Normalizes title and message to always put user/profile names first.
 */
function formatNotificationContent({ type, title, message }) {
  let displayTitle = title;
  let displayMessage = message;

  if (type === "POST_LIKE") {
    if (message && message.toLowerCase().includes("liked your post")) {
      displayTitle = message;
      displayMessage = "Liked your post";
    } else if (title && title.toLowerCase().includes("someone liked your post")) {
      displayTitle = message || "Someone liked your post";
      displayMessage = "Liked your post";
    }
  } else if (type === "MESSAGE") {
    if (title && title.toLowerCase().startsWith("new message from ")) {
      const name = title.replace(/new message from /i, "").trim();
      displayTitle = `${name} sent you a message`;
    }
  } else if (type === "POST_COMMENT") {
    if (title && title.toLowerCase().startsWith("new comment on your post") && message) {
      const match = message.match(/^(.+?)\s+commented:\s*"(.*)"$/);
      if (match) {
        displayTitle = `${match[1]} commented on your post`;
        displayMessage = `"${match[2]}"`;
      }
    }
  } else if (type === "MENTOR_REQUEST") {
    if (title === "New Mentorship Request" && message) {
      displayTitle = message;
      displayMessage = "Sent you a mentorship request";
    }
  } else if (type === "MENTOR_REQUEST_ACCEPTED") {
    if (title === "Mentorship Request Accepted" && message) {
      displayTitle = message;
      displayMessage = "Accepted your mentorship request";
    }
  }

  return { displayTitle, displayMessage };
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onCloseDropdown,
  compact = false,
}) {
  const router = useRouter();
  const { id, type, title, message, isRead, createdAt } = notification;
  const visuals = getNotificationVisuals(type);
  const timeStr = formatRelativeTime(createdAt);
  const { displayTitle, displayMessage } = formatNotificationContent({
    type,
    title,
    message,
  });

  const handleClick = (e) => {
    // Avoid triggering if clicked on inner action buttons
    if (e.target.closest("button[data-action]")) return;

    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id);
    }
    if (onCloseDropdown) {
      onCloseDropdown();
    }
    const link = getNotificationLink(notification);
    router.push(link);

    // Trigger instant feed refresh so the targeted post and comments load fresh data
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("refresh-feed"));
    }

    // If already on the same page, ensure instant smooth scroll to the target post
    const parsed = parseNotificationData(notification?.data);
    if (
      parsed?.postId &&
      (notification.type === "POST_LIKE" || notification.type === "POST_COMMENT")
    ) {
      setTimeout(() => {
        const el = document.getElementById(`post-${parsed.postId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const handleMarkReadClick = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e);
        }
      }}
      className={`group relative flex items-start gap-3 transition-all duration-150 text-left cursor-pointer select-none rounded-xl ${
        compact ? "p-2.5 sm:p-3" : "p-3.5 sm:p-4 border shadow-2xs"
      } ${
        !isRead
          ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 border-blue-200/60 dark:border-blue-900/40"
          : "bg-white dark:bg-gray-900/80 hover:bg-gray-50 dark:hover:bg-gray-800/60 border-gray-200/70 dark:border-gray-800/80"
      }`}
    >
      {/* Icon Badge */}
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${visuals.bgColor}`}
      >
        {visuals.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4
              className={`text-xs sm:text-sm truncate ${
                !isRead
                  ? "font-bold text-gray-900 dark:text-white"
                  : "font-semibold text-gray-800 dark:text-gray-200"
              }`}
            >
              {displayTitle}
            </h4>
            <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50 shrink-0">
              {visuals.badge}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 font-medium">
            {timeStr}
          </span>
        </div>

        <p
          className={`text-xs line-clamp-2 leading-relaxed ${
            !isRead
              ? "text-gray-700 dark:text-gray-300 font-medium"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {displayMessage}
        </p>

        {/* Action button bar */}
        <div className="flex items-center justify-between mt-1.5 pt-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View details</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </span>

          <div className="flex items-center gap-1 ml-auto">
            {!isRead && (
              <button
                type="button"
                data-action="mark-read"
                onClick={handleMarkReadClick}
                title="Mark as read"
                className="p-1 rounded-md text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                data-action="delete"
                onClick={handleDeleteClick}
                title="Delete notification"
                className="p-1 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition opacity-0 group-hover:opacity-100 sm:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Blue unread dot indicator */}
      {!isRead && (
        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 shrink-0 self-center shadow-xs animate-pulse" />
      )}
    </div>
  );
}
