import { prisma } from "../../config/prisma.js";

interface AlumniSearchParams {
  name?: string;
  company?: string;
  department?: string;
  jobPosition?: string;
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
  jobPosition?: string;
  page: number;
  limit: number;
}

const getDepartmentTerms = (department: string): string[] => {
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

const searchAlumni = async (params: AlumniSearchParams) => {
  const {
    name,
    company,
    department,
    jobPosition,
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

  const alumniProfileConditions: any[] = [];

  if (company) {
    alumniProfileConditions.push({
      currentCompany: { contains: company, mode: "insensitive" as const },
    });
  }

  if (jobPosition) {
    alumniProfileConditions.push({
      currentPosition: { contains: jobPosition, mode: "insensitive" as const },
    });
  }

  if (department) {
    const terms = getDepartmentTerms(department);
    if (terms.length === 1) {
      alumniProfileConditions.push({
        department: { contains: terms[0], mode: "insensitive" as const },
      });
    } else {
      alumniProfileConditions.push({
        OR: terms.map((term) => ({
          department: { contains: term, mode: "insensitive" as const },
        })),
      });
    }
  }

  if (industry) {
    alumniProfileConditions.push({
      industry: { contains: industry, mode: "insensitive" as const },
    });
  }

  if (batch) alumniProfileConditions.push({ batch });
  if (graduationYear) alumniProfileConditions.push({ graduationYear });
  if (skill) alumniProfileConditions.push({ skills: { has: skill } });
  if (domain) {
    alumniProfileConditions.push({
      OR: [
        { expertiseAreas: { has: domain } },
        { mentorshipDomains: { has: domain } },
        { interestedDomains: { has: domain } },
      ],
    });
  }

  const where: any = {
    role: "ALUMNI" as const,
    ...(mentorAvailable !== undefined && { isMentorAvailable: mentorAvailable }),
    ...(name && {
      name: { contains: name, mode: "insensitive" as const },
    }),
  };

  if (alumniProfileConditions.length === 1) {
    where.alumniProfile = alumniProfileConditions[0];
  } else if (alumniProfileConditions.length > 1) {
    where.alumniProfile = {
      AND: alumniProfileConditions,
    };
  }

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
  const { name, role, department, jobPosition, page, limit } = params;

  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (department) {
    const terms = getDepartmentTerms(department);
    const deptConditions = terms.map((term) => ({
      department: { contains: term, mode: "insensitive" as const },
    }));

    andConditions.push({
      OR: [
        {
          studentProfile: {
            OR: deptConditions,
          },
        },
        {
          alumniProfile: {
            OR: deptConditions,
          },
        },
      ],
    });
  }

  if (jobPosition) {
    andConditions.push({
      OR: [
        {
          studentProfile: {
            currentPosition: { contains: jobPosition, mode: "insensitive" as const },
          },
        },
        {
          alumniProfile: {
            currentPosition: { contains: jobPosition, mode: "insensitive" as const },
          },
        },
      ],
    });
  }

  const where: any = {
    ...(name && {
      name: { contains: name, mode: "insensitive" as const },
    }),
    ...(role && { role: role as any }),
  };

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

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
            currentPosition: true,
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

