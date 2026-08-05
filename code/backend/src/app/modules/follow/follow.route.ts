import express from "express";
import { FollowController } from "./follow.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router({ mergeParams: true });

router.post("/follow", auth, FollowController.followUser);
router.delete("/follow", auth, FollowController.unfollowUser);
router.get("/follow/status", auth, FollowController.getFollowStatus);
router.get("/followers", FollowController.getFollowers);
router.get("/following", FollowController.getFollowing);

export const FollowRoutes = router;
