import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const createSession = async (
  uid: string,
  requestId: number,
  title: string,
  description?: string
) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new AppError(404, "Mentorship request not found");
  if (request.status !== "ACCEPTED") {
    throw new AppError(400, "Cannot create sessions for a non-accepted mentorship");
  }
  if (request.alumniId !== user.id) {
    throw new AppError(403, "Only the mentor can create sessions");
  }

  const session = await prisma.mentorshipSession.create({
    data: { mentorshipRequestId: requestId, title, description },
    include: { tasks: true },
  });

  return session;
};

const getSessions = async (uid: string, requestId: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new AppError(404, "Mentorship request not found");

  if (request.studentId !== user.id && request.alumniId !== user.id) {
    throw new AppError(403, "You are not part of this mentorship");
  }

  const sessions = await prisma.mentorshipSession.findMany({
    where: { mentorshipRequestId: requestId },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return sessions;
};

const createTask = async (
  uid: string,
  sessionId: number,
  data: { title: string; description?: string; dueDate?: string }
) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const session = await prisma.mentorshipSession.findUnique({
    where: { id: sessionId },
    include: { mentorshipRequest: true },
  });

  if (!session) throw new AppError(404, "Session not found");

  if (session.mentorshipRequest.alumniId !== user.id) {
    throw new AppError(403, "Only the mentor can add tasks");
  }

  const task = await prisma.mentorshipTask.create({
    data: {
      sessionId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });

  return task;
};

const updateTask = async (
  uid: string,
  taskId: number,
  data: {
    title?: string;
    description?: string;
    isCompleted?: boolean;
    dueDate?: string | null;
  }
) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const task = await prisma.mentorshipTask.findUnique({
    where: { id: taskId },
    include: {
      session: { include: { mentorshipRequest: true } },
    },
  });

  if (!task) throw new AppError(404, "Task not found");

  const { alumniId, studentId } = task.session.mentorshipRequest;
  const isMentor = alumniId === user.id;
  const isMentee = studentId === user.id;

  if (!isMentor && !isMentee) {
    throw new AppError(403, "You are not part of this mentorship");
  }

  // mentee can only mark tasks complete/incomplete, mentor can edit everything
  if (isMentee && !isMentor) {
    const allowed = Object.keys(data).every((k) => k === "isCompleted");
    if (!allowed) {
      throw new AppError(403, "Mentees can only mark tasks as complete or incomplete");
    }
  }

  const updated = await prisma.mentorshipTask.update({
    where: { id: taskId },
    data: {
      ...data,
      dueDate:
        data.dueDate === null
          ? null
          : data.dueDate
          ? new Date(data.dueDate)
          : undefined,
    },
  });

  return updated;
};

const deleteTask = async (uid: string, taskId: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const task = await prisma.mentorshipTask.findUnique({
    where: { id: taskId },
    include: { session: { include: { mentorshipRequest: true } } },
  });

  if (!task) throw new AppError(404, "Task not found");

  if (task.session.mentorshipRequest.alumniId !== user.id) {
    throw new AppError(403, "Only the mentor can delete tasks");
  }

  await prisma.mentorshipTask.delete({ where: { id: taskId } });
};

export const MentorshipRoadmapService = {
  createSession,
  getSessions,
  createTask,
  updateTask,
  deleteTask,
};
