import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { Prisma } from "../../../../generated/prisma/client.js";

interface PaginationOptions {
  page: number;
  limit: number;
}

const getAllUsers = async (options: PaginationOptions) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      include: {
        studentProfile: true,
        alumniProfile: true,
        adminProfile: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
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

const createUser = async (payload: Prisma.UserCreateInput) => {
  const result = await prisma.user.create({
    data: payload,
  });

  return result;
};

const getSingleUser = async (uid: string) => {
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

const updateUser = async (uid: string, requestingUid: string, payload: Prisma.UserUpdateInput) => {
  if (uid !== requestingUid) {
    throw new AppError(403, "You can only update your own account");
  }

  const user = await prisma.user.findUnique({ where: { uid } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const result = await prisma.user.update({
    where: { uid },
    data: payload,
  });

  return result;
};

const deleteUser = async (uid: string, requestingUid: string) => {
  if (uid !== requestingUid) {
    throw new AppError(403, "You can only delete your own account");
  }

  const user = await prisma.user.findUnique({ where: { uid } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const result = await prisma.user.delete({
    where: { uid },
  });

  return result;
};

export const UserService = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
