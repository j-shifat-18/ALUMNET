import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";

export const adminGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await prisma.user.findUnique({
    where: { uid: req.user.uid },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
    return;
  }

  next();
};
