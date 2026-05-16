import express from "express";
import { UserRoutes } from "./app/modules/user/user.route.js";

const app = express();

app.use(express.json());

app.use("/api/v1/users", UserRoutes);

app.get("/", (req, res) => {
  res.send("ALUMNET Server Running");
});

export default app;