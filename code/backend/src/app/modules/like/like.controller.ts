import { Request, Response } from "express";
import { LikeService } from "./like.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const uid = req.user.uid;

  const result = await LikeService.toggleLike(uid, postId);

  sendResponse(res, {
    statusCode: 200,
    message: result.liked ? "Post liked" : "Post unliked",
    data: result,
  });
});

const getPostLikes = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);

  const result = await LikeService.getPostLikes(postId);

  sendResponse(res, {
    statusCode: 200,
    message: "Post likes retrieved successfully",
    data: result,
  });
});

const getLikeStatus = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const uid = req.user.uid;

  const result = await LikeService.getLikeStatus(uid, postId);

  sendResponse(res, {
    statusCode: 200,
    message: "Like status retrieved successfully",
    data: result,
  });
});

export const LikeController = {
  toggleLike,
  getPostLikes,
  getLikeStatus,
};
