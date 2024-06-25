import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { transporterConstructor ,handlebarConfig } from "../utils/email.js";
import hbs from 'nodemailer-express-handlebars';

const loginUserJoi = Joi.object({
	email: Joi.string().email().required().messages({
		"any.required": "Email is required.",
		"string.empty": "Email cannot be empty.",
		"string.email": "Invalid email format.",
	}),

	password: Joi.string()
		.required()
		.min(6)
		.messages({
			"string.min": "Password should be minimum 6 characters.",
			"any.required": "Password is required.",
		}),
});

const generateAccessAndRefreshToken = async (userId) => {
	try {
		const user = await User.findById(userId);
		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		throw new Error(
			"Something went wrong while generating Access and Refresh Tokens"
		);
	}
};

export const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
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
			return res
				.status(400)
				.json({ message: "email or password incorrect" });
		}

		const { accessToken, refreshToken } =
			await generateAccessAndRefreshToken(user._id);

		return res.status(200).json({
			message: "logged in successfully",
			accessToken,
			refreshToken,
		});
	} catch (err) {
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
		const { refreshToken } = req.body;

		if (refreshToken == null) return res.sendStatus(403);

		jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			async (err, decoded) => {
				if (err) return res.sendStatus(403);
				const user = await User.findOne({ email: decoded.email });
				if (user.refreshToken !== refreshToken)
					return res.sendStatus(403);

				const accessToken = jwt.sign(
					{ email: decoded.email },
					process.env.ACCESS_TOKEN_SECRET,
					{ expiresIn: "15s" }
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

export const logoutUser = (req, res) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			return res.status(400).json({ message: "Token not found" });
		}

		jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			async (err, decoded) => {
				const user = await User.findOne({ email: decoded.email });
				user.refreshToken = "";
				user.save();
			}
		);

		res.status(200).json({message:"User logged out successfully"});
	} catch (err) {
		console.log(err);
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

export const resetPassword = async (req, res) => {
	// 1. take email from user
	// 2. check if its a valid email address using joi
	// 3. find a user with that email in database
	// 4. generate a new token
	// 5. send email with link made with that token
	
	try {
		console.log(req.body);

		//Joi email check
		const { error } = resetPasswordJoi.validate(req.body);
		if (error) {
			console.log(error);
			return res.status(400).json({ message: error.details });
		}
		//find in db
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			console.log("User not found");
			return res.status(400).json({
				message: `There is no user registered with the email: ${req.body.email} `,
			});
		}
		console.log("User found:", user);
		console.log(process.env.PASSWORD_TOKEN_SECRET);
		// generate a token using jwt
		const resetToken = jwt.sign({email:req.body.email},process.env.PASSWORD_TOKEN_SECRET,{"expiresIn":'5m'})
		
		const link = `hresque.vercel.app/password-reset?token=${resetToken}`;
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
		  link: `https://hresque.vercel.app/password-reset?token=${resetToken}`,
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