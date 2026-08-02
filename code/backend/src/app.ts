import express from "express";
import cors from "cors";
import { UserRoutes } from "./app/modules/user/user.route.js";
import { ProfileRoutes } from "./app/modules/profile/profile.route.js";
import { PostRoutes } from "./app/modules/post/post.route.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://alumnet-frontend.vercel.app",
      "https://alumnet-production.up.railway.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/profiles", ProfileRoutes);
app.use("/api/v1/posts", PostRoutes);

app.get("/", (req, res) => {
  res.send("ALUMNET Server Running");
});

app.use(globalErrorHandler);

export default app;
