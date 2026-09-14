"use client";

import React, { useState, useMemo } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import { useNotifications } from "@/context/NotificationProvider";
import NotificationItem from "@/components/notifications/NotificationItem";
import {
  Bell,
  CheckCheck,
  Loader2,
  BellOff,
  Filter,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refetch,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState("ALL"); // "ALL" | "UNREAD"

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "UNREAD") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, activeFilter]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 dark:bg-black/95 flex flex-col">
        <Navbar />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 flex-1 flex flex-col">
          <div className="max-w-3xl w-full mx-auto space-y-4 sm:space-y-6">
            {/* Page Header Card */}
            <div className="bg-white dark:bg-gray-900/90 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-xs shrink-0">
                  <Bell className="w-6 h-6 stroke-[1.75]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Notifications
                    </h1>
                    {unreadCount > 0 && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Stay updated on messages, mentorship requests, and platform activity.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => refetch()}
                  title="Refresh notifications"
                  className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAsRead()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl transition shadow-2xs"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs Bar */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-200/80 dark:border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFilter("ALL")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeFilter === "ALL"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  All ({notifications.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter("UNREAD")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeFilter === "UNREAD"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        activeFilter === "UNREAD"
                          ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {filteredNotifications.length > 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Showing {filteredNotifications.length} items
                </span>
              )}
            </div>

            {/* Notification Cards List */}
            <div className="space-y-2.5">
              {loading && notifications.length === 0 ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 flex items-center gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-40" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                /* Empty state */
                <div className="bg-white dark:bg-gray-900/90 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-10 sm:p-14 text-center shadow-sm select-none">
                  <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-center text-gray-400 dark:text-gray-500 mx-auto mb-4 shadow-xs">
                    <BellOff className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {activeFilter === "UNREAD"
                      ? "No unread notifications"
                      : "No notifications yet"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    {activeFilter === "UNREAD"
                      ? "You're all caught up! When you receive new messages, mentorship updates, or alerts, they'll appear here."
                      : "When you receive messages, mentorship requests, event updates, or activity pings, they will be listed here in real time."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    compact={false}
                  />
                ))
              )}
            </div>

            {/* Load More Button */}
            {hasMore && activeFilter === "ALL" && (
              <div className="flex justify-center pt-3 pb-6">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-xl transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading more notifications…</span>
                    </>
                  ) : (
                    <span>Load older notifications</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
