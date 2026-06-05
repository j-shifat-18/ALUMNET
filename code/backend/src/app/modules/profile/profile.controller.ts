import { Request, Response } from "express";
import { ProfileService } from "./profile.service.js";

const getProfile = async (
  req: Request,
  res: Response
) => {
  const { uid } = req.params;

  const result =
    await ProfileService.getProfile(uid as string);

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
};

const updateProfile = async (
  req: Request,
  res: Response
) => {
  const { uid } = req.params;

  const result =
    await ProfileService.updateProfile(
      uid as string,
      req.body
    );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
};



export const ProfileController = {
  getProfile,
  updateProfile,
};