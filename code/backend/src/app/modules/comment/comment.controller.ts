import { Request, Response } from "express";
import { CommentService } from "./comment.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const addComment = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const uid = req.user.uid;

  const result = await CommentService.addComment(uid, postId, req.body.content);

  sendResponse(res, {
    statusCode: 201,
    message: "Comment added successfully",
    data: result,
  });
});

const getPostComments = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);

  const result = await CommentService.getPostComments(postId);

  sendResponse(res, {
    statusCode: 200,
    message: "Comments retrieved successfully",
    data: result,
  });
});

const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const uid = req.user.uid;

  const result = await CommentService.updateComment(id, uid, req.body.content);

  sendResponse(res, {
    statusCode: 200,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const uid = req.user.uid;

  await CommentService.deleteComment(id, uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Comment deleted successfully",
  });
});

export const CommentController = {
  addComment,
  getPostComments,
  updateComment,
  deleteComment,
};
