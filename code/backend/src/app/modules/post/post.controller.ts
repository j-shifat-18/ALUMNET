import { Request, Response } from "express";
import { PostService } from "./post.service.js";

const createPost = async (req: Request, res: Response) => {
  try {
    const uid = req.user.uid;
    const result = await PostService.createPost(uid, req.body);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
const getAllPosts = async (req: Request, res: Response) => {
  try {
    const result = await PostService.getAllPosts();

    res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const getSinglePost = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await PostService.getSinglePost(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await PostService.updatePost(id, req.body);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await PostService.deletePost(id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const PostController = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
};

