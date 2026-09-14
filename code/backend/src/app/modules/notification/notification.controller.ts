import { Request, Response } from "express";
import { NotificationService } from "./notification.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

// ─── Shared helper ────────────────────────────────────────────────────────────

async function getCurrentDbUser(uid: string) {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });
  if (!user) throw new AppError(404, "Authenticated user not found");
  return user;
}

// ─── GET /api/v1/notifications ────────────────────────────────────────────────

const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentDbUser(req.user.uid);

  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const cursor = req.query.cursor as string | undefined;

  const result = await NotificationService.getNotifications(user.id, limit, cursor);

  sendResponse(res, {
    statusCode: 200,
    message: "Notifications retrieved successfully",
    data: result,
  });
});

// ─── GET /api/v1/notifications/unread-count ───────────────────────────────────

const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentDbUser(req.user.uid);

  const count = await NotificationService.getUnreadCount(user.id);

  sendResponse(res, {
    statusCode: 200,
    message: "Unread count retrieved",
    data: { count },
  });
});

// ─── PATCH /api/v1/notifications/read-all ────────────────────────────────────

const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentDbUser(req.user.uid);

  const result = await NotificationService.markAllAsRead(user.id);

  sendResponse(res, {
    statusCode: 200,
    message: "All notifications marked as read",
    data: result,
  });
});

// ─── PATCH /api/v1/notifications/:notificationId/read ────────────────────────

const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentDbUser(req.user.uid);
  const notificationId = req.params.notificationId as string;

  const result = await NotificationService.markAsRead(notificationId, user.id);

  sendResponse(res, {
    statusCode: 200,
    message: "Notification marked as read",
    data: result,
  });
});

// ─── DELETE /api/v1/notifications/:notificationId ────────────────────────────

const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentDbUser(req.user.uid);
  const notificationId = req.params.notificationId as string;

  const result = await NotificationService.deleteNotification(notificationId, user.id);

  sendResponse(res, {
    statusCode: 200,
    message: "Notification deleted",
    data: result,
  });
});

export const NotificationController = {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  deleteNotification,
};
