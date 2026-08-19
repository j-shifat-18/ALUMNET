import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const getUser = async (uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });
  if (!user) throw new AppError(404, "User not found");
  return user;
};

// ── Certifications ────────────────────────────────────────────────────────────

const addCertification = async (uid: string, data: {
  title: string;
  issuedBy: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  imageUrl?: string | null;
  description?: string | null;
}) => {
  const user = await getUser(uid);

  return prisma.certification.create({
    data: {
      userId: user.id,
      title: data.title,
      issuedBy: data.issuedBy,
      issueDate: new Date(data.issueDate),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      credentialId: data.credentialId ?? null,
      credentialUrl: data.credentialUrl ?? null,
      imageUrl: data.imageUrl ?? null,
      description: data.description ?? null,
    },
  });
};

const getUserCertifications = async (uid: string) => {
  const user = await getUser(uid);

  return prisma.certification.findMany({
    where: { userId: user.id },
    orderBy: { issueDate: "desc" },
  });
};

const updateCertification = async (uid: string, id: number, data: {
  title?: string;
  issuedBy?: string;
  issueDate?: string;
  expiryDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  imageUrl?: string | null;
  description?: string | null;
}) => {
  const user = await getUser(uid);

  const cert = await prisma.certification.findUnique({ where: { id } });
  if (!cert) throw new AppError(404, "Certification not found");
  if (cert.userId !== user.id) throw new AppError(403, "You can only edit your own certifications");

  return prisma.certification.update({
    where: { id },
    data: {
      ...data,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      expiryDate:
        data.expiryDate === null ? null
        : data.expiryDate ? new Date(data.expiryDate)
        : undefined,
    },
  });
};

const deleteCertification = async (uid: string, id: number) => {
  const user = await getUser(uid);

  const cert = await prisma.certification.findUnique({ where: { id } });
  if (!cert) throw new AppError(404, "Certification not found");
  if (cert.userId !== user.id) throw new AppError(403, "You can only delete your own certifications");

  await prisma.certification.delete({ where: { id } });
};

// ── Achievements ──────────────────────────────────────────────────────────────

const addAchievement = async (uid: string, data: {
  title: string;
  issuedBy?: string | null;
  date?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  achievementUrl?: string | null;
}) => {
  const user = await getUser(uid);

  return prisma.achievement.create({
    data: {
      userId: user.id,
      title: data.title,
      issuedBy: data.issuedBy ?? null,
      date: data.date ? new Date(data.date) : null,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      achievementUrl: data.achievementUrl ?? null,
    },
  });
};

const getUserAchievements = async (uid: string) => {
  const user = await getUser(uid);

  return prisma.achievement.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });
};

const updateAchievement = async (uid: string, id: number, data: {
  title?: string;
  issuedBy?: string | null;
  date?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  achievementUrl?: string | null;
}) => {
  const user = await getUser(uid);

  const ach = await prisma.achievement.findUnique({ where: { id } });
  if (!ach) throw new AppError(404, "Achievement not found");
  if (ach.userId !== user.id) throw new AppError(403, "You can only edit your own achievements");

  return prisma.achievement.update({
    where: { id },
    data: {
      ...data,
      date:
        data.date === null ? null
        : data.date ? new Date(data.date)
        : undefined,
    },
  });
};

const deleteAchievement = async (uid: string, id: number) => {
  const user = await getUser(uid);

  const ach = await prisma.achievement.findUnique({ where: { id } });
  if (!ach) throw new AppError(404, "Achievement not found");
  if (ach.userId !== user.id) throw new AppError(403, "You can only delete your own achievements");

  await prisma.achievement.delete({ where: { id } });
};

export const CredentialService = {
  addCertification,
  getUserCertifications,
  updateCertification,
  deleteCertification,
  addAchievement,
  getUserAchievements,
  updateAchievement,
  deleteAchievement,
};
