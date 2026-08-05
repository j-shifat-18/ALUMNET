import { z } from "zod";

export const sendMentorshipRequestSchema = z.object({
  alumniUid: z.string().min(1),
  message: z.string().min(1).optional(),
});
