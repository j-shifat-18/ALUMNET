import express from "express";
import { JobController } from "./job.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createJobSchema,
  updateJobSchema,
  createCommentSchema,
} from "./job.validation.js";

const router = express.Router();

// Specific routes first to prevent collision with parameterized route :id
router.get("/my", auth, JobController.getMyJobs);

// Feed & single job details
router.get("/", JobController.getAllJobs);
router.get("/:id", JobController.getJobById);

// Job Posting & Management
router.post(
  "/",
  auth,
  validateRequest(createJobSchema),
  JobController.createJob
);
router.patch(
  "/:id",
  auth,
  validateRequest(updateJobSchema),
  JobController.updateJob
);
router.delete("/:id", auth, JobController.deleteJob);

// Comments on Job Posts
router.post(
  "/:jobId/comments",
  auth,
  validateRequest(createCommentSchema),
  JobController.addComment
);
router.delete(
  "/comments/:commentId",
  auth,
  JobController.deleteComment
);

export const JobRoutes = router;
