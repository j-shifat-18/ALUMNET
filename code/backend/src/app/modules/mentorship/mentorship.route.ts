import express from "express";
import { MentorshipController } from "./mentorship.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  sendMentorshipRequestSchema,
  updateAvailabilitySchema,
} from "./mentorship.validation.js";

const router = express.Router();

router.patch(
  "/availability",
  auth,
  validateRequest(updateAvailabilitySchema),
  MentorshipController.updateAvailability
);
router.get("/availability", auth, MentorshipController.getAvailability);
router.get("/availability/:uid", auth, MentorshipController.getAvailability);

router.post("/request", auth, validateRequest(sendMentorshipRequestSchema), MentorshipController.sendRequest);
router.get("/sent", auth, MentorshipController.getSentRequests);
router.get("/received", auth, MentorshipController.getReceivedRequests);
router.get("/mentors", auth, MentorshipController.getMentors);
router.get("/mentees", auth, MentorshipController.getMentees);
router.patch("/:id/accept", auth, MentorshipController.acceptRequest);
router.patch("/:id/reject", auth, MentorshipController.rejectRequest);
router.patch("/:id/end", auth, MentorshipController.endMentorship);
router.get("/history", auth, MentorshipController.getMentorshipHistory);

export const MentorshipRoutes = router;
