"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Check,
  Loader2,
  BellOff,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationProvider";
import NotificationItem from "./NotificationItem";

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("ALL"); // "ALL" | "UNREAD"
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
          isOpen ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" : ""
        }`}
      >
        <Bell className="w-5 h-5 transition-transform group-hover:scale-105" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-sm animate-in zoom-in-50 duration-150">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          {/* Header */}
          <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-1.5 bg-white dark:bg-gray-900">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                filter === "ALL"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("UNREAD")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                filter === "UNREAD"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filter === "UNREAD"
                      ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Body List */}
          <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 scrollbar-thin overscroll-contain">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col gap-2 p-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-28" />
                      <div className="h-2.5 bg-gray-100 dark:bg-gray-800/60 rounded w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-center text-gray-400 dark:text-gray-500 shadow-2xs mb-2.5">
                  <BellOff className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {filter === "UNREAD"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px]">
                  {filter === "UNREAD"
                    ? "You are all caught up on your recent updates."
                    : "You'll see real-time updates for messages, mentorship, and activity here."}
                </p>
              </div>
            ) : (
              filteredNotifications.slice(0, 10).map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onCloseDropdown={() => setIsOpen(false)}
                  compact={true}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/80 rounded-xl transition"
            >
              <span>View all notifications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
