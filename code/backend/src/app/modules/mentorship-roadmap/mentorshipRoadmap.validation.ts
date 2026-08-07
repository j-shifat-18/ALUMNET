import { z } from "zod";

export const createSessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  isCompleted: z.boolean().optional(),
  dueDate: z.string().datetime().optional().nullable(),
});
