import { Request, Response, NextFunction } from "express";
import admin from "../config/firebaseAdmin.js";

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    const token = authorization.split(" ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};