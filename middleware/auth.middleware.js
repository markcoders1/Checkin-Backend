//This middleware will verify k user logged in hai ya nahi hai

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
	try {
		const token =
			req.cookies?.accessToken ||
			req.header("Authorization")?.replace("Bearer ", "");
		if (!token) {
			throw new Error("Unauthorized request");
		}

		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		const user = await User.findOne({ email: decodedToken.email }).select(
			"-password"
		);

		if (!user) {
			throw new Error("invalid Access Token");
		}

		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({
			message: error?.message || "Invalid Access Token",
			error,
		});
	}
};

export const verifyAdmin = (req, res, next) => {
	if (req.user.role !== "admin") {
		return res.status(401).json({ message: "unauthorized" });
	} else {
		next();
	}
};
