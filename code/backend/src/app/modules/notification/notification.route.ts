import express from "express";
import { NotificationController } from "./notification.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router();

// ── GET  /api/v1/notifications                          — list (paginated)
router.get("/", auth, NotificationController.getNotifications);

// ── GET  /api/v1/notifications/unread-count             — unread badge count
// Must be registered BEFORE /:notificationId routes so Express doesn't
// try to match "unread-count" as a notification id.
router.get("/unread-count", auth, NotificationController.getUnreadCount);

// ── PATCH /api/v1/notifications/read-all               — mark all read
router.patch("/read-all", auth, NotificationController.markAllAsRead);

// ── PATCH /api/v1/notifications/:notificationId/read   — mark single read
router.patch("/:notificationId/read", auth, NotificationController.markAsRead);

// ── DELETE /api/v1/notifications/:notificationId       — delete one
router.delete("/:notificationId", auth, NotificationController.deleteNotification);

export const NotificationRoutes = router;
