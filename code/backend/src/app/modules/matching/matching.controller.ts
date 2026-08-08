import { Request, Response } from "express";
import { MatchingService } from "./matching.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const getMatchedMentors = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const limit = Number(req.query.limit) || 10;

  const result = await MatchingService.getMatchedMentors(uid, limit);

  sendResponse(res, {
    statusCode: 200,
    message: "Mentor matches retrieved successfully",
    data: result,
  });
});

export const MatchingController = {
  getMatchedMentors,
};
