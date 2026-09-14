import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { getIO } from "../../../socket/io.js";
import { Prisma } from "../../../../generated/prisma/client.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType =
  | "MESSAGE"
  | "MENTOR_REQUEST"
  | "MENTOR_REQUEST_ACCEPTED"
  | "POST_LIKE"
  | "POST_COMMENT"
  | "EVENT_CREATED"
  | "SYSTEM";

interface CreateNotificationInput {
  userId: number;           // recipient DB id
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

// ─── createNotification ───────────────────────────────────────────────────────

/**
 * Central notification factory.
 *
 * 1. Saves the notification record to PostgreSQL.
 * 2. Emits a real-time "notification" event to the recipient's personal
 *    socket room (`user:{userId}`) so the frontend bell updates instantly.
 * 3. Returns the created record.
 *
 * This is the ONLY function other services/sockets should call to create
 * notifications — never write to the Notification table directly from
 * controllers or socket handlers.
 */
const createNotification = async (input: CreateNotificationInput) => {
  const { userId, type, title, message, data } = input;

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      // Prisma requires Prisma.JsonNull sentinel for nullable JSON columns
      data: data !== undefined ? (data as Prisma.InputJsonValue) : Prisma.JsonNull,
      isRead: false,
    },
  });

  // Real-time delivery — fire and forget (don't await, don't throw if io isn't ready)
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit("notification", notification);
  } catch {
    // Socket.IO not initialised (e.g. during tests) — safe to ignore
  }

  return notification;
};

// ─── getNotifications ─────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

/**
 * Returns paginated notifications for the current user, newest first.
 * Supports cursor-based pagination via `cursor` (notification id).
 */
const getNotifications = async (
  userId: number,
  limit: number = PAGE_SIZE,
  cursor?: string,
) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor
      ? { cursor: { id: cursor }, skip: 1 }
      : {}),
  });

  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, limit) : notifications;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { notifications: items, nextCursor, hasMore };
};

// ─── getUnreadCount ───────────────────────────────────────────────────────────

const getUnreadCount = async (userId: number) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return count;
};

// ─── markAsRead ───────────────────────────────────────────────────────────────

const markAsRead = async (notificationId: string, userId: number) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw new AppError(404, "Notification not found");

  // Guard: users may only mark their own notifications
  if (notification.userId !== userId) {
    throw new AppError(403, "You cannot modify this notification");
  }

  if (notification.isRead) return notification; // already read — no-op

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

// ─── markAllAsRead ────────────────────────────────────────────────────────────

const markAllAsRead = async (userId: number) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { updatedCount: result.count };
};

// ─── deleteNotification ───────────────────────────────────────────────────────

const deleteNotification = async (notificationId: string, userId: number) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw new AppError(404, "Notification not found");
  if (notification.userId !== userId) {
    throw new AppError(403, "You cannot delete this notification");
  }

  await prisma.notification.delete({ where: { id: notificationId } });
  return { deleted: true };
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const NotificationService = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
