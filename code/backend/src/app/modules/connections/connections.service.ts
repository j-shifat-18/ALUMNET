import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const userSelect = {
  id: true,
  uid: true,
  name: true,
  username: true,
  profileImage: true,
  bio: true,
  role: true,
  isVerified: true,
  isMentorAvailable: true,
  followersCount: true,
  followingCount: true,
} as const;

const getSuggestedPeople = async (uid: string, limit: number) => {
  const currentUser = await prisma.user.findUnique({
    where: { uid },
    select: {
      id: true,
      role: true,
      studentProfile: { select: { skills: true, interestedDomains: true, department: true } },
      alumniProfile: { select: { skills: true, interestedDomains: true, expertiseAreas: true, department: true } },
      following: { select: { followingId: true } },
    },
  });

  if (!currentUser) throw new AppError(404, "User not found");

  const alreadyFollowingIds = currentUser.following.map((f) => f.followingId);
  const excludeIds = [...alreadyFollowingIds, currentUser.id];

  const currentSkills =
    currentUser.studentProfile?.skills ??
    currentUser.alumniProfile?.skills ??
    [];

  const currentDomains =
    currentUser.studentProfile?.interestedDomains ??
    currentUser.alumniProfile?.interestedDomains ??
    [];

  const currentDepartment =
    currentUser.studentProfile?.department ??
    currentUser.alumniProfile?.department ??
    null;

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: excludeIds },
      status: "ACTIVE",
      role: { not: "USER" },
    },
    select: {
      ...userSelect,
      studentProfile: { select: { skills: true, interestedDomains: true, department: true } },
      alumniProfile: {
        select: {
          skills: true,
          interestedDomains: true,
          expertiseAreas: true,
          mentorshipDomains: true,
          department: true,
          currentCompany: true,
          currentPosition: true,
        },
      },
    },
    take: limit * 5,
    orderBy: { followersCount: "desc" },
  });

  const scored = candidates.map((candidate) => {
    const theirSkills =
      candidate.studentProfile?.skills ??
      candidate.alumniProfile?.skills ??
      [];

    const theirDomains = [
      ...(candidate.studentProfile?.interestedDomains ?? []),
      ...(candidate.alumniProfile?.interestedDomains ?? []),
      ...(candidate.alumniProfile?.expertiseAreas ?? []),
      ...(candidate.alumniProfile?.mentorshipDomains ?? []),
    ];

    const theirDepartment =
      candidate.studentProfile?.department ??
      candidate.alumniProfile?.department ??
      null;

    let score = 0;

    const commonSkills = currentSkills.filter((s) => theirSkills.includes(s));
    score += commonSkills.length * 3;

    const commonDomains = currentDomains.filter((d) => theirDomains.includes(d));
    score += commonDomains.length * 2;

    if (currentDepartment && theirDepartment === currentDepartment) {
      score += 2;
    }

    if (candidate.isVerified) score += 1;
    if (candidate.isMentorAvailable) score += 1;

    return { ...candidate, matchScore: score };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, limit).map(({ studentProfile, alumniProfile, ...user }) => ({
    ...user,
    currentPosition: alumniProfile?.currentPosition ?? null,
    currentCompany: alumniProfile?.currentCompany ?? null,
    department:
      studentProfile?.department ?? alumniProfile?.department ?? null,
  }));
};

const getConnectionsPage = async (uid: string) => {
  const currentUser = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!currentUser) throw new AppError(404, "User not found");

  const [followingData, followersData] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: currentUser.id },
      include: { following: { select: userSelect } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.follow.findMany({
      where: { followingId: currentUser.id },
      include: { follower: { select: userSelect } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const followingIds = new Set(followingData.map((f) => f.followingId));

  const following = followingData.map((f) => f.following);

  const followers = followersData.map((f) => ({
    ...f.follower,
    followsYouBack: followingIds.has(f.follower.id),
  }));

  return {
    following,
    followers,
    followingCount: following.length,
    followersCount: followers.length,
  };
};

export const ConnectionsService = {
  getSuggestedPeople,
  getConnectionsPage,
};
