import express from "express";
import { ExperienceController } from "./experience.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createExperienceSchema,
  updateExperienceSchema,
} from "./experience.validation.js";

const router = express.Router();

router.post(
  "/",
  auth,
  validateRequest(createExperienceSchema),
  ExperienceController.addExperience
);

router.get("/", auth, ExperienceController.getMyExperiences);

router.get("/user/:uid", ExperienceController.getUserExperiences);

router.get("/:id", ExperienceController.getExperienceById);

router.patch(
  "/:id",
  auth,
  validateRequest(updateExperienceSchema),
  ExperienceController.updateExperience
);

router.delete("/:id", auth, ExperienceController.deleteExperience);

export const ExperienceRoutes = router;
