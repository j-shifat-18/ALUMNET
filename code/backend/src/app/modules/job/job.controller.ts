import { Request, Response } from "express";
import { JobService } from "./job.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createJob = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const result = await JobService.createJob(uid, req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "Job post created successfully",
    data: result,
  });
});

const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
  const result = await JobService.getAllJobs(req.query);

  sendResponse(res, {
    statusCode: 200,
    message: "Jobs retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await JobService.getJobById(id);

  sendResponse(res, {
    statusCode: 200,
    message: "Job retrieved successfully",
    data: result,
  });
});

const getMyJobs = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const result = await JobService.getMyJobs(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "My job posts retrieved successfully",
    data: result,
  });
});

const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const uid = req.user.uid;
  const result = await JobService.updateJob(uid, id, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: "Job post updated successfully",
    data: result,
  });
});

const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const uid = req.user.uid;
  const result = await JobService.deleteJob(uid, id);

  sendResponse(res, {
    statusCode: 200,
    message: "Job post deleted successfully",
    data: result,
  });
});

const addComment = asyncHandler(async (req: Request, res: Response) => {
  const jobId = Number(req.params.jobId);
  const uid = req.user.uid;
  const result = await JobService.addComment(uid, jobId, req.body.content);

  sendResponse(res, {
    statusCode: 201,
    message: "Comment added successfully",
    data: result,
  });
});

const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const commentId = Number(req.params.commentId);
  const uid = req.user.uid;
  const result = await JobService.deleteComment(uid, commentId);

  sendResponse(res, {
    statusCode: 200,
    message: "Comment deleted successfully",
    data: result,
  });
});

export const JobController = {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  addComment,
  deleteComment,
};
