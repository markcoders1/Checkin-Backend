import { Router } from "express";
import {
    registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// /http://locahost:8000/api/v1/user/register pe koi bhi jaega to registerUser method execute hoga
router.route("/register").post(registerUser)




// router.route("/checkin").post(loginUser);
// //secured routes
// router.route("/checkout").post(verifyJWT, logoutUser);
// //.post(logoutUser) me verifyJWT middleware laga diya hai from auth.middleware.js



// router.route("/change-password").post(verifyJWT, changeCurrentPassword);
// again verifyJWT so that only people who are logged in can access this

// router.route("/current-user").get(getCurrentUser);

// router.route("/update-account").patch(verifyJWT, updateAccountDetails);
// //patch so that the whole is not updated



export default router;
