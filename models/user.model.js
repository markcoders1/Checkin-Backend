import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const deviceSchema = new mongoose.Schema({
	deviceId: {
		type: String,
		// required: true
	},
	refreshToken: {
		type: String,
		// required: true
	},
	// userAgent: {
	// 	type: String,
	// 	required: true
	// },
});

const userSchema = new mongoose.Schema(
	{
		// required fields {fullName, phone, email, adress, designation, DOB, department, password, shift, role}
		fullName: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		address: {
			type: String,
			required: true,
		},
		designation: {
			type: String,
			required: true,
		},
		DOB: {
			type: String,
			required: true,
		},
		department: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		shift: {
			type: String,
			required: true,
		},
		companyId: {
			type: String,
		},
		CNIC: {
			type: String,
			// required: true,
			unique: true,
		},
		teamLead: {
			type: String,
		},
		role: {
			type: String,
			required: true,
			default: "admin",
		},
		devices:[deviceSchema],
		status: {
			type: String, // checkin || checkout || inbreak
			lowercase: true,
			trim: true,
			default: "checkout",
		},
		active: {
			type: Boolean,
			default: true,
		},
		wrongLogins: {
			type: Number,
			default: 0,
		},
		image: {
			type: String,
			default: "https://test.markcoders.com/ola_ads_api/assets/user.png",
		},
	},
	{ timestamps: true }
);
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	console.log("Update process .env BCRYPT_SALT");
	const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT));
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
	//jwt ki documentation parho, iska sign method karta hai token generate
	return jwt.sign(
		{
			_id: this.ObjectId,
			email: this.email,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: "15m",
		}
	);
};
userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			email: this.email,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: "12h",
		}
	);
};

export const User = mongoose.model("User", userSchema);
