import { Request, Response } from "express";
import { ChatService } from "./chat.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AppError } from "../../errors/AppError.js";

// ─── POST /api/v1/conversations ───────────────────────────────────────────────
// Create or return an existing DIRECT conversation with a participant.

const createOrGetConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUser = await getCurrentDbUser(req.user.uid);
    const { participantId } = req.body;

    const result = await ChatService.createOrGetConversation(
      currentUser.id,
      participantId,
    );

    sendResponse(res, {
      statusCode: result.created ? 201 : 200,
      message: result.created
        ? "Conversation created successfully"
        : "Existing conversation retrieved",
      data: result.conversation,
    });
  },
);

// ─── GET /api/v1/conversations ────────────────────────────────────────────────
// Get all conversations for the authenticated user.

const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = await getCurrentDbUser(req.user.uid);

  const conversations = await ChatService.getConversations(currentUser.id);

  sendResponse(res, {
    statusCode: 200,
    message: "Conversations retrieved successfully",
    data: conversations,
  });
});

// ─── GET /api/v1/conversations/:conversationId ────────────────────────────────
// Get a single conversation by ID (caller must be a member).

const getConversationById = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUser = await getCurrentDbUser(req.user.uid);
    const conversationId = req.params.conversationId as string;

    const conversation = await ChatService.getConversationById(
      currentUser.id,
      conversationId,
    );

    sendResponse(res, {
      statusCode: 200,
      message: "Conversation retrieved successfully",
      data: conversation,
    });
  },
);

// ─── GET /api/v1/conversations/:conversationId/messages ───────────────────────
// Get paginated messages for a conversation. Supports ?limit=30&cursor=<id>

const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = await getCurrentDbUser(req.user.uid);
  const conversationId = req.params.conversationId as string;

  const limit = Math.min(Number(req.query.limit) || 30, 100); // cap at 100
  const cursor = req.query.cursor as string | undefined;

  const result = await ChatService.getMessages(
    currentUser.id,
    conversationId,
    limit,
    cursor,
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Messages retrieved successfully",
    data: result,
  });
});

// ─── PATCH /api/v1/conversations/:conversationId/read ─────────────────────────
// Mark all messages in a conversation as read (updates lastReadAt).

const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = await getCurrentDbUser(req.user.uid);
  const conversationId = req.params.conversationId as string;

  const result = await ChatService.markAsRead(currentUser.id, conversationId);

  sendResponse(res, {
    statusCode: 200,
    message: "Conversation marked as read",
    data: result,
  });
});

// ─── Shared helper ────────────────────────────────────────────────────────────

import { prisma } from "../../config/prisma.js";

/**
 * Resolves a Firebase UID to the database User record.
 * Throws 404 if the user does not exist in the database.
 */
async function getCurrentDbUser(uid: string) {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "Authenticated user not found in database");

  return user;
}

export const ChatController = {
  createOrGetConversation,
  getConversations,
  getConversationById,
  getMessages,
  markAsRead,
};
