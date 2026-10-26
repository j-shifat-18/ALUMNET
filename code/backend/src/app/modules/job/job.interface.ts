import { JobType, WorkMode } from "../../../../generated/prisma/client.js";

export interface CreateJobInput {
  title: string;
  company: string;
  location?: string | null;
  workMode?: WorkMode;
  jobType?: JobType;
  departments?: string[];
  skills?: string[];
  description: string;
  requirements?: string | null;
  salaryRange?: string | null;
  applicationUrl?: string | null;
  deadline?: string | null;
}

export interface UpdateJobInput {
  title?: string;
  company?: string;
  location?: string | null;
  workMode?: WorkMode;
  jobType?: JobType;
  departments?: string[];
  skills?: string[];
  description?: string;
  requirements?: string | null;
  salaryRange?: string | null;
  applicationUrl?: string | null;
  deadline?: string | null;
}

export interface JobFilterQuery {
  search?: string;
  department?: string;
  jobType?: JobType;
  workMode?: WorkMode;
  page?: number;
  limit?: number;
}

export interface CreateCommentInput {
  content: string;
}
