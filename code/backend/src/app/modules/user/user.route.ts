import express from "express";
import { UserController } from "./user.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createUserSchema, updateUserSchema } from "./user.validation.js";

const router = express.Router();

router.get("/", auth, UserController.getAllUsers);

router.post("/", validateRequest(createUserSchema), UserController.createUser);

router.get("/:id", auth, UserController.getSingleUser);

router.patch("/:id", auth, validateRequest(updateUserSchema), UserController.updateUser);

router.delete("/:id", auth, UserController.deleteUser);

export const UserRoutes = router;
