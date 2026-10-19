import { z } from "zod";

export const sendMentorshipRequestSchema = z.object({
  alumniUid: z.string().min(1),
  message: z.string().min(1).optional(),
});

export const updateAvailabilitySchema = z
  .object({
    isMentorAvailable: z.boolean().optional(),
    availability: z.enum(["Available", "Unavailable"]).optional(),
  })
  .refine(
    (data) => data.isMentorAvailable !== undefined || data.availability !== undefined,
    {
      message: "Either 'isMentorAvailable' (boolean) or 'availability' ('Available' | 'Unavailable') must be provided",
    }
  );

