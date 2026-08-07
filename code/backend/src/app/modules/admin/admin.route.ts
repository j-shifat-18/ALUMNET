import express from "express";
import { AdminController } from "./admin.controller.js";
import { auth } from "../../middlewares/auth.js";
import { adminGuard } from "../../middlewares/adminGuard.js";

const router = express.Router();

router.use(auth, adminGuard);

router.get("/stats", AdminController.getStats);
router.patch("/users/:userId/verify", AdminController.verifyUser);
router.patch("/users/:userId/ban", AdminController.banUser);
router.patch("/users/:userId/suspend", AdminController.suspendUser);
router.patch("/users/:userId/activate", AdminController.activateUser);
router.delete("/posts/:postId", AdminController.removePost);
router.delete("/comments/:commentId", AdminController.removeComment);

export const AdminRoutes = router;
