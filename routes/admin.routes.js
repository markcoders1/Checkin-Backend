import { Router } from "express";
import {registerUser} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(verifyJWT,registerUser)

export default router