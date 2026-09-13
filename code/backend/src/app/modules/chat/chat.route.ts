import express from "express";
import { ChatController } from "./chat.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createConversationSchema } from "./chat.validation.js";

const router = express.Router();

// POST   /api/v1/conversations                          — create or get direct conversation
router.post(
  "/",
  auth,
  validateRequest(createConversationSchema),
  ChatController.createOrGetConversation,
);

// GET    /api/v1/conversations                          — list all conversations for current user
router.get("/", auth, ChatController.getConversations);

// GET    /api/v1/conversations/:conversationId          — get a single conversation (must be member)
router.get("/:conversationId", auth, ChatController.getConversationById);

// GET    /api/v1/conversations/:conversationId/messages — paginated messages (?limit&cursor)
router.get(
  "/:conversationId/messages",
  auth,
  ChatController.getMessages,
);

// PATCH  /api/v1/conversations/:conversationId/read     — mark conversation as read
router.patch("/:conversationId/read", auth, ChatController.markAsRead);

export const ChatRoutes = router;
