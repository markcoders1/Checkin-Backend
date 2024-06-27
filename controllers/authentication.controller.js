import { User } from "../models/user.model.js";
import jwt, { decode } from "jsonwebtoken";
import Joi from "joi";
import { transporterConstructor ,handlebarConfig } from "../utils/email.js";
import hbs from 'nodemailer-express-handlebars';
import { Log } from "../models/logs.model.js";

const loginUserJoi = Joi.object({
	email: Joi.string().email().required().messages({
		"any.required": "Email is required.",
		"string.empty": "Email cannot be empty.",
		"string.email": "Invalid email format.",
	}),

	password: Joi.string()
		.required()
		.min(6)
		.max(30)
		.messages({
			"string.min": "Password should be minimum 6 characters.",
			"any.required": "Password is required.",
			"string.max":"Password shoould be maximum 30 characters."
		}),

	device: Joi.string().required()
});

const generateAccessAndRefreshToken = async (userId,deviceId) => {
	try {
		const user = await User.findById(userId);
		
		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();
		// Check if device already exists
		// console.log(user.devices);

		let devices1 = Array(user.devices)[0]
		// console.log("THIS IS DEVICES: ",devices1);
		const existingDevice = devices1.find(device => device.deviceId === deviceId);
		// console.log("THIS IS CURRENT DEVICE: ",existingDevice);
		if (existingDevice) {
			existingDevice.refreshToken = refreshToken;
			
		} else {
			user.devices.push({
			deviceId,
			refreshToken
			});
		}

		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		console.log(error);
		throw new Error(
			"Something went wrong while generating Access and Refresh Tokens"
		);
	}
};

export const loginUser = async (req, res) => {
	try {
		const { email, password, device } = req.body;
		const { error } = loginUserJoi.validate(req.body);
		if (error) {
			console.log(error);
			return res.status(400).json({ message: error.details });
		}

		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(400).json({ message: "user not found" });
		}
		if (!user.active) {
			return res
				.status(400)
				.json({ message: "your account has been deactivated" });
		}

		
		const isPasswordValid = await user.isPasswordCorrect(password);
		
		if (!isPasswordValid) {
			user.wrongLogins=user.wrongLogins+1
			if(user.wrongLogins>=3){
				user.active=false
				user.save()
				return res.status(400).json({ message: "Account deactivated due to multiple incorrect attempts. Please Contact management." })
			}
			user.save()
			return res
				.status(400)
				.json({ message: "email or password incorrect" });
		}

		const { accessToken, refreshToken } =
			await generateAccessAndRefreshToken(user._id,device);
		//Log
		await Log.create({
			userId : user.id,
			deviceId: device,
			logType: "Login"
		})

		return res.status(200).json({
			message: "logged in successfully",
			accessToken,
			refreshToken,
		});
	} catch (err) {
		console.log(err)
		return res.status(400).json({ message: "error", err });
	}
};

export const adminLogin = (req, res) => {
	try {

		

	} catch (err) {
		return res.status(400).json({ message: "error", err });
	}
};

export const refreshAccessToken = (req, res) => {
	try {
		const { refreshToken,deviceId } = req.body;
		// console.log("DEVICE: " , device, " REFRESHTOKEN: " , refreshToken);
		if (refreshToken == null||deviceId == null) return res.sendStatus(403);

		jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			async (err, decoded) => {
				if (err) return res.sendStatus(403);
				const user = await User.findOne({ email: decoded.email });
				// console.log("USER DEVICES: ",user.devices );
				const devices1 = Array(user.devices)[0]
				const session= devices1.find(device=>device.deviceId==deviceId)
				// console.log("SESSION: ", session);
				if (session.refreshToken !== refreshToken||session==undefined) return res.sendStatus(403);

				const accessToken = jwt.sign(
					{ email: decoded.email },
					process.env.ACCESS_TOKEN_SECRET,
					{ expiresIn: "15m" }
				);
				res.status(200).json({
					message: "access Token refreshed",
					accessToken,
				});
			}
		);
	} catch (err) {
		return res.status(400).json({ message: "error", err });
	}
};

export const logoutUser = async(req, res) => {
	try {
		const { refreshToken, deviceId } = req.body;
		if (!refreshToken) {
			return res.status(400).json({ message: "Token not found" });
		}

		const decoded = jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET)
			
		const user = await User.findOne({ email: decoded.email });
		let devices = Array(user.devices)[0]
		user.devices = devices.filter(device => device.deviceId !== deviceId)
		
		user.save();
	
		//Log
		await Log.create({
			userId : user.id,
			deviceId: deviceId,
			logType: "Logout"
		})

		res.status(200).json({message:"User logged out successfully"});
	} catch (err) {
		console.log(err);
		return res.status(400).json({ message: "error", err });
	}
};


export const logoutFromAllDevicesExceptCurrent = async (req, res) => {
	try {
		const { refreshToken, deviceId } = req.body;

		if ( !deviceId) {
			return res.status(400).json({message:"userId or deviceId Missing "})
		}

		jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			async (err, decoded) => {
				const user = await User.findOne({ email: decoded.email });
				user.devices = user.devices.filter(
					(device) => device.deviceId === deviceId
				);
		
				await user.save();
				user.save();
			}
		);

		return res
			.status(200)
			.json({ message: "Logged Out from all devices except current successfully" });
	} catch (error) {
		console.log(error);
		return res.status(400).json({ message: "error", error });
	}
};

export const logoutFromAllDevices = async (req, res) => {
	try {
		const { userId }  = req.body;

		if (!userId) {
			return res.status(400).json({message:"userId Missing "})
		}

		const user = await User.findById(userId);

		user.devices = []

		await user.save();

		return res
			.status(200)
			.json({ message: "Logged Out from all devices successfully" });
	} catch (error) {
		console.log(error);
		return res.status(400).json({ message: "error", error });
	}
};

export const logoutFromSpecificDevice = async (req, res) => {
	try {
		const { userId, deviceId } = req.body;

		if (!userId || !deviceId) {
			return res.status(400).json({message:"userId or deviceId Missing "})
		}

		const user = await User.findById(userId);

		user.devices = user.devices.filter(
			(device) => device.deviceId !== deviceId
		);

		await user.save();

		return res
			.status(200)
			.json({ message: "Logged Out from specific device successfully" });
	} catch (error) {
		console.log(error);
		return res.status(400).json({ message: "error", err });
	}
};

const resetPasswordJoi = Joi.object({
	email: Joi.string().email().required().messages({
		"any.required": "Email is required.",
		"string.empty": "Email cannot be empty.",
		"string.email": "Invalid email format.",
	}),
});

export const resetPassword1 = async (req, res) => {
	// 1. take email from user
	// 2. check if its a valid email address using joi
	// 3. find a user with that email in database
	// 4. generate a new token
	// 5. send email with link made with that token
	
	try {
		console.log(req.query);

		//Joi email check
		const { error } = resetPasswordJoi.validate(req.query);
		if (error) {
			console.log(error);
			return res.status(400).json({ message: error.details });
		}
		//find in db
		const user = await User.findOne({ email: req.query.email });
		if (!user) {
			console.log("User not found");
			return res.status(400).json({
				message: `There is no user registered with the email: ${req.query.email} `,
			});
		}
		console.log("User found:", user);
		console.log(process.env.PASSWORD_TOKEN_SECRET);
		// generate a token using jwt
		const resetToken = jwt.sign({email:req.query.email},process.env.PASSWORD_TOKEN_SECRET,{"expiresIn":'5m'})
		console.log("RESET TOKEN: ", resetToken);
		const link = `hresque.vercel.app/password-reset/${resetToken}`;
		console.log("LINK: ",link);

		const emailToSendOTP = user.email;
		console.log(`Trying to send email to ${emailToSendOTP} now`);
		
		// Define the email options
		const theEmail = {
		from: process.env.APP_EMAIL,
		to: emailToSendOTP,
		subject: 'Reset Password',
		template: 'reset-password', // Name of the template file without the extension
		context: {
		  firstName: user.firstName,
		  lastName: user.lastName,
		  link: `http://localhost:5173/password-reset/${resetToken}`,
		  //   link: `https://hresque.vercel.app/password-reset/${resetToken}`,
		},
	};
		console.log(theEmail);

		// send email
		const transporter = transporterConstructor();

		// Attach the handlebars plugin to the transporter
		const handlebarOptions = handlebarConfig()

		transporter.use('compile', hbs(handlebarOptions));
		await transporter.sendMail(theEmail, (error) => {
			if (error) return res.status(400).json({ "Email not sent": error });
		});
		console.log("password reset link has been emailed successfully");

		res.status(200).json({
			message:
				"password reset link has been emailed successfully",
				theEmail
		});
	} catch (error) {
		console.error("Error occurred while sending link email: ", error);
		res.status(400).json({ error });
	}
};


const resetPassword2Joi = Joi.object({
	password: Joi.string()
		.min(6)
		.max(30)
		.pattern(
			new RegExp(
				"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_,+=/-\/?.]).+$"
			)
		)
		.required()
		.messages({
			"string.min": "Password should be minimum 6 characters.",
			"string.max": "Password should be maximum 30 characters.",
			"string.pattern.base":"Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
			"any.required": "Password is required.",
		}),
	token: Joi.string().required().messages({
			"any.required": "token is required.",
			"string.empty": "token cannot be empty.",
		}),
});
export const resetPassword2 = async (req,res) =>{
	try {
		// decode the token 
		// verify the token with token_secret 
		// get new Password from user
		// take the email from the decoded token and get that user in db
		// now set this user's password to newPassword 
		
		const token = jwt.verify(req.body.token,process.env.PASSWORD_TOKEN_SECRET)
		console.log("token: ",token);
		if (!token.email){
			console.log("User not found");
			return res.status(400).json({
				message: "There is no user registered with the specified email"
			});
		}
		//joi password strength check
		const { error } = resetPassword2Joi.validate(req.body);
		if (error) {
			console.log(error);
			return res.status(400).json({ message: error.details });
		}
		// find user in db
		const user = await User.findOne({ email: token.email });
		if (!user) {
			res.status(400).json({ message: "Error: user not found in database" });
		}
		//update user password
		user.password = req.body.password
		await user.save({ validateBeforeSave: false });

		return res.status(200).json({ message: "Password has been changed Succesfully" , token});

	} catch (error) {
		res.status(400).json({ error });
	}
};