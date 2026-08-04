import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const userSelect = {
  id: true,
  uid: true,
  name: true,
  profileImage: true,
  role: true,
} as const;

const addComment = async (uid: string, postId: number, content: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: { content, userId: user.id, postId },
      include: { user: { select: userSelect } },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    }),
  ]);

  return comment;
};

const getPostComments = async (postId: number) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { user: { select: userSelect } },
    orderBy: { createdAt: "asc" },
  });

  return comments;
};

const updateComment = async (id: number, uid: string, content: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new AppError(404, "Comment not found");

  if (comment.userId !== user.id) {
    throw new AppError(403, "You can only edit your own comments");
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: { content },
    include: { user: { select: userSelect } },
  });

  return updated;
};

const deleteComment = async (id: number, uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new AppError(404, "Comment not found");

  if (comment.userId !== user.id && user.role !== "ADMIN") {
    throw new AppError(403, "You can only delete your own comments");
  }

  await prisma.$transaction([
    prisma.comment.delete({ where: { id } }),
    prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    }),
  ]);
};

export const CommentService = {
  addComment,
  getPostComments,
  updateComment,
  deleteComment,
};
