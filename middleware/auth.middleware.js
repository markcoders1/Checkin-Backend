//This middleware will verify k user logged in hai ya nahi hai

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { isPointWithinRadius } from "geolib";

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

export const verifyLocation = async (req,res,next) =>{
	try {
		const { latitude, longitude } = req.body;

		console.log("hi")
		return isPointWithinRadius(
			{ latitude: 24.899659, longitude: 67.109078 },
			{ latitude, longitude},
			100
		)?
		next():
		res.status(400).json({message:"user not within radius of markcoders"})

	} catch (err) {
		console.log(err);
		return res.status(400).json({
			message: "something went wrong while calculating user's distance from Markcoders location",
		});
	}
};