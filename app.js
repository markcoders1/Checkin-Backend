import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js"
import authRouter from "./routes/authentication.routes.js"
import morgan from "morgan";
import { defaultLimiter, checkLimiter, breakLimiter, passwordLimiter, PDFlimiter} from "./middleware/limit.middleware.js";
const app = express();

app.use(
  cors({
    origin:"http://localhost:5173",
    credentials: true,
  })
);



app.use(morgan("tiny"))

// Apply the rate limiting middleware to all requests.
// default (applies to all) 20 per min 
// breakin breakout 5 min me 1 only
// checkin checkout 1 hour me 1 only
// reset-password and change-password once per day

// app.use( defaultLimiter )
// app.use('/api/check' , checkLimiter )
// app.use('/api/break', breakLimiter )
// app.use('/api/reset-password' , passwordLimiter  )
// app.use('/api/change-password' , passwordLimiter )
// app.use('/api/getAttendancepdf', PDFlimiter)

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
app.use("/api/auth",authRouter)
app.use("/api", userRouter);
app.use("/api/admin",adminRouter)
app.use("*",(req,res)=>res.status(404).json({error:"route not found",code:404}))



export { app };
