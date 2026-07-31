import { Request, Response } from "express";
import { ProfileService } from "./profile.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.params.uid as string;
  const result = await ProfileService.getProfile(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.params.uid as string;
  const requestingUid = req.user.uid;

  const result = await ProfileService.updateProfile(uid, requestingUid, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: "Profile updated successfully",
    data: result,
  });
});

export const ProfileController = {
  getProfile,
  updateProfile,
};
