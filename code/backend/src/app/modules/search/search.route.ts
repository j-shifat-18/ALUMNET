import express from "express";
import { SearchController } from "./search.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/alumni", auth, SearchController.searchAlumni);
router.get("/users", auth, SearchController.searchUsers);

export const SearchRoutes = router;
