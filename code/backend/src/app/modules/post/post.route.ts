import express from "express";
import { PostController } from "./post.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, PostController.createPost);

export const PostRoutes = router;
