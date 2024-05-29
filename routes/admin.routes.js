import { Router } from "express";
import {registerUser,getUserAttendance, getUser, getAllUsers} from "../controllers/admin.controller.js";
import { verifyJWT,verifyAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(verifyJWT,verifyAdmin,registerUser)

router.route("/getUserAttendance").get(verifyJWT,verifyAdmin,getUserAttendance)

router.route("/getAllUsers").get(verifyJWT,verifyAdmin, getAllUsers)

router.route("/getUser").get(verifyJWT,verifyAdmin, getUser)

export default router