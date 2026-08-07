import { Request, Response } from "express";
import { ConnectionsService } from "./connections.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const getSuggestedPeople = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const limit = Number(req.query.limit) || 20;

  const result = await ConnectionsService.getSuggestedPeople(uid, limit);

  sendResponse(res, {
    statusCode: 200,
    message: "Suggested people retrieved successfully",
    data: result,
  });
});

const getConnectionsPage = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;

  const result = await ConnectionsService.getConnectionsPage(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Connections retrieved successfully",
    data: result,
  });
});

export const ConnectionsController = {
  getSuggestedPeople,
  getConnectionsPage,
};
