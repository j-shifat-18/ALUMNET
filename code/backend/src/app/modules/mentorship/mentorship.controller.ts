import { Request, Response } from "express";
import { MentorshipService } from "./mentorship.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

const sendRequest = asyncHandler(async (req: Request, res: Response) => {
  const studentUid = req.user.uid;
  const { alumniUid, message } = req.body;

  const result = await MentorshipService.sendRequest(studentUid, alumniUid, message);

  sendResponse(res, {
    statusCode: 201,
    message: "Mentorship request sent successfully",
    data: result,
  });
});

const getSentRequests = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;

  const result = await MentorshipService.getSentRequests(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Sent requests retrieved successfully",
    data: result,
  });
});

const getReceivedRequests = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;

  const result = await MentorshipService.getReceivedRequests(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Received requests retrieved successfully",
    data: result,
  });
});

const acceptRequest = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const uid = req.user.uid;

  const result = await MentorshipService.acceptRequest(id, uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Mentorship request accepted",
    data: result,
  });
});

const rejectRequest = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const uid = req.user.uid;

  const result = await MentorshipService.rejectRequest(id, uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Mentorship request rejected",
    data: result,
  });
});

const getMentors = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;

  const result = await MentorshipService.getMentors(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Mentors retrieved successfully",
    data: result,
  });
});

const getMentees = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user.uid;

  const result = await MentorshipService.getMentees(uid);

  sendResponse(res, {
    statusCode: 200,
    message: "Mentees retrieved successfully",
    data: result,
  });
});

export const MentorshipController = {
  sendRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  getMentors,
  getMentees,
};
