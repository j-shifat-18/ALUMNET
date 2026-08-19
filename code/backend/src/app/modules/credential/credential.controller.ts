import { Request, Response } from "express";
import { CredentialService } from "./credential.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

// ── Certifications ────────────────────────────────────────────────────────────

const addCertification = asyncHandler(async (req: Request, res: Response) => {
  const result = await CredentialService.addCertification(req.user.uid, req.body);
  sendResponse(res, { statusCode: 201, message: "Certification added successfully", data: result });
});

const getUserCertifications = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.params.uid as string;
  const result = await CredentialService.getUserCertifications(uid);
  sendResponse(res, { statusCode: 200, message: "Certifications retrieved successfully", data: result });
});

const updateCertification = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await CredentialService.updateCertification(req.user.uid, id, req.body);
  sendResponse(res, { statusCode: 200, message: "Certification updated successfully", data: result });
});

const deleteCertification = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await CredentialService.deleteCertification(req.user.uid, id);
  sendResponse(res, { statusCode: 200, message: "Certification deleted successfully" });
});

// ── Achievements ──────────────────────────────────────────────────────────────

const addAchievement = asyncHandler(async (req: Request, res: Response) => {
  const result = await CredentialService.addAchievement(req.user.uid, req.body);
  sendResponse(res, { statusCode: 201, message: "Achievement added successfully", data: result });
});

const getUserAchievements = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.params.uid as string;
  const result = await CredentialService.getUserAchievements(uid);
  sendResponse(res, { statusCode: 200, message: "Achievements retrieved successfully", data: result });
});

const updateAchievement = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await CredentialService.updateAchievement(req.user.uid, id, req.body);
  sendResponse(res, { statusCode: 200, message: "Achievement updated successfully", data: result });
});

const deleteAchievement = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await CredentialService.deleteAchievement(req.user.uid, id);
  sendResponse(res, { statusCode: 200, message: "Achievement deleted successfully" });
});

export const CredentialController = {
  addCertification,
  getUserCertifications,
  updateCertification,
  deleteCertification,
  addAchievement,
  getUserAchievements,
  updateAchievement,
  deleteAchievement,
};
