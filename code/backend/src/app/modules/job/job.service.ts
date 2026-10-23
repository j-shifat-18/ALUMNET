import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { NotificationService } from "../notification/notification.service.js";
import {
  CreateJobInput,
  UpdateJobInput,
  JobFilterQuery,
} from "./job.interface.js";
import { Prisma } from "../../../../generated/prisma/client.js";

const posterSelect = {
  id: true,
  uid: true,
  name: true,
  username: true,
  profileImage: true,
  role: true,
  alumniProfile: {
    select: {
      currentCompany: true,
      currentPosition: true,
      batch: true,
      department: true,
    },
  },
  studentProfile: {
    select: {
      batch: true,
      department: true,
    },
  },
} as const;

const commentUserSelect = {
  id: true,
  uid: true,
  name: true,
  username: true,
  profileImage: true,
  role: true,
} as const;

export const getDepartmentTerms = (department: string): string[] => {
  const trimmed = department.trim();
  const lower = trimmed.toLowerCase();

  const acronymMap: Record<string, string[]> = {
    cse: ["Computer Science and Engineering", "Computer Science & Engineering", "Computer Science", "CSE"],
    swe: ["Software Engineering", "Software", "SWE"],
    eee: ["Electrical and Electronic Engineering", "Electrical & Electronic Engineering", "Electrical Engineering", "EEE"],
    me: ["Mechanical Engineering", "ME"],
    mce: ["Mechanical and Chemical Engineering", "Mechanical & Chemical Engineering", "MCE"],
    cee: ["Civil and Environmental Engineering", "Civil & Environmental Engineering", "Civil Engineering", "CEE", "CE"],
    btm: ["Business Technology Management", "BTM"],
    bba: ["Business Administration", "BBA"],
  };

  return acronymMap[lower] || [trimmed];
};

const createJob = async (uid: string, payload: CreateJobInput) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const job = await prisma.jobPost.create({
    data: {
      posterId: user.id,
      title: payload.title,
      company: payload.company,
      location: payload.location,
      workMode: payload.workMode ?? "IN_PERSON",
      jobType: payload.jobType ?? "FULL_TIME",
      department: payload.department,
      skills: payload.skills ?? [],
      description: payload.description,
      requirements: payload.requirements,
      salaryRange: payload.salaryRange,
      applicationUrl: payload.applicationUrl,
      deadline: payload.deadline ? new Date(payload.deadline) : null,
    },
    include: {
      poster: {
        select: posterSelect,
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return job;
};

const getAllJobs = async (query: JobFilterQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const whereConditions: Prisma.JobPostWhereInput[] = [];

  // Search filter across title, company, description, or skills
  if (query.search && query.search.trim() !== "") {
    const term = query.search.trim();
    whereConditions.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { company: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { skills: { has: term } },
      ],
    });
  }

  // Department filter with acronym expansion (CSE, SWE, EEE, etc.)
  if (query.department && query.department.trim() !== "") {
    const deptTerms = getDepartmentTerms(query.department);
    whereConditions.push({
      OR: deptTerms.map((dept) => ({
        department: { contains: dept, mode: "insensitive" },
      })),
    });
  }

  // JobType filter
  if (query.jobType) {
    whereConditions.push({ jobType: query.jobType });
  }

  // WorkMode filter
  if (query.workMode) {
    whereConditions.push({ workMode: query.workMode });
  }

  const where: Prisma.JobPostWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  const [jobs, total] = await Promise.all([
    prisma.jobPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        poster: {
          select: posterSelect,
        },
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.jobPost.count({ where }),
  ]);

  return {
    data: jobs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getJobById = async (id: number) => {
  const job = await prisma.jobPost.findUnique({
    where: { id },
    include: {
      poster: {
        select: posterSelect,
      },
      comments: {
        include: {
          user: {
            select: commentUserSelect,
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!job) {
    throw new AppError(404, "Job post not found");
  }

  return job;
};

const getMyJobs = async (uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const jobs = await prisma.jobPost.findMany({
    where: { posterId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  return jobs;
};

const updateJob = async (uid: string, id: number, payload: UpdateJobInput) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const existingJob = await prisma.jobPost.findUnique({
    where: { id },
    select: { posterId: true },
  });

  if (!existingJob) {
    throw new AppError(404, "Job post not found");
  }

  if (existingJob.posterId !== user.id && user.role !== "ADMIN") {
    throw new AppError(403, "You are not authorized to update this job post");
  }

  const updated = await prisma.jobPost.update({
    where: { id },
    data: {
      title: payload.title,
      company: payload.company,
      location: payload.location,
      workMode: payload.workMode,
      jobType: payload.jobType,
      department: payload.department,
      skills: payload.skills,
      description: payload.description,
      requirements: payload.requirements,
      salaryRange: payload.salaryRange,
      applicationUrl: payload.applicationUrl,
      deadline:
        payload.deadline !== undefined
          ? payload.deadline
            ? new Date(payload.deadline)
            : null
          : undefined,
    },
    include: {
      poster: {
        select: posterSelect,
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return updated;
};

const deleteJob = async (uid: string, id: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const existingJob = await prisma.jobPost.findUnique({
    where: { id },
    select: { posterId: true },
  });

  if (!existingJob) {
    throw new AppError(404, "Job post not found");
  }

  if (existingJob.posterId !== user.id && user.role !== "ADMIN") {
    throw new AppError(403, "You are not authorized to delete this job post");
  }

  await prisma.jobPost.delete({
    where: { id },
  });

  return { message: "Job post deleted successfully" };
};

const addComment = async (uid: string, jobId: number, content: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, name: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const job = await prisma.jobPost.findUnique({
    where: { id: jobId },
    select: { id: true, title: true, posterId: true },
  });

  if (!job) {
    throw new AppError(404, "Job post not found");
  }

  const comment = await prisma.jobComment.create({
    data: {
      jobId,
      userId: user.id,
      content,
    },
    include: {
      user: {
        select: commentUserSelect,
      },
    },
  });

  // Notify job poster if commenter is someone else
  if (job.posterId !== user.id) {
    NotificationService.createNotification({
      userId: job.posterId,
      type: "JOB_COMMENT",
      title: `New question on your job post`,
      message: `${user.name} commented on "${job.title}": "${
        content.length > 50 ? content.slice(0, 50) + "…" : content
      }"`,
      data: { jobId, commentId: comment.id, commenterId: user.id },
    }).catch(() => {});
  }

  return comment;
};

const deleteComment = async (uid: string, commentId: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const comment = await prisma.jobComment.findUnique({
    where: { id: commentId },
    include: {
      job: {
        select: { posterId: true },
      },
    },
  });

  if (!comment) {
    throw new AppError(404, "Comment not found");
  }

  // Either comment author, job post owner, or ADMIN can delete the comment
  const isAuthor = comment.userId === user.id;
  const isJobOwner = comment.job.posterId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isAuthor && !isJobOwner && !isAdmin) {
    throw new AppError(403, "You are not authorized to delete this comment");
  }

  await prisma.jobComment.delete({
    where: { id: commentId },
  });

  return { message: "Comment deleted successfully" };
};

export const JobService = {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  addComment,
  deleteComment,
};
