import type { Server } from "socket.io";
import type { AuthenticatedSocket } from "./socket.middleware.js";
import { prisma } from "../app/config/prisma.js";
import {
  userConnected,
  userDisconnected,
  isUserOnline,
  getOnlineUserIds,
} from "./presence.service.js";

// ─── Rate limiter (sliding-window, in-memory) ─────────────────────────────────
// Allows at most MAX_MESSAGES per WINDOW_MS per socket.

const MAX_MESSAGES = 20;
const WINDOW_MS = 10_000; // 10 seconds

const messageTimestamps = new Map<string, number[]>();

function isRateLimited(socketId: string): boolean {
  const now = Date.now();
  const timestamps = messageTimestamps.get(socketId) ?? [];

  // Keep only timestamps within the current window
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  messageTimestamps.set(socketId, recent);

  return recent.length > MAX_MESSAGES;
}

function cleanupRateLimit(socketId: string): void {
  messageTimestamps.delete(socketId);
}

// ─── Room helpers ─────────────────────────────────────────────────────────────

const userRoom = (userId: number) => `user:${userId}`;
const conversationRoom = (conversationId: string) =>
  `conversation:${conversationId}`;

// ─── Register all chat socket event handlers ──────────────────────────────────

export function registerChatHandlers(io: Server): void {
  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { id: userId, name } = socket.data.user;

    // ── Join the user's personal room (for notifications, DMs, presence) ──
    socket.join(userRoom(userId));

    // ── Presence: mark online ─────────────────────────────────────────────
    const justCameOnline = userConnected(userId, socket.id);

    // Send the full list of currently online users to THIS socket so it can
    // seed its local presence state immediately, without waiting for future
    // user_online events. This fixes the "user shows offline even though
    // they're already connected" problem.
    socket.emit("online_users_list", { userIds: getOnlineUserIds() });

    if (justCameOnline) {
      // Broadcast to everyone else that this user is online.
      socket.broadcast.emit("user_online", { userId });
    }

    console.log(`[socket] connected  uid=${userId} name=${name} sid=${socket.id}`);

    // ─────────────────────────────────────────────────────────────────────────
    // join_conversation
    // Client emits when it opens a conversation view.
    // ─────────────────────────────────────────────────────────────────────────
    socket.on("join_conversation", async ({ conversationId }: { conversationId: string }) => {
      try {
        if (!conversationId) return;

        // Security: verify the user is a member before allowing room join
        const membership = await prisma.conversationMember.findUnique({
          where: {
            conversationId_userId: { conversationId, userId },
          },
        });

        if (!membership) {
          socket.emit("message_error", {
            code: "NOT_CONVERSATION_MEMBER",
            message: "You are not a member of this conversation.",
          });
          return;
        }

        socket.join(conversationRoom(conversationId));
      } catch (err) {
        console.error("[socket] join_conversation error:", err);
        socket.emit("message_error", {
          code: "SERVER_ERROR",
          message: "Could not join conversation.",
        });
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // leave_conversation
    // Client emits when it navigates away from a conversation.
    // ─────────────────────────────────────────────────────────────────────────
    socket.on("leave_conversation", ({ conversationId }: { conversationId: string }) => {
      if (conversationId) {
        socket.leave(conversationRoom(conversationId));
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // send_message
    // Core message flow: validate → save to DB → emit to room → notify.
    // senderId is ALWAYS taken from socket.data.user — never from the payload.
    // ─────────────────────────────────────────────────────────────────────────
    socket.on(
      "send_message",
      async ({ conversationId, content }: { conversationId: string; content: string }) => {
        try {
          // ── Rate limiting ──────────────────────────────────────────────
          if (isRateLimited(socket.id)) {
            socket.emit("message_error", {
              code: "RATE_LIMITED",
              message: "You are sending messages too fast. Please slow down.",
            });
            return;
          }

          // ── Content validation ─────────────────────────────────────────
          if (!content || typeof content !== "string") {
            socket.emit("message_error", {
              code: "INVALID_CONTENT",
              message: "Message content is required.",
            });
            return;
          }

          const trimmed = content.trim();

          if (trimmed.length === 0) {
            socket.emit("message_error", {
              code: "INVALID_CONTENT",
              message: "Message cannot be empty.",
            });
            return;
          }

          if (trimmed.length > 2000) {
            socket.emit("message_error", {
              code: "INVALID_CONTENT",
              message: "Message cannot exceed 2000 characters.",
            });
            return;
          }

          // ── Membership check ───────────────────────────────────────────
          const membership = await prisma.conversationMember.findUnique({
            where: {
              conversationId_userId: { conversationId, userId },
            },
          });

          if (!membership) {
            socket.emit("message_error", {
              code: "NOT_CONVERSATION_MEMBER",
              message: "You are not a member of this conversation.",
            });
            return;
          }

          // ── Persist message to PostgreSQL (source of truth) ────────────
          const message = await prisma.message.create({
            data: {
              conversationId,
              senderId: userId,
              content: trimmed,
              messageType: "TEXT",
            },
            select: {
              id: true,
              conversationId: true,
              senderId: true,
              content: true,
              messageType: true,
              createdAt: true,
              updatedAt: true,
              sender: {
                select: {
                  id: true,
                  uid: true,
                  name: true,
                  username: true,
                  profileImage: true,
                  isVerified: true,
                },
              },
            },
          });

          // ── Update conversation.updatedAt ──────────────────────────────
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });

          // ── Broadcast new_message to everyone in the conversation room ──
          // This reaches both sender and recipient if both are in the room.
          io.to(conversationRoom(conversationId)).emit("new_message", message);

          // ── Notify the recipient(s) if they are not in this conversation room ──
          // Find all members except the sender
          const otherMembers = await prisma.conversationMember.findMany({
            where: {
              conversationId,
              userId: { not: userId },
            },
            select: { userId: true },
          });

          for (const member of otherMembers) {
            // Check if the recipient is currently in the conversation room.
            // If they are, they already received new_message — no extra notification needed here.
            // We still emit user_online status for UI purposes.
            // Notification creation will be handled in Module 3's notification service.
            // For now we emit a lightweight "message_notification" to their personal room
            // so the frontend can update the unread badge without a full notification record.
            const recipientSockets = await io
              .in(userRoom(member.userId))
              .fetchSockets();

            const isInConversationRoom = recipientSockets.some((s) =>
              s.rooms.has(conversationRoom(conversationId)),
            );

            if (!isInConversationRoom) {
              // Recipient is online but NOT in the conversation view — send a ping
              // to their personal room so the UI can show an unread badge.
              io.to(userRoom(member.userId)).emit("message_notification", {
                conversationId,
                message: {
                  id: message.id,
                  content: message.content,
                  senderId: message.senderId,
                  createdAt: message.createdAt,
                },
                sender: message.sender,
              });
            }
          }
        } catch (err) {
          console.error("[socket] send_message error:", err);
          socket.emit("message_error", {
            code: "SERVER_ERROR",
            message: "Failed to send message. Please try again.",
          });
        }
      },
    );

    // ─────────────────────────────────────────────────────────────────────────
    // typing_start / typing_stop
    // Pure real-time — never touches the database.
    // ─────────────────────────────────────────────────────────────────────────
    socket.on("typing_start", ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return;
      socket.to(conversationRoom(conversationId)).emit("user_typing", {
        userId,
        conversationId,
      });
    });

    socket.on("typing_stop", ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return;
      socket.to(conversationRoom(conversationId)).emit("user_stopped_typing", {
        userId,
        conversationId,
      });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // message_read
    // Updates lastReadAt and notifies the other members in the conversation.
    // ─────────────────────────────────────────────────────────────────────────
    socket.on("message_read", async ({ conversationId }: { conversationId: string }) => {
      try {
        if (!conversationId) return;

        const membership = await prisma.conversationMember.findUnique({
          where: {
            conversationId_userId: { conversationId, userId },
          },
        });

        if (!membership) return;

        const readAt = new Date();

        await prisma.conversationMember.update({
          where: {
            conversationId_userId: { conversationId, userId },
          },
          data: { lastReadAt: readAt },
        });

        // Notify the other members in the conversation room
        socket.to(conversationRoom(conversationId)).emit("messages_read", {
          conversationId,
          userId,
          readAt: readAt.toISOString(),
        });
      } catch (err) {
        console.error("[socket] message_read error:", err);
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // disconnect
    // ─────────────────────────────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      cleanupRateLimit(socket.id);

      const wentOffline = userDisconnected(userId, socket.id);

      if (wentOffline) {
        // Broadcast to everyone that this user is offline
        socket.broadcast.emit("user_offline", { userId });
      }

      console.log(
        `[socket] disconnected uid=${userId} sid=${socket.id} reason=${reason}`,
      );
    });
  });
}

// ─── Utility: check if a user is currently online ────────────────────────────
// Exported so REST controllers can call it if needed (e.g. online-status endpoint).
export { isUserOnline };
