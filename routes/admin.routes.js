import { Router } from "express";
import {registerUser,getUserAttendance} from "../controllers/admin.controller.js";
import { verifyJWT,verifyAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(verifyJWT,verifyAdmin,registerUser)

router.route("/getUserAttendance").get(verifyJWT,verifyAdmin,getUserAttendance)

export default router