import { Request, Response } from "express";
import { MentorshipRoadmapService } from "./mentorshipRoadmap.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createSession = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const requestId = Number(req.params.requestId);
  const { title, description } = req.body;

  const result = await MentorshipRoadmapService.createSession(uid, requestId, title, description);

  sendResponse(res, {
    statusCode: 201,
    message: "Session created successfully",
    data: result,
  });
});

const getSessions = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const requestId = Number(req.params.requestId);

  const result = await MentorshipRoadmapService.getSessions(uid, requestId);

  sendResponse(res, {
    statusCode: 200,
    message: "Sessions retrieved successfully",
    data: result,
  });
});

const createTask = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const sessionId = Number(req.params.sessionId);

  const result = await MentorshipRoadmapService.createTask(uid, sessionId, req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "Task created successfully",
    data: result,
  });
});

const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const taskId = Number(req.params.taskId);

  const result = await MentorshipRoadmapService.updateTask(uid, taskId, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: "Task updated successfully",
    data: result,
  });
});

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const taskId = Number(req.params.taskId);

  await MentorshipRoadmapService.deleteTask(uid, taskId);

  sendResponse(res, {
    statusCode: 200,
    message: "Task deleted successfully",
  });
});

export const MentorshipRoadmapController = {
  createSession,
  getSessions,
  createTask,
  updateTask,
  deleteTask,
};
