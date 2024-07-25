import { Router } from "express";
import {
	registerUser,
	getUserAttendance,
	getUser,
	getAllUsers,
	getAttendancePDF,
	toggleUserAccount,
	autoCheck,
	updateAnyProfile,
	deleteUser,
    // getUserDevices,
} from "../controllers/admin.controller.js";
import { verifyJWT, verifyAdmin } from "../middleware/auth.middleware.js";
import cron from 'node-cron'

const router = Router();

router.route("/register").post(verifyJWT,verifyAdmin,registerUser)

router.route("/getUserAttendance").get(verifyJWT,verifyAdmin,getUserAttendance)

router.route("/getAllUsers").get(verifyJWT,verifyAdmin, getAllUsers)

router.route("/getUser").get(verifyJWT,verifyAdmin, getUser)

router.route("/getAttendancePDF").get(verifyJWT,verifyAdmin,getAttendancePDF)

router.route("/toggleUserAccount").get(verifyJWT,verifyAdmin,toggleUserAccount)

cron.schedule('0 */2 * * *', autoCheck); // every 2 hours

// cron.schedule("*/1 * * * *", autoCheck) // every 1 min, for testing
// router.route("/auto-check").get(autoCheck)

router.route("/delete-user").get(verifyJWT, verifyAdmin, deleteUser)

router.route("/update-any-profile").post(verifyJWT,verifyAdmin,updateAnyProfile)

// router.route("/get-user-devices").get(verifyJWT, verifyAdmin, getUserDevices)

export default router