import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().nullable(),
});
