import { Request, Response } from "express";
import { TaskMessageService } from "./taskMessage.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const taskId = Number(req.params.taskId);
  const { content, messageType } = req.body;

  const result = await TaskMessageService.sendMessage(uid, taskId, content, messageType ?? "GENERAL");

  sendResponse(res, {
    statusCode: 201,
    message: "Message sent successfully",
    data: result,
  });
});

const getTaskMessages = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const taskId = Number(req.params.taskId);

  const result = await TaskMessageService.getTaskMessages(uid, taskId);

  sendResponse(res, {
    statusCode: 200,
    message: "Messages retrieved successfully",
    data: result,
  });
});

const markCompleteWithMessage = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const taskId = Number(req.params.taskId);
  const { content } = req.body;

  const result = await TaskMessageService.markCompleteWithMessage(uid, taskId, content);

  sendResponse(res, {
    statusCode: 200,
    message: "Task marked as complete and message sent",
    data: result,
  });
});

const closeWithFeedback = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const taskId = Number(req.params.taskId);
  const { content } = req.body;

  const result = await TaskMessageService.closeWithFeedback(uid, taskId, content);

  sendResponse(res, {
    statusCode: 200,
    message: "Feedback sent successfully",
    data: result,
  });
});

export const TaskMessageController = {
  sendMessage,
  getTaskMessages,
  markCompleteWithMessage,
  closeWithFeedback,
};
