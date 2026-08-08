import { Request, Response } from "express";
import { EventService } from "./event.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const result = await EventService.createEvent(uid, req.body);

  sendResponse(res, { statusCode: 201, message: "Event created successfully", data: result });
});

const getUpcomingEvents = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await EventService.getUpcomingEvents({ page, limit });

  sendResponse(res, {
    statusCode: 200,
    message: "Upcoming events retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await EventService.getAllEvents({ page, limit });

  sendResponse(res, {
    statusCode: 200,
    message: "Events retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleEvent = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await EventService.getSingleEvent(id);

  sendResponse(res, { statusCode: 200, message: "Event retrieved successfully", data: result });
});

const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const id = Number(req.params.id);
  const result = await EventService.updateEvent(uid, id, req.body);

  sendResponse(res, { statusCode: 200, message: "Event updated successfully", data: result });
});

const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const id = Number(req.params.id);
  await EventService.deleteEvent(uid, id);

  sendResponse(res, { statusCode: 200, message: "Event deleted successfully" });
});

const registerForEvent = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const eventId = Number(req.params.id);
  const result = await EventService.registerForEvent(uid, eventId);

  sendResponse(res, { statusCode: 201, message: "Registered for event successfully", data: result });
});

const cancelRegistration = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const eventId = Number(req.params.id);
  await EventService.cancelRegistration(uid, eventId);

  sendResponse(res, { statusCode: 200, message: "Registration cancelled successfully" });
});

const getRegistrationStatus = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const eventId = Number(req.params.id);
  const result = await EventService.getRegistrationStatus(uid, eventId);

  sendResponse(res, { statusCode: 200, message: "Registration status retrieved", data: result });
});

export const EventController = {
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
