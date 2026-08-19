import express from "express";
import { TaskMessageController } from "./taskMessage.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { sendMessageSchema } from "./taskMessage.validation.js";

const router = express.Router();

router.get("/:taskId/messages", auth, TaskMessageController.getTaskMessages);
router.post("/:taskId/messages", auth, validateRequest(sendMessageSchema), TaskMessageController.sendMessage);
router.post("/:taskId/complete", auth, validateRequest(sendMessageSchema), TaskMessageController.markCompleteWithMessage);
router.post("/:taskId/feedback", auth, validateRequest(sendMessageSchema), TaskMessageController.closeWithFeedback);

export const TaskMessageRoutes = router;
