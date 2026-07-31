import express from "express";
import { PostController } from "./post.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createPostSchema, updatePostSchema } from "./post.validation.js";

const router = express.Router();

router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getSinglePost);

router.post("/", auth, validateRequest(createPostSchema), PostController.createPost);
router.patch("/:id", auth, validateRequest(updatePostSchema), PostController.updatePost);
router.delete("/:id", auth, PostController.deletePost);

export const PostRoutes = router;
