import express from "express";
import { PostController } from "./post.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getSinglePost);

router.post("/", auth, PostController.createPost);
router.patch("/:id", auth, PostController.updatePost);
router.delete("/:id", auth, PostController.deletePost);

export const PostRoutes = router;