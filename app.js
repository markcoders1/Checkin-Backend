import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js"
import morgan from "morgan";
const app = express();

app.use(
  cors({
    origin:"*",
    credentials: true,
  })
);

app.use(morgan("tiny"))

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
app.use("*",(req,res)=>res.status(404).json({error:"route not found",code:404}))



export { app };
