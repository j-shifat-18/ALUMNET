import express from 'express';
import { UserController } from "./user.controller.js";
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

router.get("/", auth, UserController.getAllUsers);
router.post("/",  UserController.createUser);

export const UserRoutes = router;
