import { Request, Response } from "express";
import { FollowService } from "./follow.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const followUser = asyncHandler(async (req: Request, res: Response) => {
  const followerUid = req.user.uid;
  const followingUid = req.params.uid as string;

  await FollowService.followUser(followerUid, followingUid);

  sendResponse(res, {
    statusCode: 200,
    message: "User followed successfully",
  });
});

const unfollowUser = asyncHandler(async (req: Request, res: Response) => {
  const followerUid = req.user.uid;
  const followingUid = req.params.uid as string;

  await FollowService.unfollowUser(followerUid, followingUid);

  sendResponse(res, {
    statusCode: 200,
    message: "User unfollowed successfully",
  });
});

const getFollowers = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.params.uid as string;

  const result = await FollowService.getFollowers(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Followers retrieved successfully",
    data: result,
  });
});

const getFollowing = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.params.uid as string;

  const result = await FollowService.getFollowing(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Following retrieved successfully",
    data: result,
  });
});

const getFollowStatus = asyncHandler(async (req: Request, res: Response) => {
  const followerUid = req.user.uid;
  const followingUid = req.params.uid as string;

  const result = await FollowService.getFollowStatus(followerUid, followingUid);

  sendResponse(res, {
    statusCode: 200,
    message: "Follow status retrieved successfully",
    data: result,
  });
});

export const FollowController = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
};
