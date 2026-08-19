import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const senderSelect = {
  id: true,
  uid: true,
  name: true,
  profileImage: true,
  role: true,
} as const;

const getTaskWithParticipants = async (taskId: number) => {
  const task = await prisma.mentorshipTask.findUnique({
    where: { id: taskId },
    include: {
      session: {
        include: {
          mentorshipRequest: {
            select: { studentId: true, alumniId: true, status: true },
          },
        },
      },
    },
  });

  if (!task) throw new AppError(404, "Task not found");
  if (task.session.mentorshipRequest.status !== "ACCEPTED") {
    throw new AppError(400, "This task does not belong to an active mentorship");
  }

  return task;
};

const sendMessage = async (
  uid: string,
  taskId: number,
  content: string,
  messageType: string
) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const task = await getTaskWithParticipants(taskId);
  const { studentId, alumniId } = task.session.mentorshipRequest;

  if (user.id !== studentId && user.id !== alumniId) {
    throw new AppError(403, "You are not part of this mentorship");
  }

  // Students can only send COMPLETION or GENERAL messages
  if (user.id === studentId && messageType === "FEEDBACK") {
    throw new AppError(403, "Only mentors can send feedback messages");
  }

  // Alumni can only send FEEDBACK or GENERAL messages
  if (user.id === alumniId && messageType === "COMPLETION") {
    throw new AppError(403, "Only students can send completion messages");
  }

  const message = await prisma.taskMessage.create({
    data: {
      taskId,
      senderId: user.id,
      content,
      messageType,
    },
    include: {
      sender: { select: senderSelect },
    },
  });

  return message;
};

const getTaskMessages = async (uid: string, taskId: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const task = await getTaskWithParticipants(taskId);
  const { studentId, alumniId } = task.session.mentorshipRequest;

  if (user.id !== studentId && user.id !== alumniId) {
    throw new AppError(403, "You are not part of this mentorship");
  }

  const messages = await prisma.taskMessage.findMany({
    where: { taskId },
    include: {
      sender: { select: senderSelect },
    },
    orderBy: { createdAt: "asc" },
  });

  return { task, messages };
};

const markCompleteWithMessage = async (
  uid: string,
  taskId: number,
  content: string
) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const task = await getTaskWithParticipants(taskId);
  const { studentId } = task.session.mentorshipRequest;

  if (user.id !== studentId) {
    throw new AppError(403, "Only the student can mark a task as complete");
  }

  if (task.isCompleted) {
    throw new AppError(400, "Task is already marked as completed");
  }

  const [updatedTask, message] = await prisma.$transaction([
    prisma.mentorshipTask.update({
      where: { id: taskId },
      data: { isCompleted: true },
    }),
    prisma.taskMessage.create({
      data: {
        taskId,
        senderId: user.id,
        content,
        messageType: "COMPLETION",
      },
      include: {
        sender: { select: senderSelect },
      },
    }),
  ]);

  return { task: updatedTask, message };
};

const closeWithFeedback = async (
  uid: string,
  taskId: number,
  content: string
) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const task = await getTaskWithParticipants(taskId);
  const { alumniId } = task.session.mentorshipRequest;

  if (user.id !== alumniId) {
    throw new AppError(403, "Only the mentor can close a task and send feedback");
  }

  if (!task.isCompleted) {
    throw new AppError(
      400,
      "Task must be marked as completed by the student before the mentor can close it"
    );
  }

  const message = await prisma.taskMessage.create({
    data: {
      taskId,
      senderId: user.id,
      content,
      messageType: "FEEDBACK",
    },
    include: {
      sender: { select: senderSelect },
    },
  });

  return message;
};

export const TaskMessageService = {
  sendMessage,
  getTaskMessages,
  markCompleteWithMessage,
  closeWithFeedback,
};
