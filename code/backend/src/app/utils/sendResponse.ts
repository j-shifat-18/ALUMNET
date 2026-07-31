import { Response } from "express";

interface ResponsePayload<T> {
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendResponse = <T>(res: Response, payload: ResponsePayload<T>) => {
  res.status(payload.statusCode).json({
    success: true,
    message: payload.message,
    data: payload.data,
    meta: payload.meta || undefined,
  });
};
