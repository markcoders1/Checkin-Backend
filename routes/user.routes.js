import { Router } from "express";
import {
	checkInOrCheckOut,
	changeCurrentPassword,
	test,
	getUserAttendance,
	breakUser,
	getStatus,
	getUser,
	sendEmail,
	resetPassword,
	getAttendancePDF,
	updateProfile,
	isAdmin,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { autoCheck } from "../controllers/admin.controller.js";

const router = Router();

router.route("/check").post(verifyJWT, checkInOrCheckOut);

router.route("/break").post(verifyJWT, breakUser);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/getUserAttendance").get(verifyJWT, getUserAttendance);

router.route("/getAttendancePDF").get(verifyJWT, getAttendancePDF);

router.route("/getUser").get(verifyJWT, getUser);

router.route("/getStatus").get(verifyJWT, getStatus);

router.route("/test").post(test);

router.route("/send-email").post(verifyJWT, sendEmail);

router.route("/isAdmin").get(verifyJWT, isAdmin);

router.route("/reset-password").post(resetPassword);

router.route("/update-profile").post(verifyJWT, updateProfile);

export default router;
