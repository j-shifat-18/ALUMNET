import express from "express";
import cors from "cors";
import { UserRoutes } from "./app/modules/user/user.route.js";
import { ProfileRoutes } from "./app/modules/profile/profile.route.js";
import { PostRoutes } from "./app/modules/post/post.route.js";
import { CommentRoutes, CommentStandaloneRoutes } from "./app/modules/comment/comment.route.js";
import { LikeRoutes } from "./app/modules/like/like.route.js";
import { FollowRoutes } from "./app/modules/follow/follow.route.js";
import { MentorshipRoutes } from "./app/modules/mentorship/mentorship.route.js";
import { SearchRoutes } from "./app/modules/search/search.route.js";
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
app.use("/api/v1/users/:uid", FollowRoutes);
app.use("/api/v1/profiles", ProfileRoutes);
app.use("/api/v1/posts", PostRoutes);
app.use("/api/v1/posts/:postId/comments", CommentRoutes);
app.use("/api/v1/posts/:postId/likes", LikeRoutes);
app.use("/api/v1/comments", CommentStandaloneRoutes);
app.use("/api/v1/mentorship", MentorshipRoutes);
app.use("/api/v1/search", SearchRoutes);

app.get("/", (req, res) => {
  res.send("ALUMNET Server Running");
});

app.use(globalErrorHandler);

export default app;
