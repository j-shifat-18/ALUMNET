import { z } from "zod";

export const createCertificationSchema = z.object({
  title: z.string().min(1),
  issuedBy: z.string().min(1),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional().nullable(),
  credentialId: z.string().optional().nullable(),
  credentialUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateCertificationSchema = z.object({
  title: z.string().min(1).optional(),
  issuedBy: z.string().min(1).optional(),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional().nullable(),
  credentialId: z.string().optional().nullable(),
  credentialUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const createAchievementSchema = z.object({
  title: z.string().min(1),
  issuedBy: z.string().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  achievementUrl: z.string().url().optional().nullable(),
});

export const updateAchievementSchema = z.object({
  title: z.string().min(1).optional(),
  issuedBy: z.string().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  achievementUrl: z.string().url().optional().nullable(),
});
