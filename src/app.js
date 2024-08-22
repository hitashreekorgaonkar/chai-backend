import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// NOTE: Explore cors options and its role {} in docs
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// how much limit you want to give? as per you server power
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// urlencoded is used for url eg. %20-space // The “extended” syntax allows giving {} inside {} / nested {}
app.use(express.static("public"));
// It serve static assets/files for storing files, folders like pdf, img

app.use(cookieParser());
// ep.8 18:25 From my server to users browser cookie to access and set basically CRUD operation, secure cookies which server can only read and remove

// routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";

// routers declaration ep. 12 10:03
app.use("/api/v1/users", userRouter);
// http://localhost:8000/api/v1/users/register
app.use("/api/v1/videos", videoRouter);

export { app };
