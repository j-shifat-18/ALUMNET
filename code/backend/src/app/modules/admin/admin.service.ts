import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const getStats = async () => {
  const [
    totalUsers,
    totalPosts,
    totalComments,
    totalMentorships,
    activeMentorships,
    usersByRole,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.mentorshipRequest.count(),
    prisma.mentorshipRequest.count({ where: { status: "ACCEPTED" } }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
  ]);

  return {
    totalUsers,
    totalPosts,
    totalComments,
    totalMentorships,
    activeMentorships,
    usersByRole: usersByRole.map((r) => ({
      role: r.role,
      count: r._count.role,
    })),
  };
};

const verifyUser = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
    select: { id: true, uid: true, name: true, role: true, isVerified: true },
  });
};

const banUser = async (adminUid: string, userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");
  if (user.role === "ADMIN") throw new AppError(400, "Cannot ban another admin");

  const admin = await prisma.user.findUnique({
    where: { uid: adminUid },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status: "BANNED" },
    }),
    prisma.adminProfile.updateMany({
      where: { userId: admin!.id },
      data: { bannedUsersCount: { increment: 1 } },
    }),
  ]);

  return { id: userId, status: "BANNED" };
};

const suspendUser = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");
  if (user.role === "ADMIN") throw new AppError(400, "Cannot suspend another admin");

  return prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
    select: { id: true, uid: true, name: true, status: true },
  });
};

const activateUser = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
    select: { id: true, uid: true, name: true, status: true },
  });
};

const removePost = async (adminUid: string, postId: number) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const admin = await prisma.user.findUnique({
    where: { uid: adminUid },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.post.delete({ where: { id: postId } }),
    prisma.adminProfile.updateMany({
      where: { userId: admin!.id },
      data: { managedReports: { increment: 1 } },
    }),
  ]);
};

const removeComment = async (adminUid: string, commentId: number) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(404, "Comment not found");

  const admin = await prisma.user.findUnique({
    where: { uid: adminUid },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.comment.delete({ where: { id: commentId } }),
    prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    }),
    prisma.adminProfile.updateMany({
      where: { userId: admin!.id },
      data: { managedReports: { increment: 1 } },
    }),
  ]);
};

export const AdminService = {
  getStats,
  verifyUser,
  banUser,
  suspendUser,
  activateUser,
  removePost,
  removeComment,
};
