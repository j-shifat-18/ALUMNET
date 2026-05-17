import { Request, Response } from "express";
import { UserService } from "./user.service.js";


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

const getSingleUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await UserService.getSingleUser(id as string);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSingleUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await UserService.updateSingleUser(
      id as string,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await UserService.deleteUser(id as string);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const UserController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateSingleUser,
  deleteUser
};