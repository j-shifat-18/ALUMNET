import express from "express";
import { ProfileController } from "./profile.controller.js";

const router = express.Router();

router.get("/:uid", ProfileController.getProfile);

router.patch("/:uid", ProfileController.updateProfile);

export const ProfileRoutes = router;