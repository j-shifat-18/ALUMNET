import { Request, Response } from "express";
import { PostService } from "./post.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createPost = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const result = await PostService.createPost(uid, req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "Post created successfully",
    data: result,
  });
});

const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await PostService.getAllPosts({ page, limit });

  sendResponse(res, {
    statusCode: 200,
    message: "Posts retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSinglePost = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await PostService.getSinglePost(id);

  sendResponse(res, {
    statusCode: 200,
    message: "Post retrieved successfully",
    data: result,
  });
});

const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const uid = req.user.uid;
  const result = await PostService.updatePost(id, uid, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: "Post updated successfully",
    data: result,
  });
});

const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const uid = req.user.uid;
  const result = await PostService.deletePost(id, uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Post deleted successfully",
    data: result,
  });
});

export const PostController = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
};
