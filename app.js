import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";
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

// routes import
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/api", userRouter);

//paced after all other routes and middleware,
// this ensure that any errors occurring in your application are handled by this middleware,
// and you don't need to repeat the error handling logic in every route.
app.use(errorMiddleware)

export { app };
