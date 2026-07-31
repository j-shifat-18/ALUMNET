import express from "express";
import { ProfileController } from "./profile.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { updateProfileSchema } from "./profile.validation.js";

const router = express.Router();

router.get("/:uid", ProfileController.getProfile);

router.patch("/:uid", auth, validateRequest(updateProfileSchema), ProfileController.updateProfile);

export const ProfileRoutes = router;
