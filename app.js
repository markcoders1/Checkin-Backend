import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js"
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());

// routes declaration
app.use("/api", userRouter);
app.use("/api/admin",adminRouter)

//paced after all other routes and middleware,
// this ensure that any errors occurring in your application are handled by this middleware,
// and you don't need to repeat the error handling logic in every route.
app.use(errorMiddleware);

export { app };
