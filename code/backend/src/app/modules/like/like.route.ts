import express from "express";
import { LikeController } from "./like.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router({ mergeParams: true });

router.get("/", LikeController.getPostLikes);
router.get("/status", auth, LikeController.getLikeStatus);
router.post("/toggle", auth, LikeController.toggleLike);

export const LikeRoutes = router;
