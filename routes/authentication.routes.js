import { Router } from "express";
import {
    refreshAccessToken,
    loginUser,
    logoutUser,
    adminLogin,
    resetPassword,
    resetPassword2,
    logoutFromAllDevicesExceptCurrent,
    logoutFromSpecificDevice,
    logoutFromAllDevices,
} from '../controllers/authentication.controller.js'
import jwt from 'jsonwebtoken'

const authenticateToken = (req, res, next) => {
    const token = req.cookies.accessToken
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const router=Router()

router.route("/login").post(loginUser)

router.route("/adminLogin").post(adminLogin)

router.route("/token").post(refreshAccessToken);

router.route("/logout").post(logoutUser)

router.route("/reset-password").get(resetPassword);

router.route("/reset-password").post(resetPassword2); 

router.route("/logout-all-except").post(logoutFromAllDevicesExceptCurrent);
  
router.route("/logout-specific").post(logoutFromSpecificDevice);

router.route("/logout-all").post(logoutFromAllDevices);

export default router