import express from "express";
import { MatchingController } from "./matching.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/mentors", auth, MatchingController.getMatchedMentors);

export const MatchingRoutes = router;
