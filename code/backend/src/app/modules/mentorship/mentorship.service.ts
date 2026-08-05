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
} as const;

const sendRequest = async (
  studentUid: string,
  alumniUid: string,
  message?: string
) => {
  const [student, alumni] = await Promise.all([
    prisma.user.findUnique({
      where: { uid: studentUid },
      select: { id: true, role: true },
    }),
    prisma.user.findUnique({
      where: { uid: alumniUid },
      select: { id: true, role: true },
    }),
  ]);

  if (!student) throw new AppError(404, "Student user not found");
  if (!alumni) throw new AppError(404, "Alumni user not found");

  if (student.role !== "STUDENT") {
    throw new AppError(403, "Only students can send mentorship requests");
  }

  if (alumni.role !== "ALUMNI") {
    throw new AppError(400, "Mentorship requests can only be sent to alumni");
  }

  const existing = await prisma.mentorshipRequest.findUnique({
    where: {
      studentId_alumniId: { studentId: student.id, alumniId: alumni.id },
    },
  });

  if (existing) {
    throw new AppError(409, "A mentorship request already exists with this alumni");
  }

  const result = await prisma.mentorshipRequest.create({
    data: {
      studentId: student.id,
      alumniId: alumni.id,
      message,
    },
    include: {
      student: { select: userSelect },
      alumni: { select: userSelect },
    },
  });

  return result;
};

const getSentRequests = async (uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const requests = await prisma.mentorshipRequest.findMany({
    where: { studentId: user.id },
    include: { alumni: { select: userSelect } },
    orderBy: { createdAt: "desc" },
  });

  return requests;
};

const getReceivedRequests = async (uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const requests = await prisma.mentorshipRequest.findMany({
    where: { alumniId: user.id },
    include: { student: { select: userSelect } },
    orderBy: { createdAt: "desc" },
  });

  return requests;
};

const acceptRequest = async (id: number, uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const request = await prisma.mentorshipRequest.findUnique({ where: { id } });

  if (!request) throw new AppError(404, "Mentorship request not found");

  if (request.alumniId !== user.id) {
    throw new AppError(403, "You can only accept requests sent to you");
  }

  if (request.status !== "PENDING") {
    throw new AppError(400, `Request is already ${request.status.toLowerCase()}`);
  }

  const [updated] = await prisma.$transaction([
    prisma.mentorshipRequest.update({
      where: { id },
      data: { status: "ACCEPTED" },
      include: {
        student: { select: userSelect },
        alumni: { select: userSelect },
      },
    }),
    prisma.alumniProfile.updateMany({
      where: { userId: user.id },
      data: { totalMentees: { increment: 1 } },
    }),
  ]);

  return updated;
};

const rejectRequest = async (id: number, uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const request = await prisma.mentorshipRequest.findUnique({ where: { id } });

  if (!request) throw new AppError(404, "Mentorship request not found");

  if (request.alumniId !== user.id) {
    throw new AppError(403, "You can only reject requests sent to you");
  }

  if (request.status !== "PENDING") {
    throw new AppError(400, `Request is already ${request.status.toLowerCase()}`);
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: "REJECTED" },
    include: {
      student: { select: userSelect },
      alumni: { select: userSelect },
    },
  });

  return updated;
};

const getMentors = async (uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const requests = await prisma.mentorshipRequest.findMany({
    where: { studentId: user.id, status: "ACCEPTED" },
    include: {
      alumni: {
        select: {
          ...userSelect,
          alumniProfile: {
            select: {
              currentCompany: true,
              currentPosition: true,
              expertiseAreas: true,
              mentorshipDomains: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return requests.map((r) => ({ requestId: r.id, mentor: r.alumni }));
};

const getMentees = async (uid: string) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const requests = await prisma.mentorshipRequest.findMany({
    where: { alumniId: user.id, status: "ACCEPTED" },
    include: {
      student: {
        select: {
          ...userSelect,
          studentProfile: {
            select: {
              department: true,
              batch: true,
              careerGoal: true,
              skills: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return requests.map((r) => ({ requestId: r.id, mentee: r.student }));
};

export const MentorshipService = {
  sendRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  getMentors,
  getMentees,
};
