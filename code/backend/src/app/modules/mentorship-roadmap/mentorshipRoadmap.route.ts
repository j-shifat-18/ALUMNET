import express from "express";
import { MentorshipRoadmapController } from "./mentorshipRoadmap.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createSessionSchema,
  createTaskSchema,
  updateTaskSchema,
} from "./mentorshipRoadmap.validation.js";

const router = express.Router();

router.post(
  "/:requestId/sessions",
  auth,
  validateRequest(createSessionSchema),
  MentorshipRoadmapController.createSession
);

router.get(
  "/:requestId/sessions",
  auth,
  MentorshipRoadmapController.getSessions
);

router.delete(
  "/sessions/:sessionId",
  auth,
  MentorshipRoadmapController.deleteSession
);

router.post(
  "/sessions/:sessionId/tasks",
  auth,
  validateRequest(createTaskSchema),
  MentorshipRoadmapController.createTask
);

router.patch(
  "/tasks/:taskId",
  auth,
  validateRequest(updateTaskSchema),
  MentorshipRoadmapController.updateTask
);

router.delete(
  "/tasks/:taskId",
  auth,
  MentorshipRoadmapController.deleteTask
);

export const MentorshipRoadmapRoutes = router;
