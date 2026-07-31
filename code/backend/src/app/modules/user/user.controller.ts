import { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await UserService.getAllUsers({ page, limit });

  sendResponse(res, {
    statusCode: 200,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "User created successfully",
    data: result,
  });
});

const getSingleUser = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.params.id as string;
  const result = await UserService.getSingleUser(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.params.id as string;
  const requestingUid = req.user.uid;

  const result = await UserService.updateUser(uid, requestingUid, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.params.id as string;
  const requestingUid = req.user.uid;

  const result = await UserService.deleteUser(uid, requestingUid);

  sendResponse(res, {
    statusCode: 200,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
