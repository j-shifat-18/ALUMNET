import express from "express";
import { MentorshipController } from "./mentorship.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { sendMentorshipRequestSchema } from "./mentorship.validation.js";

const router = express.Router();

router.post("/request", auth, validateRequest(sendMentorshipRequestSchema), MentorshipController.sendRequest);
router.get("/sent", auth, MentorshipController.getSentRequests);
router.get("/received", auth, MentorshipController.getReceivedRequests);
router.get("/mentors", auth, MentorshipController.getMentors);
router.get("/mentees", auth, MentorshipController.getMentees);
router.patch("/:id/accept", auth, MentorshipController.acceptRequest);
router.patch("/:id/reject", auth, MentorshipController.rejectRequest);

export const MentorshipRoutes = router;
