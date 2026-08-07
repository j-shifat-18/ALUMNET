import { Request, Response } from "express";
import { AdminService } from "./admin.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const result = await AdminService.getStats();

  sendResponse(res, {
    statusCode: 200,
    message: "Platform statistics retrieved successfully",
    data: result,
  });
});

const verifyUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const result = await AdminService.verifyUser(userId);

  sendResponse(res, {
    statusCode: 200,
    message: "User verified successfully",
    data: result,
  });
});

const banUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const adminUid = req.user.uid;
  const result = await AdminService.banUser(adminUid, userId);

  sendResponse(res, {
    statusCode: 200,
    message: "User banned successfully",
    data: result,
  });
});

const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const result = await AdminService.suspendUser(userId);

  sendResponse(res, {
    statusCode: 200,
    message: "User suspended successfully",
    data: result,
  });
});

const activateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const result = await AdminService.activateUser(userId);

  sendResponse(res, {
    statusCode: 200,
    message: "User activated successfully",
    data: result,
  });
});

const removePost = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const adminUid = req.user.uid;
  await AdminService.removePost(adminUid, postId);

  sendResponse(res, {
    statusCode: 200,
    message: "Post removed successfully",
  });
});

const removeComment = asyncHandler(async (req: Request, res: Response) => {
  const commentId = Number(req.params.commentId);
  const adminUid = req.user.uid;
  await AdminService.removeComment(adminUid, commentId);

  sendResponse(res, {
    statusCode: 200,
    message: "Comment removed successfully",
  });
});

export const AdminController = {
  getStats,
  verifyUser,
  banUser,
  suspendUser,
  activateUser,
  removePost,
  removeComment,
};
