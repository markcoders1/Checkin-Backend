import { Router } from "express";
import {registerUser,getUserAttendance, getUser, getAllUsers, getAttendancePDF, toggleUserAccount, autoCheck, updateAnyProfile} from "../controllers/admin.controller.js";
import { verifyJWT,verifyAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(verifyJWT,verifyAdmin,registerUser)

router.route("/getUserAttendance").get(verifyJWT,verifyAdmin,getUserAttendance)

router.route("/getAllUsers").get(verifyJWT,verifyAdmin, getAllUsers)

router.route("/getUser").get(verifyJWT,verifyAdmin, getUser)

router.route("/getAttendancePDF").get(verifyJWT,verifyAdmin,getAttendancePDF)

router.route("/toggleUserAccount").get(verifyJWT,verifyAdmin,toggleUserAccount)

router.route("/auto-check").get(autoCheck)

router.route("/update-any-profile").get(verifyJWT,verifyAdmin,updateAnyProfile)

export default router