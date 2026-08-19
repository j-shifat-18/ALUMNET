import express from "express";
import { CredentialController } from "./credential.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createCertificationSchema,
  updateCertificationSchema,
  createAchievementSchema,
  updateAchievementSchema,
} from "./credential.validation.js";

const router = express.Router();

// Certifications
router.get("/certifications/:uid", CredentialController.getUserCertifications);
router.post("/certifications", auth, validateRequest(createCertificationSchema), CredentialController.addCertification);
router.patch("/certifications/:id", auth, validateRequest(updateCertificationSchema), CredentialController.updateCertification);
router.delete("/certifications/:id", auth, CredentialController.deleteCertification);

// Achievements
router.get("/achievements/:uid", CredentialController.getUserAchievements);
router.post("/achievements", auth, validateRequest(createAchievementSchema), CredentialController.addAchievement);
router.patch("/achievements/:id", auth, validateRequest(updateAchievementSchema), CredentialController.updateAchievement);
router.delete("/achievements/:id", auth, CredentialController.deleteAchievement);

export const CredentialRoutes = router;
