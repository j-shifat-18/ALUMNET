import { z } from "zod";

const studentProfileSchema = z.object({
  department: z.string().min(1),
  program: z.string().min(1),
  batch: z.string().min(1),
  careerGoal: z.string().optional().nullable(),
  interestedDomains: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  currentCompany: z.string().optional().nullable(),
  currentPosition: z.string().optional().nullable(),
  resumeUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  certifications: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
});

const alumniProfileSchema = z.object({
  department: z.string().min(1),
  program: z.string().min(1),
  batch: z.string().min(1),
  graduationYear: z.number().int(),
  currentCompany: z.string().optional().nullable(),
  currentPosition: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  experienceYears: z.number().int().optional().nullable(),
  interestedDomains: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  expertiseAreas: z.array(z.string()).optional(),
  education: z.string().optional().nullable(),
  certifications: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  resumeUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  personalWebsite: z.string().url().optional().nullable(),
  mentorshipDomains: z.array(z.string()).optional(),
});

const adminProfileSchema = z.object({
  designation: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  gender: z.string().optional().nullable(),
  contactNo: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  profileImage: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  isMentorAvailable: z.boolean().optional(),
  role: z.enum(["STUDENT", "ALUMNI", "ADMIN"]).optional(),
  studentProfile: studentProfileSchema.optional(),
  alumniProfile: alumniProfileSchema.optional(),
  adminProfile: adminProfileSchema.optional(),
});
