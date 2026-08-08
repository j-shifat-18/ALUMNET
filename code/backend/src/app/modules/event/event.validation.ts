import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["workshop", "seminar", "networking", "webinar", "other"]),
  date: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  link: z.string().url().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  type: z.enum(["workshop", "seminar", "networking", "webinar", "other"]).optional(),
  date: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
  link: z.string().url().optional().nullable(),
});
