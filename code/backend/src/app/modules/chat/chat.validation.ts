import { z } from "zod";

export const createConversationSchema = z.object({
  participantId: z
    .number()
    .int()
    .positive("participantId must be a positive integer"),
});

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters")
    .transform((s) => s.trim()),
});
