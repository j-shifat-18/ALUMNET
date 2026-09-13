import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const organizerSelect = {
  id: true,
  uid: true,
  name: true,
  profileImage: true,
  role: true,
  isVerified: true,
} as const;

interface CreateEventInput {
  title: string;
  description: string;
  type: string;
  date: string;
  endDate?: string;
  location?: string;
  link?: string;
}

interface UpdateEventInput {
  title?: string;
  description?: string;
  type?: string;
  date?: string;
  endDate?: string | null;
  location?: string | null;
  link?: string | null;
}

interface EventQueryOptions {
  page: number;
  limit: number;
  type?: string;
  searchTerm?: string;
}

const createEvent = async (uid: string, data: CreateEventInput) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) throw new AppError(404, "User not found");

  if (user.role !== "ALUMNI" && user.role !== "ADMIN") {
    throw new AppError(403, "Only alumni or admins can create events");
  }

  const event = await prisma.event.create({
    data: {
      ...data,
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      organizerId: user.id,
    },
    include: {
      organizer: { select: organizerSelect },
      _count: { select: { attendees: true } },
    },
  });

  return event;
};

const getUpcomingEvents = async (options: EventQueryOptions) => {
  const { page, limit, type, searchTerm } = options;
  const skip = (page - 1) * limit;

  const where: any = {
    date: { gte: new Date() },
  };

  if (type && type !== "ALL") {
    where.type = type.toLowerCase();
  }

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      { location: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      include: {
        organizer: { select: organizerSelect },
        _count: { select: { attendees: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getAllEvents = async (options: EventQueryOptions) => {
  const { page, limit, type, searchTerm } = options;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (type && type !== "ALL") {
    where.type = type.toLowerCase();
  }

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      { location: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      include: {
        organizer: { select: organizerSelect },
        _count: { select: { attendees: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSingleEvent = async (id: number) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: organizerSelect },
      attendees: {
        include: {
          user: {
            select: {
              id: true,
              uid: true,
              name: true,
              profileImage: true,
              role: true,
            },
          },
        },
        orderBy: { registeredAt: "asc" },
      },
      _count: { select: { attendees: true } },
    },
  });

  if (!event) throw new AppError(404, "Event not found");

  return event;
};

const updateEvent = async (uid: string, id: number, data: UpdateEventInput) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError(404, "Event not found");

  if (event.organizerId !== user.id && user.role !== "ADMIN") {
    throw new AppError(403, "Only the organizer or admin can update this event");
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
      endDate:
        data.endDate === null ? null : data.endDate ? new Date(data.endDate) : undefined,
    },
    include: {
      organizer: { select: organizerSelect },
      _count: { select: { attendees: true } },
    },
  });

  return updated;
};

const deleteEvent = async (uid: string, id: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true, role: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError(404, "Event not found");

  if (event.organizerId !== user.id && user.role !== "ADMIN") {
    throw new AppError(403, "Only the organizer or admin can delete this event");
  }

  await prisma.event.delete({ where: { id } });
};

const registerForEvent = async (uid: string, eventId: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Event not found");

  if (new Date(event.date) < new Date()) {
    throw new AppError(400, "Cannot register for a past event");
  }

  const existing = await prisma.eventAttendee.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
  });

  if (existing) throw new AppError(409, "Already registered for this event");

  const attendee = await prisma.eventAttendee.create({
    data: { userId: user.id, eventId },
    include: {
      event: { select: { id: true, title: true, date: true } },
    },
  });

  return attendee;
};

const cancelRegistration = async (uid: string, eventId: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const existing = await prisma.eventAttendee.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
  });

  if (!existing) throw new AppError(404, "You are not registered for this event");

  await prisma.eventAttendee.delete({
    where: { userId_eventId: { userId: user.id, eventId } },
  });
};

const getRegistrationStatus = async (uid: string, eventId: number) => {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { id: true },
  });

  if (!user) throw new AppError(404, "User not found");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Event not found");

  const registration = await prisma.eventAttendee.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
  });

  return { registered: !!registration };
};

export const EventService = {
  createEvent,
  getUpcomingEvents,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getRegistrationStatus,
};
