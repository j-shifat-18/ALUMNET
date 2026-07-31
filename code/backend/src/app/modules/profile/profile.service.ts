import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

interface StudentProfileInput {
  department: string;
  program: string;
  batch: string;
  careerGoal?: string | null;
  interestedDomains?: string[];
  skills?: string[];
  currentCompany?: string | null;
  currentPosition?: string | null;
  resumeUrl?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  certifications?: string[];
  achievements?: string[];
}

interface AlumniProfileInput {
  department: string;
  program: string;
  batch: string;
  graduationYear: number;
  currentCompany?: string | null;
  currentPosition?: string | null;
  industry?: string | null;
  experienceYears?: number | null;
  interestedDomains?: string[];
  skills?: string[];
  expertiseAreas?: string[];
  education?: string | null;
  certifications?: string[];
  achievements?: string[];
  resumeUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  personalWebsite?: string | null;
  mentorshipDomains?: string[];
}

interface AdminProfileInput {
  designation?: string | null;
  permissions?: string[];
}

interface UpdateProfilePayload {
  name?: string;
  username?: string;
  gender?: string | null;
  contactNo?: string | null;
  bio?: string | null;
  location?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  isMentorAvailable?: boolean;
  role?: "STUDENT" | "ALUMNI" | "ADMIN";
  studentProfile?: StudentProfileInput;
  alumniProfile?: AlumniProfileInput;
  adminProfile?: AdminProfileInput;
}

const getProfile = async (uid: string) => {
  const result = await prisma.user.findUnique({
    where: { uid },
    include: {
      studentProfile: true,
      alumniProfile: true,
      adminProfile: true,
    },
  });

  if (!result) {
    throw new AppError(404, "User not found");
  }

  return result;
};

const updateProfile = async (uid: string, requestingUid: string, payload: UpdateProfilePayload) => {
  if (uid !== requestingUid) {
    throw new AppError(403, "You can only update your own profile");
  }

  const user = await prisma.user.findUnique({
    where: { uid },
    select: { role: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const { role, studentProfile, alumniProfile, adminProfile, ...userData } = payload;

  const updateData: Record<string, unknown> = { ...userData };

  if (role === "STUDENT" && studentProfile) {
    updateData.role = "STUDENT";
    updateData.studentProfile = {
      upsert: {
        create: studentProfile,
        update: studentProfile,
      },
    };
  }

  if (role === "ALUMNI" && alumniProfile) {
    updateData.role = "ALUMNI";
    updateData.alumniProfile = {
      upsert: {
        create: alumniProfile,
        update: alumniProfile,
      },
    };
  }

  if (role === "ADMIN" && adminProfile) {
    updateData.role = "ADMIN";
    updateData.adminProfile = {
      update: adminProfile,
    };
  }

  const result = await prisma.user.update({
    where: { uid },
    data: updateData,
    include: {
      studentProfile: true,
      alumniProfile: true,
      adminProfile: true,
    },
  });

  return result;
};

export const ProfileService = {
  getProfile,
  updateProfile,
};
