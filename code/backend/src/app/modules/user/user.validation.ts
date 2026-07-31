import { z } from "zod";

export const createUserSchema = z.object({
  uid: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  username: z.string().optional(),
  profileImage: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  gender: z.string().optional(),
  contactNo: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  profileImage: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
});
