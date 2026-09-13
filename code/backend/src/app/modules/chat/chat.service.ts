import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

// ─── Shared select shapes ────────────────────────────────────────────────────

const userSelect = {
  id: true,
  uid: true,
  name: true,
  username: true,
  profileImage: true,
  isVerified: true,
} as const;

const messageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  content: true,
  messageType: true,
  createdAt: true,
  updatedAt: true,
  sender: { select: userSelect },
} as const;

// ─── createOrGetConversation ─────────────────────────────────────────────────

/**
 * Creates a DIRECT conversation between the current user and a participant,
 * or returns the existing one — preventing duplicate conversations.
 */
const createOrGetConversation = async (
  currentUserId: number,
  participantId: number,
) => {
  if (currentUserId === participantId) {
    throw new AppError(400, "You cannot start a conversation with yourself");
  }

  // Verify the participant exists
  const participant = await prisma.user.findUnique({
    where: { id: participantId },
    select: userSelect,
  });

  if (!participant) {
    throw new AppError(404, "Participant user not found");
  }

  // Look for an existing DIRECT conversation shared by both users.
  // Strategy: find a conversation where BOTH user IDs appear as members.
  const existing = await prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      members: {
        every: {
          userId: { in: [currentUserId, participantId] },
        },
      },
      AND: [
        { members: { some: { userId: currentUserId } } },
        { members: { some: { userId: participantId } } },
      ],
    },
    include: {
      members: {
        include: { user: { select: userSelect } },
      },
    },
  });

  if (existing) {
    return { conversation: existing, created: false };
  }

  // Create a new DIRECT conversation with both users as members
  const conversation = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      members: {
        create: [{ userId: currentUserId }, { userId: participantId }],
      },
    },
    include: {
      members: {
        include: { user: { select: userSelect } },
      },
    },
  });

  return { conversation, created: true };
};

// ─── getConversations ────────────────────────────────────────────────────────

/**
 * Returns all conversations for the current user, enriched with:
 *  - the other participant's profile
 *  - the last message preview
 *  - unread message count
 */
const getConversations = async (currentUserId: number) => {
  const memberships = await prisma.conversationMember.findMany({
    where: { userId: currentUserId },
    include: {
      conversation: {
        include: {
          members: {
            include: { user: { select: userSelect } },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              messageType: true,
            },
          },
        },
      },
    },
    orderBy: {
      conversation: { updatedAt: "desc" },
    },
  });

  // Shape each conversation for the client
  const conversations = await Promise.all(
    memberships.map(async (membership) => {
      const { conversation } = membership;

      // The other participant (for DIRECT conversations)
      const otherMember = conversation.members.find(
        (m) => m.userId !== currentUserId,
      );

      // Count unread messages:
      // messages created after my lastReadAt that were NOT sent by me
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: currentUserId },
          ...(membership.lastReadAt
            ? { createdAt: { gt: membership.lastReadAt } }
            : {}),
        },
      });

      return {
        id: conversation.id,
        type: conversation.type,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        participant: otherMember?.user ?? null,
        lastMessage: conversation.messages[0] ?? null,
        unreadCount,
      };
    }),
  );

  return conversations;
};

// ─── getMessages ─────────────────────────────────────────────────────────────

/**
 * Returns paginated messages for a conversation (cursor-based, newest first).
 * The caller must be a member of the conversation.
 */
const getMessages = async (
  currentUserId: number,
  conversationId: string,
  limit: number = 30,
  cursor?: string,
) => {
  // Verify membership
  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: currentUserId },
    },
  });

  if (!membership) {
    throw new AppError(403, "You are not a member of this conversation");
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit + 1, // fetch one extra to determine if there are more pages
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1, // skip the cursor itself
        }
      : {}),
    select: messageSelect,
  });

  // Determine if there is a next page
  const hasMore = messages.length > limit;
  const items = hasMore ? messages.slice(0, limit) : messages;

  // nextCursor is the id of the last returned item (oldest in this batch)
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return {
    messages: items,
    nextCursor,
    hasMore,
  };
};

// ─── markAsRead ──────────────────────────────────────────────────────────────

/**
 * Updates the current user's lastReadAt timestamp for a conversation,
 * effectively clearing their unread count.
 */
const markAsRead = async (currentUserId: number, conversationId: string) => {
  // Verify the conversation exists
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError(404, "Conversation not found");
  }

  // Verify membership and update lastReadAt
  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: currentUserId },
    },
  });

  if (!membership) {
    throw new AppError(403, "You are not a member of this conversation");
  }

  const updated = await prisma.conversationMember.update({
    where: {
      conversationId_userId: { conversationId, userId: currentUserId },
    },
    data: { lastReadAt: new Date() },
  });

  return updated;
};

// ─── getConversationById ─────────────────────────────────────────────────────

/**
 * Returns a single conversation by ID, verifying the caller is a member.
 */
const getConversationById = async (
  currentUserId: number,
  conversationId: string,
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      members: {
        include: { user: { select: userSelect } },
      },
    },
  });

  if (!conversation) {
    throw new AppError(404, "Conversation not found");
  }

  const isMember = conversation.members.some((m) => m.userId === currentUserId);

  if (!isMember) {
    throw new AppError(403, "You are not a member of this conversation");
  }

  return conversation;
};

export const ChatService = {
  createOrGetConversation,
  getConversations,
  getMessages,
  markAsRead,
  getConversationById,
};
