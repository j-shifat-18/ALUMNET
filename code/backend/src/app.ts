import express from "express";
import cors from "cors";
import { UserRoutes } from "./app/modules/user/user.route.js";
import { ProfileRoutes } from "./app/modules/profile/profile.route.js";


const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/profiles", ProfileRoutes);

app.get("/", (req, res) => {
  res.send("ALUMNET Server Running");
});

export default app;