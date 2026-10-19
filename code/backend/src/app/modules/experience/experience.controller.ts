import { Request, Response } from "express";
import { ExperienceService } from "./experience.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const addExperience = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const result = await ExperienceService.addExperience(uid, req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "Experience added successfully",
    data: result,
  });
});

const getMyExperiences = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const result = await ExperienceService.getUserExperiences(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Experiences retrieved successfully",
    data: result,
  });
});

const getUserExperiences = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.params.uid as string;
  const result = await ExperienceService.getUserExperiences(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "User experiences retrieved successfully",
    data: result,
  });
});

const getExperienceById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await ExperienceService.getExperienceById(id);

  sendResponse(res, {
    statusCode: 200,
    message: "Experience retrieved successfully",
    data: result,
  });
});

const updateExperience = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const id = Number(req.params.id);
  const result = await ExperienceService.updateExperience(uid, id, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: "Experience updated successfully",
    data: result,
  });
});

const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const id = Number(req.params.id);
  const result = await ExperienceService.deleteExperience(uid, id);

  sendResponse(res, {
    statusCode: 200,
    message: "Experience deleted successfully",
    data: result,
  });
});

export const ExperienceController = {
  addExperience,
  getMyExperiences,
  getUserExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
};
