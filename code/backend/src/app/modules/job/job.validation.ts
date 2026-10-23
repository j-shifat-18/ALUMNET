import { z } from "zod";

const workModeEnum = z.enum(["REMOTE", "IN_PERSON", "HYBRID"]);
const jobTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "RESEARCH",
  "REFERRAL",
  "CONTRACT",
]);

export const createJobSchema = z.object({
  title: z.string().trim().min(1, "Job title is required"),
  company: z.string().trim().min(1, "Company name is required"),
  location: z.string().trim().optional().nullable(),
  workMode: workModeEnum.default("IN_PERSON"),
  jobType: jobTypeEnum.default("FULL_TIME"),
  department: z.string().trim().optional().nullable(),
  skills: z.array(z.string().trim()).default([]),
  description: z.string().trim().min(1, "Job description is required"),
  requirements: z.string().trim().optional().nullable(),
  salaryRange: z.string().trim().optional().nullable(),
  applicationUrl: z.string().trim().optional().nullable(),
  deadline: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Deadline must be a valid date string"
    ),
});

export const updateJobSchema = z.object({
  title: z.string().trim().min(1).optional(),
  company: z.string().trim().min(1).optional(),
  location: z.string().trim().optional().nullable(),
  workMode: workModeEnum.optional(),
  jobType: jobTypeEnum.optional(),
  department: z.string().trim().optional().nullable(),
  skills: z.array(z.string().trim()).optional(),
  description: z.string().trim().min(1).optional(),
  requirements: z.string().trim().optional().nullable(),
  salaryRange: z.string().trim().optional().nullable(),
  applicationUrl: z.string().trim().optional().nullable(),
  deadline: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Deadline must be a valid date string"
    ),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content cannot be empty"),
});
