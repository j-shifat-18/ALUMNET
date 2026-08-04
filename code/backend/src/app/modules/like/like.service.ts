import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const toggleLike = async (uid: string, postId: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.postLike.delete({
        where: { userId_postId: { userId: user.id, postId } },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);

    return { liked: false };
  }

  await prisma.$transaction([
    prisma.postLike.create({
      data: { userId: user.id, postId },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    }),
  ]);

  return { liked: true };
};

const getPostLikes = async (postId: number) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const likes = await prisma.postLike.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          uid: true,
          name: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return likes;
};

const getLikeStatus = async (uid: string, postId: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const like = await prisma.postLike.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  return { liked: !!like, likesCount: post.likesCount };
};

export const LikeService = {
  toggleLike,
  getPostLikes,
  getLikeStatus,
};
