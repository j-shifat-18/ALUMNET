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


export const PostService = {
  createPost,
};
