import { z } from "zod";

const workModeSchema = z.enum(["REMOTE", "IN_PERSON", "Remote", "In-person"]);

export const createExperienceSchema = z
  .object({
    company: z.string().min(1, "Company is required"),
    position: z.string().min(1, "Position is required"),
    startDate: z.string().min(1, "Start date is required"),
    currentlyWorking: z.boolean(),
    endDate: z.string().nullable().optional(),
    workMode: workModeSchema.default("IN_PERSON"),
    workplaceName: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate startDate format
    if (isNaN(Date.parse(data.startDate))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Start date must be a valid date string",
      });
    }

    // Rule 1: End date is required if not currently working
    if (!data.currentlyWorking) {
      if (!data.endDate || data.endDate.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date is required when not currently working",
        });
      }
    }

    // Rule 2: If endDate is provided, check format and validate it cannot be before startDate
    if (data.endDate && data.endDate.trim() !== "") {
      if (isNaN(Date.parse(data.endDate))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date must be a valid date string",
        });
      } else if (!isNaN(Date.parse(data.startDate))) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (end < start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message: "End date cannot be earlier than start date",
          });
        }
      }
    }

    // Rule 3: Workplace name is required for in-person jobs
    const normalizedMode = data.workMode?.toUpperCase().replace("-", "_");
    if (normalizedMode === "IN_PERSON") {
      if (!data.workplaceName || data.workplaceName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["workplaceName"],
          message: "Workplace name is required for in-person jobs",
        });
      }
    }
  });

export const updateExperienceSchema = z
  .object({
    company: z.string().min(1).optional(),
    position: z.string().min(1).optional(),
    startDate: z.string().optional(),
    currentlyWorking: z.boolean().optional(),
    endDate: z.string().nullable().optional(),
    workMode: workModeSchema.optional(),
    workplaceName: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && isNaN(Date.parse(data.startDate))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Start date must be a valid date string",
      });
    }

    if (data.endDate && isNaN(Date.parse(data.endDate))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be a valid date string",
      });
    }

    if (data.currentlyWorking === false && data.endDate === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date cannot be null when not currently working",
      });
    }

    if (
      data.endDate &&
      data.startDate &&
      !isNaN(Date.parse(data.startDate)) &&
      !isNaN(Date.parse(data.endDate))
    ) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date cannot be earlier than start date",
        });
      }
    }

    if (data.workMode) {
      const normalizedMode = data.workMode.toUpperCase().replace("-", "_");
      if (normalizedMode === "IN_PERSON" && data.workplaceName !== undefined) {
        if (!data.workplaceName || data.workplaceName.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["workplaceName"],
            message: "Workplace name is required for in-person jobs",
          });
        }
      }
    }
  });
