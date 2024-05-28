import { Router } from "express";
import {
    checkInOrCheckOut,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    test,
    getUserAttendance
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/refresh-token").post(refreshAccessToken);

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/check").post(verifyJWT, checkInOrCheckOut)

router.route("/update-account").patch(verifyJWT, updateAccountDetails);
//patch so that the whole is not updated

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/getUserAttendance").get(verifyJWT,getUserAttendance)

router.route("/test").post(test)
// again verifyJWT so that only people who are logged in can access this


export default router;