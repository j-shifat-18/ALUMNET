import { Request, Response } from "express";
import { SearchService } from "./search.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const searchAlumni = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await SearchService.searchAlumni({
    name: req.query.name as string | undefined,
    company: req.query.company as string | undefined,
    department: req.query.department as string | undefined,
    industry: req.query.industry as string | undefined,
    skill: req.query.skill as string | undefined,
    domain: req.query.domain as string | undefined,
    batch: req.query.batch as string | undefined,
    graduationYear: req.query.graduationYear
      ? Number(req.query.graduationYear)
      : undefined,
    mentorAvailable:
      req.query.mentorAvailable === "true"
        ? true
        : req.query.mentorAvailable === "false"
        ? false
        : undefined,
    page,
    limit,
  });

  sendResponse(res, {
    statusCode: 200,
    message: "Alumni retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await SearchService.searchUsers({
    name: req.query.name as string | undefined,
    role: req.query.role as string | undefined,
    department: req.query.department as string | undefined,
    page,
    limit,
  });

  sendResponse(res, {
    statusCode: 200,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const SearchController = {
  searchAlumni,
  searchUsers,
};
