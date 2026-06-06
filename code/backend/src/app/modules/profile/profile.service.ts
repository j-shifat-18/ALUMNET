import { prisma } from "../../config/prisma.js";

const getProfile = async (uid: string) => {
  const result = await prisma.user.findUnique({
    where: {
      uid,
    },
    include: {
      studentProfile: true,
      alumniProfile: true,
      adminProfile: true,
    },
  });

  return result;
};

const updateProfile = async (uid: string, payload: any) => {
  const {
  role,
  studentProfile,
  alumniProfile,
  adminProfile,
  ...userData
} = payload;

  const user = await prisma.user.findUnique({
    where: {
      uid,
    },
    select: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updateData: any = {
    ...userData,
  };

  if (role === "STUDENT" && studentProfile) {
    updateData.studentProfile = {
      upsert: {
        create: studentProfile,
        update: studentProfile,
      },
    };
  }

  if (role === "ALUMNI" && alumniProfile) {
    updateData.alumniProfile = {
      upsert: {
        create: alumniProfile,
        update: alumniProfile,
      },
    };
  }

  if (role === "ADMIN" && adminProfile) {
    updateData.adminProfile = {
      update: adminProfile,
    };
  }

  const result = await prisma.user.update({
    where: {
      uid,
    },
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
