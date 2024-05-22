import { Router } from "express";
import {
    checkinUser,
    checkoutUser,
    loginUser,
    logoutUser,
    registerUser,
    refreshAccesToken,
    changeCurrentPassword,
    updateAccountDetails,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();


router.route("/refresh-token").post(refreshAccesToken);

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/checkin").post(verifyJWT, checkinUser)

router.route("/checkout").post(verifyJWT, checkoutUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
//patch so that the whole is not updated

router.route("/change-password").post(verifyJWT, changeCurrentPassword);
// again verifyJWT so that only people who are logged in can access this


export default router;