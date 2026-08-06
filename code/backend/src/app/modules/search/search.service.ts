import { prisma } from "../../config/prisma.js";

interface AlumniSearchParams {
  name?: string;
  company?: string;
  department?: string;
  industry?: string;
  skill?: string;
  domain?: string;
  batch?: string;
  graduationYear?: number;
  mentorAvailable?: boolean;
  page: number;
  limit: number;
}

interface UserSearchParams {
  name?: string;
  role?: string;
  department?: string;
  page: number;
  limit: number;
}

const searchAlumni = async (params: AlumniSearchParams) => {
  const {
    name,
    company,
    department,
    industry,
    skill,
    domain,
    batch,
    graduationYear,
    mentorAvailable,
    page,
    limit,
  } = params;

  const skip = (page - 1) * limit;

  const where = {
    role: "ALUMNI" as const,
    ...(mentorAvailable !== undefined && { isMentorAvailable: mentorAvailable }),
    ...(name && {
      name: { contains: name, mode: "insensitive" as const },
    }),
    alumniProfile: {
      ...(company && {
        currentCompany: { contains: company, mode: "insensitive" as const },
      }),
      ...(department && {
        department: { contains: department, mode: "insensitive" as const },
      }),
      ...(industry && {
        industry: { contains: industry, mode: "insensitive" as const },
      }),
      ...(batch && { batch }),
      ...(graduationYear && { graduationYear }),
      ...(skill && { skills: { has: skill } }),
      ...(domain && {
        OR: [
          { expertiseAreas: { has: domain } },
          { mentorshipDomains: { has: domain } },
          { interestedDomains: { has: domain } },
        ],
      }),
    },
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        uid: true,
        name: true,
        username: true,
        profileImage: true,
        bio: true,
        isVerified: true,
        isMentorAvailable: true,
        followersCount: true,
        alumniProfile: {
          select: {
            department: true,
            program: true,
            batch: true,
            graduationYear: true,
            currentCompany: true,
            currentPosition: true,
            industry: true,
            experienceYears: true,
            skills: true,
            expertiseAreas: true,
            mentorshipDomains: true,
          },
        },
      },
      orderBy: { followersCount: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const searchUsers = async (params: UserSearchParams) => {
  const { name, role, department, page, limit } = params;

  const skip = (page - 1) * limit;

  const where = {
    ...(name && {
      name: { contains: name, mode: "insensitive" as const },
    }),
    ...(role && { role: role as any }),
    ...(department && {
      OR: [
        {
          studentProfile: {
            department: { contains: department, mode: "insensitive" as const },
          },
        },
        {
          alumniProfile: {
            department: { contains: department, mode: "insensitive" as const },
          },
        },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        uid: true,
        name: true,
        username: true,
        profileImage: true,
        bio: true,
        role: true,
        isVerified: true,
        isMentorAvailable: true,
        followersCount: true,
        studentProfile: {
          select: {
            department: true,
            batch: true,
            skills: true,
          },
        },
        alumniProfile: {
          select: {
            department: true,
            batch: true,
            currentCompany: true,
            currentPosition: true,
            skills: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const SearchService = {
  searchAlumni,
  searchUsers,
};
