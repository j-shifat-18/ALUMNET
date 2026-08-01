import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

interface CreatePostInput {
  content: string;
  imageUrl?: string | null;
}

interface UpdatePostInput {
  content?: string;
  imageUrl?: string | null;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

const authorSelect = {
  id: true,
  uid: true,
  name: true,
  profileImage: true,
  role: true,
} as const;

const createPost = async (uid: string, payload: CreatePostInput) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const result = await prisma.post.create({
    data: {
      content: payload.content,
      imageUrl: payload.imageUrl,
      authorId: user.id,
    },
    include: {
      author: { select: authorSelect },
    },
  });

  return result;
};

const getUserPosts = async (uid: string, options: PaginationOptions) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id },
      skip,
      take: limit,
      include: {
        author: { select: authorSelect },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count({ where: { authorId: user.id } }),
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

const getAllPosts = async (options: PaginationOptions) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      include: {
        author: { select: authorSelect },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count(),
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

const getSinglePost = async (id: number) => {
  const result = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: authorSelect },
      comments: {
        include: {
          user: { select: authorSelect },
        },
        orderBy: { createdAt: "asc" },
      },
      likes: {
        include: {
          user: {
            select: {
              id: true,
              uid: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(404, "Post not found");
  }

  return result;
};

const updatePost = async (id: number, uid: string, payload: UpdatePostInput) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (post.authorId !== user.id && user.role !== "ADMIN") {
    throw new AppError(403, "You can only edit your own posts");
  }

  const result = await prisma.post.update({
    where: { id },
    data: payload,
    include: {
      author: { select: authorSelect },
    },
  });

  return result;
};

const deletePost = async (id: number, uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (post.authorId !== user.id && user.role !== "ADMIN") {
    throw new AppError(403, "You can only delete your own posts");
  }

  const result = await prisma.post.delete({ where: { id } });

  return result;
};

export const PostService = {
  createPost,
  getAllPosts,
  getUserPosts,
  getSinglePost,
  updatePost,
  deletePost,
};
