import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateRequest = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    schema.parse(req.body);
    next();
  };
};
