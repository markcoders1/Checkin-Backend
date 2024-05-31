import { Router } from "express";
import {
    checkInOrCheckOut,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    test,
    getUserAttendance,
    breakUser,
    getStatus,
    getUser,
    sendEmail,
    resetPassword
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/refresh-token").post(refreshAccessToken);

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/check").post(verifyJWT, checkInOrCheckOut)

router.route("/break").post(verifyJWT, breakUser)

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/getUserAttendance").get(verifyJWT,getUserAttendance)

router.route("/getUser").get(verifyJWT,getUser)

router.route("/getStatus").get(verifyJWT,getStatus)

router.route("/test").post(test)

router.route("/send-email").post(verifyJWT, sendEmail)

router.route("/reset-password").post(resetPassword);
// joi 
// 
// add new Company ID field
// change user info 



export default router;