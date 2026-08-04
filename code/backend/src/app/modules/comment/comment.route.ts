import express from "express";
import { CommentController } from "./comment.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createCommentSchema, updateCommentSchema } from "./comment.validation.js";

const router = express.Router({ mergeParams: true });

router.get("/", CommentController.getPostComments);
router.post("/", auth, validateRequest(createCommentSchema), CommentController.addComment);

export const CommentRoutes = router;

const standaloneRouter = express.Router();

standaloneRouter.patch("/:id", auth, validateRequest(updateCommentSchema), CommentController.updateComment);
standaloneRouter.delete("/:id", auth, CommentController.deleteComment);

export const CommentStandaloneRoutes = standaloneRouter;
