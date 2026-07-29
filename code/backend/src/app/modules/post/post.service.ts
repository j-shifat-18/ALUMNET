import { prisma } from "../../config/prisma.js";

const createPost = async (uid: string, payload: { content: string; imageUrl?: string }) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const result = await prisma.post.create({
    data: {
      content: payload.content,
      imageUrl: payload.imageUrl,
      authorId: user.id,
    },
    include: {
      author: {
        select: {
          id: true,
          uid: true,
          name: true,
          profileImage: true,
          role: true,
        }
      }
    }
  });

  return result;
};

const getAllPosts = async () => {
  const result = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          uid: true,
          name: true,
          profileImage: true,
          role: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getSinglePost = async (id: number) => {
  const result = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          uid: true,
          name: true,
          profileImage: true,
          role: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              uid: true,
              name: true,
              profileImage: true,
              role: true,
            }
          }
        },
        orderBy: {
          createdAt: "asc",
        }
      },
      likes: {
        include: {
          user: {
            select: {
              id: true,
              uid: true,
              name: true,
            }
          }
        }
      }
    },
  });

  return result;
};

const updatePost = async (id: number, payload: { content?: string; imageUrl?: string }) => {
  const result = await prisma.post.update({
    where: { id },
    data: payload,
    include: {
      author: {
        select: {
          id: true,
          uid: true,
          name: true,
          profileImage: true,
          role: true,
        }
      }
    }
  });

  return result;
};

const deletePost = async (id: number) => {
  const result = await prisma.post.delete({
    where: { id },
  });

  return result;
};


export const PostService = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
};

