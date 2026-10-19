import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const getUser = async (uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });
  if (!user) throw new AppError(404, "User not found");
  return user;
};

const normalizeWorkMode = (mode?: string): "REMOTE" | "IN_PERSON" => {
  if (!mode) return "IN_PERSON";
  const upper = mode.toUpperCase().replace("-", "_");
  return upper === "REMOTE" ? "REMOTE" : "IN_PERSON";
};

interface CreateExperiencePayload {
  company: string;
  position: string;
  startDate: string;
  currentlyWorking: boolean;
  endDate?: string | null;
  workMode?: string;
  workplaceName?: string | null;
  description?: string | null;
}

interface UpdateExperiencePayload {
  company?: string;
  position?: string;
  startDate?: string;
  currentlyWorking?: boolean;
  endDate?: string | null;
  workMode?: string;
  workplaceName?: string | null;
  description?: string | null;
}

const addExperience = async (uid: string, payload: CreateExperiencePayload) => {
  const user = await getUser(uid);

  const mode = normalizeWorkMode(payload.workMode);

  const experience = await prisma.experience.create({
    data: {
      userId: user.id,
      company: payload.company,
      position: payload.position,
      startDate: new Date(payload.startDate),
      currentlyWorking: payload.currentlyWorking,
      endDate: payload.currentlyWorking || !payload.endDate ? null : new Date(payload.endDate),
      workMode: mode,
      workplaceName: mode === "IN_PERSON" ? payload.workplaceName : null,
      description: payload.description ?? null,
    },
  });

  // Sync currentCompany & currentPosition on alumni/student profile if currently working
  if (payload.currentlyWorking) {
    if (user.role === "ALUMNI") {
      await prisma.alumniProfile.updateMany({
        where: { userId: user.id },
        data: {
          currentCompany: payload.company,
          currentPosition: payload.position,
        },
      }).catch(() => {});
    } else if (user.role === "STUDENT") {
      await prisma.studentProfile.updateMany({
        where: { userId: user.id },
        data: {
          currentCompany: payload.company,
          currentPosition: payload.position,
        },
      }).catch(() => {});
    }
  }

  return experience;
};

const getUserExperiences = async (uid: string) => {
  const user = await getUser(uid);

  return prisma.experience.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
  });
};

const getExperienceById = async (id: number) => {
  const experience = await prisma.experience.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          uid: true,
          name: true,
          username: true,
          profileImage: true,
          role: true,
        },
      },
    },
  });

  if (!experience) {
    throw new AppError(404, "Experience not found");
  }

  return experience;
};

const updateExperience = async (uid: string, id: number, payload: UpdateExperiencePayload) => {
  const user = await getUser(uid);

  const existing = await prisma.experience.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "Experience not found");
  }

  if (existing.userId !== user.id) {
    throw new AppError(403, "You can only edit your own experiences");
  }

  const effectiveCurrentlyWorking =
    payload.currentlyWorking !== undefined ? payload.currentlyWorking : existing.currentlyWorking;

  const effectiveWorkMode = payload.workMode
    ? normalizeWorkMode(payload.workMode)
    : existing.workMode;

  const updateData: Record<string, unknown> = {};

  if (payload.company !== undefined) updateData.company = payload.company;
  if (payload.position !== undefined) updateData.position = payload.position;
  if (payload.startDate !== undefined) updateData.startDate = new Date(payload.startDate);
  if (payload.currentlyWorking !== undefined) updateData.currentlyWorking = payload.currentlyWorking;

  if (effectiveCurrentlyWorking) {
    updateData.endDate = null;
  } else if (payload.endDate !== undefined) {
    updateData.endDate = payload.endDate ? new Date(payload.endDate) : null;
  }

  updateData.workMode = effectiveWorkMode;

  if (effectiveWorkMode === "REMOTE") {
    updateData.workplaceName = null;
  } else if (payload.workplaceName !== undefined) {
    updateData.workplaceName = payload.workplaceName;
  }

  if (payload.description !== undefined) {
    updateData.description = payload.description;
  }

  const updated = await prisma.experience.update({
    where: { id },
    data: updateData,
  });

  // Sync profile if updated to currently working
  if (effectiveCurrentlyWorking) {
    const targetCompany = payload.company || existing.company;
    const targetPosition = payload.position || existing.position;
    if (user.role === "ALUMNI") {
      await prisma.alumniProfile.updateMany({
        where: { userId: user.id },
        data: { currentCompany: targetCompany, currentPosition: targetPosition },
      }).catch(() => {});
    } else if (user.role === "STUDENT") {
      await prisma.studentProfile.updateMany({
        where: { userId: user.id },
        data: { currentCompany: targetCompany, currentPosition: targetPosition },
      }).catch(() => {});
    }
  }

  return updated;
};

const deleteExperience = async (uid: string, id: number) => {
  const user = await getUser(uid);

  const existing = await prisma.experience.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "Experience not found");
  }

  if (existing.userId !== user.id) {
    throw new AppError(403, "You can only delete your own experiences");
  }

  await prisma.experience.delete({ where: { id } });

  return { message: "Experience deleted successfully" };
};

export const ExperienceService = {
  addExperience,
  getUserExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
};
