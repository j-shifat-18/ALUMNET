import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const getMatchedMentors = async (uid: string, limit: number) => {
  const currentUser = await prisma.user.findUnique({
    where: { uid },
    select: {
      id: true,
      role: true,
      studentProfile: {
        select: {
          skills: true,
          interestedDomains: true,
          department: true,
          careerGoal: true,
        },
      },
    },
  });

  if (!currentUser) throw new AppError(404, "User not found");
  if (currentUser.role !== "STUDENT") {
    throw new AppError(403, "Mentor matching is only available for students");
  }
  if (!currentUser.studentProfile) {
    throw new AppError(400, "Complete your student profile first to get mentor recommendations");
  }

  const { skills, interestedDomains, department } = currentUser.studentProfile;

  const existingRequestAlumniIds = await prisma.mentorshipRequest.findMany({
    where: { studentId: currentUser.id },
    select: { alumniId: true },
  });
  const alreadyRequestedIds = existingRequestAlumniIds.map((r) => r.alumniId);

  const alumni = await prisma.user.findMany({
    where: {
      role: "ALUMNI",
      isMentorAvailable: true,
      status: "ACTIVE",
      id: { notIn: alreadyRequestedIds },
    },
    select: {
      id: true,
      uid: true,
      name: true,
      username: true,
      profileImage: true,
      bio: true,
      isVerified: true,
      followersCount: true,
      alumniProfile: {
        select: {
          currentCompany: true,
          currentPosition: true,
          industry: true,
          experienceYears: true,
          skills: true,
          expertiseAreas: true,
          mentorshipDomains: true,
          interestedDomains: true,
          department: true,
          totalMentees: true,
        },
      },
    },
  });

  const scored = alumni.map((alumnus) => {
    const p = alumnus.alumniProfile!;
    let score = 0;
    const matchedSkills: string[] = [];
    const matchedDomains: string[] = [];

    skills.forEach((s) => {
      if (p.skills.includes(s)) {
        matchedSkills.push(s);
        score += 3;
      }
    });

    const theirDomains = [
      ...p.expertiseAreas,
      ...p.mentorshipDomains,
      ...p.interestedDomains,
    ];
    interestedDomains.forEach((d) => {
      if (theirDomains.includes(d)) {
        matchedDomains.push(d);
        score += 2;
      }
    });

    if (department && p.department === department) score += 2;
    if (alumnus.isVerified) score += 1;
    if (p.experienceYears && p.experienceYears >= 3) score += 1;

    const totalMatchable = skills.length * 3 + interestedDomains.length * 2 + 4;
    const matchPercentage =
      totalMatchable > 0 ? Math.min(Math.round((score / totalMatchable) * 100), 100) : 0;

    return {
      id: alumnus.id,
      uid: alumnus.uid,
      name: alumnus.name,
      username: alumnus.username,
      profileImage: alumnus.profileImage,
      bio: alumnus.bio,
      isVerified: alumnus.isVerified,
      followersCount: alumnus.followersCount,
      currentCompany: p.currentCompany,
      currentPosition: p.currentPosition,
      industry: p.industry,
      experienceYears: p.experienceYears,
      department: p.department,
      totalMentees: p.totalMentees,
      matchScore: score,
      matchPercentage,
      matchedSkills,
      matchedDomains,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, limit);
};

export const MatchingService = {
  getMatchedMentors,
};
