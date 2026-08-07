import express from "express";
import { ConnectionsController } from "./connections.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/suggestions", auth, ConnectionsController.getSuggestedPeople);
router.get("/", auth, ConnectionsController.getConnectionsPage);

export const ConnectionsRoutes = router;
