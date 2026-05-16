import { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { get } from "node:http";


const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await UserService.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error : any) {
    res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: error.message,
    });
  }
};

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error : any) {
    res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: error.message,
    });
  }
};




export const UserController = {
  createUser,
  getAllUsers,
};