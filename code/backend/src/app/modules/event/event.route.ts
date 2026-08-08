import express from "express";
import { EventController } from "./event.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createEventSchema, updateEventSchema } from "./event.validation.js";

const router = express.Router();

router.get("/upcoming", EventController.getUpcomingEvents);
router.get("/", EventController.getAllEvents);
router.get("/:id", EventController.getSingleEvent);
router.get("/:id/register/status", auth, EventController.getRegistrationStatus);

router.post("/", auth, validateRequest(createEventSchema), EventController.createEvent);
router.post("/:id/register", auth, EventController.registerForEvent);

router.patch("/:id", auth, validateRequest(updateEventSchema), EventController.updateEvent);

router.delete("/:id/register", auth, EventController.cancelRegistration);
router.delete("/:id", auth, EventController.deleteEvent);

export const EventRoutes = router;
