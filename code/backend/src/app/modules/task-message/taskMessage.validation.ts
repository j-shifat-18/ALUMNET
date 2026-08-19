import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1),
  messageType: z.enum(["COMPLETION", "FEEDBACK", "GENERAL"]).default("GENERAL"),
});
