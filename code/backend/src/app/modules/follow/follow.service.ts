import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const userSelect = {
  id: true,
  uid: true,
  name: true,
  username: true,
  profileImage: true,
  role: true,
  isVerified: true,
  followersCount: true,
  followingCount: true,
} as const;

const followUser = async (followerUid: string, followingUid: string) => {
  if (followerUid === followingUid) {
    throw new AppError(400, "You cannot follow yourself");
  }

  const [follower, following] = await Promise.all([
    prisma.user.findUnique({ where: { uid: followerUid }, select: { id: true } }),
    prisma.user.findUnique({ where: { uid: followingUid }, select: { id: true } }),
  ]);

  if (!follower) throw new AppError(404, "User not found");
  if (!following) throw new AppError(404, "Target user not found");

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: follower.id,
        followingId: following.id,
      },
    },
  });

  if (existing) throw new AppError(409, "You are already following this user");

  await prisma.$transaction([
    prisma.follow.create({
      data: { followerId: follower.id, followingId: following.id },
    }),
    prisma.user.update({
      where: { id: follower.id },
      data: { followingCount: { increment: 1 } },
    }),
    prisma.user.update({
      where: { id: following.id },
      data: { followersCount: { increment: 1 } },
    }),
  ]);
};

const unfollowUser = async (followerUid: string, followingUid: string) => {
  if (followerUid === followingUid) {
    throw new AppError(400, "You cannot unfollow yourself");
  }

  const [follower, following] = await Promise.all([
    prisma.user.findUnique({ where: { uid: followerUid }, select: { id: true } }),
    prisma.user.findUnique({ where: { uid: followingUid }, select: { id: true } }),
  ]);

  if (!follower) throw new AppError(404, "User not found");
  if (!following) throw new AppError(404, "Target user not found");

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: follower.id,
        followingId: following.id,
      },
    },
  });

  if (!existing) throw new AppError(404, "You are not following this user");

  await prisma.$transaction([
    prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: following.id,
        },
      },
    }),
    prisma.user.update({
      where: { id: follower.id },
      data: { followingCount: { decrement: 1 } },
    }),
    prisma.user.update({
      where: { id: following.id },
      data: { followersCount: { decrement: 1 } },
    }),
  ]);
};

const getFollowers = async (uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const followers = await prisma.follow.findMany({
    where: { followingId: user.id },
    include: { follower: { select: userSelect } },
    orderBy: { createdAt: "desc" },
  });

  return followers.map((f) => f.follower);
};

const getFollowing = async (uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const following = await prisma.follow.findMany({
    where: { followerId: user.id },
    include: { following: { select: userSelect } },
    orderBy: { createdAt: "desc" },
  });

  return following.map((f) => f.following);
};

const getFollowStatus = async (followerUid: string, followingUid: string) => {
  const [follower, following] = await Promise.all([
    prisma.user.findUnique({ where: { uid: followerUid }, select: { id: true } }),
    prisma.user.findUnique({ where: { uid: followingUid }, select: { id: true } }),
  ]);

  if (!follower || !following) throw new AppError(404, "User not found");

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: follower.id,
        followingId: following.id,
      },
    },
  });

  return { isFollowing: !!follow };
};

export const FollowService = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
};
