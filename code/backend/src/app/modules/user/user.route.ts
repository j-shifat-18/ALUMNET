import express from 'express';
import { UserController } from "./user.controller.js";
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

router.get("/",  UserController.getAllUsers);

router.post("/",  UserController.createUser);

router.get("/:id", UserController.getSingleUser);

router.patch("/:id", UserController.updateUser);

router.delete("/:id", UserController.deleteUser);

export const UserRoutes = router;
