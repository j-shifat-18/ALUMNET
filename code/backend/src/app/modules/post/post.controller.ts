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


