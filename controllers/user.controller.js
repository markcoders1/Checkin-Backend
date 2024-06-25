import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { Attendance } from "../models/attendance.model.js";
import { transporterConstructor, generateOTP } from "../utils/email.js";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { unixTo24Time, unixToDate, unixToTime } from "../utils/utils.js";
import * as fs from "fs";
import { uppercaseFirstLetter } from "../utils/utils.js";

// export const test=async (req,res)=>{
//   try{

//     let users = await User.find();

//     users = await users.map(async (user)=>{
//       user.companyId="testUser"
//       user.active=true
//       await user.save()
//     })

//     console.log('User found:', users);
//     const testItem=users
//     console.log(testItem)
//     res.status(200).json({testItem})
//   }catch(err){
//     console.log(err)
//   }
// }

export const test = async (req, res) => {
	try {
		return res.status(200).json({ message: "Hello World" });
	} catch (err) {
		console.log(err);
	}
};

export const checkInOrCheckOut = async (req, res) => {
	try {
		let user = await User.findById(req.user.id);
		console.log(user);
		const status = user.status;

		if (status === "checkout") {
			// check in
			const attendance = await Attendance.findOne({
				userId: req.user.id,
				date: new Date(
					new Date().getFullYear(),
					new Date().getMonth(),
					new Date().getDate(),
					1
				).valueOf(),
			});
			if (attendance)
				return res.status(400).json({
					message: "you've already checked in and out today",
				});
			Attendance.create({
				userId: req.user.id,
				checkIn: new Date().valueOf(),
				date: new Date(
					new Date().getFullYear(),
					new Date().getMonth(),
					new Date().getDate(),
					1
				).valueOf(),
			});
			user.status = "checkin";
			await user.save();
			return res.status(200).json({
				message: "checked in successfully",
				status: user.status,
			});
		} else if (status === "checkin") {
			//calculate totalDuration and netduration and checkout
			const array = await Attendance.find({
				userId: req.user.id,
				date: { $gte: new Date(new Date() - 1 * 60 * 60 * 24 * 1000) },
			});
			const objToChange = array[array.length - 1];
			// const duration=(new Date().valueOf())-objToChange.checkIn
			// if(duration<1000*60*60*2){
			//   res.status(403).json({message:"Please consult Management about leaving early"})
			//   return;
			// }

			objToChange.checkOut = new Date().valueOf();
			objToChange.totalDuration =
				objToChange.checkOut - objToChange.checkIn;

			objToChange.netDuration =
				objToChange.totalDuration - objToChange.breakDuration;

			user.status = "checkout";
			objToChange.save();
			user.save();
			return res.status(200).json({
				message: "checked out successfully",
				status: user.status,
			});
		} else if (status === "inbreak") {
			// break out:
			const array = await Attendance.find({
				userId: req.user.id,
				date: { $gte: new Date(new Date() - 1 * 60 * 60 * 24 * 1000) },
			});

			let objToChange = array[array.length - 1];
			//put new time value in breakIn which is inside this object
			//if array is empty, simply push else append at the end
			objToChange.breakOut.push(new Date().valueOf());
			const breakOutTime =
				objToChange.breakOut[objToChange.breakOut.length - 1];
			const breakInTime =
				objToChange.breakIn[objToChange.breakIn.length - 1];
			objToChange.breakDuration =
				breakOutTime - breakInTime + objToChange.breakDuration;
			user.status = "checkin";
			await user.save();
			await objToChange.save();
			//checking out
			objToChange.checkOut = new Date().valueOf();
			const duration = objToChange.checkOut - objToChange.checkIn;

			// if(duration<1000*60*60*2){
			//   res.status(403).json({message:"Please consult Management about leaving early"})
			//   return;
			// }

			objToChange.totalDuration = duration;
			objToChange.netDuration =
				objToChange.totalDuration - objToChange.breakDuration;
			user.status = "checkout";
			await user.save();
			await objToChange.save();
			return res.status(200).json({
				message: "break out and checkout Successfully",
				status: user.status,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: "Something went wrong while checkin/checkout operation",
			error,
		});
	}
};
export const breakUser = async (req, res) => {
	try {
		let user = await User.findById(req.user.id);

		const array = await Attendance.find({
			userId: req.user.id,
			date: { $gte: new Date(new Date() - 1 * 60 * 60 * 24 * 1000) },
		});
		const status = user.status;
		console.log("Status: ", user.status);

		if (status === "checkout") {
			return res.status(400).json({
				message: "User Must be Checked In to access Break",
				status,
			});
		}

		if (status === "checkin") {
			//break in:

			//get last object in attendance array
			const objToChange = array[array.length - 1];
			//put new time value in breakIn which is inside this object
			objToChange.breakIn.push(new Date().valueOf());
			//change status to inbreak
			user.status = "inbreak";
			//save
			await user.save();
			await objToChange.save();
			return res.status(200).json({
				message: "break in successfully",
				objToChange,
				status: user.status,
			});
		} else if (status === "inbreak") {
			// break out:

			//get last object in attendance array
			let objToChange = array[array.length - 1];
			//put new time value in breakIn which is inside this object
			//if array is empty, simply push else append at the end
			objToChange.breakOut.push(new Date().valueOf());
			const breakOutTime =
				objToChange.breakOut[objToChange.breakOut.length - 1];
			const breakInTime =
				objToChange.breakIn[objToChange.breakIn.length - 1];
			objToChange.breakDuration =
				breakOutTime - breakInTime + objToChange.breakDuration;

			user.status = "checkin";
			await user.save();
			await objToChange.save();
			return res.status(200).json({
				message: "break out Successfully",
				objToChange,
				status: user.status,
			});
		}
	} catch (error) {
		res.status(500).json({
			message: "Something went wrong in Break function",
			error,
		});
	}
};

export const getUserAttendance = async (req, res) => {
	try {
		const date = new Date();
		let { from, to } = req.query;

		if (!from) {
			from = new Date(date.getFullYear(), date.getMonth(), 1).valueOf();
		}
		if (!to) {
			to = from + 2678400000;
			if (to > date.valueOf()) {
				to = date.valueOf();
			}
		} else if (to - from > 2678400000) {
			to = from + 2678400000;
		}

		const result = await Attendance.find({
			userId: req.user.id,
			date: { $gte: from, $lte: to },
		});
		res.status(200).json({ result });
	} catch (err) {
		console.log(err);
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
	// 1. take email from user (req.body)
	// 2. first check if there is a user with that email in database
	// 3. generate a new OTP,
	// 4. set that otp as new password
	// 5. send otp to user through email
	try {
		console.log(req.body);

		///Joi email check
		const { error } = resetPasswordJoi.validate(req.body);
		if (error) {
			console.log(error);
			return res.status(400).json({ message: error.details });
		}

		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			console.log("User not found");
			return res.status(400).json({
				message: `There is no user registered with the email: ${req.body.email} `,
			});
		}
		console.log("User found:", user);

		const emailToSendOTP = user.email;
		const otp = generateOTP();
		console.log(`Trying to send OTP "${otp}" to ${emailToSendOTP} now`);

		// Email defined here
		const theEmail = {
			from: process.env.APP_EMAIL,
			to: emailToSendOTP,
			subject: "OTP",
			text: `This is an automated Email for ${emailToSendOTP}. Your new password has been set to ${otp}`,
		};
		console.log(theEmail);
		//send email
		const transporter = transporterConstructor();

		await transporter.sendMail(theEmail, (error) => {
			if (error) return res.status(400).json({ "Email not sent": error });
		});

		console.log("Email with OTP has been sent successfully");

		//change password after email is sent with code
		user.password = otp;
		await user.save({ validateBeforeSave: false });
		console.log("password has been reset. ");
		res.status(200).json({
			message:
				"Email with OTP sent successfully and password has been reset",
		});
	} catch (error) {
		console.error("Error occurred while sending OTP email: ", error);
		res.status(400).json({ error });
	}
};

const changePasswordJoi = Joi.object({
	oldPassword: Joi.string()
		.pattern(
			new RegExp(
				"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,30}$"
			)
		)
		.required()
		.messages({
			"string.pattern.base":
				"oldPassword must be between 6 and 30 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
			"any.required": "Password is required.",
		}),
	newPassword: Joi.string()
		.pattern(
			new RegExp(
				"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,30}$"
			)
		)
		.required()
		.messages({
			"string.pattern.base":
				"newPassword must be between 6 and 30 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
			"any.required": "Password is required.",
		}),
});

export const changeCurrentPassword = async (req, res) => {
	try {
		const { oldPassword, newPassword } = req.body;
		if (!oldPassword || !newPassword) {
			return res.status(400).json({ message: "incomplete data" });
		}
		///Joi oldPassword and newPassword check
		const { error } = changePasswordJoi.validate(req.body);
		if (error) {
			console.log(error);
			return res.status(400).json({ message: error.details });
		}

		const user = await User.findById(req.user?._id);

		const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
		if (!isPasswordCorrect) {
			return res
				.status(400)
				.json({ message: "oldPassword is incorrect" });
		}
		user.password = newPassword;

		await user.save({ validateBeforeSave: false });
		return res
			.status(200)
			.json({ message: "password changed successfully" });
	} catch (error) {
		res.status().json({
			message: "Server Error: could not change password",
			error: error.message,
		});
	}
};

export const getUser = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select(
			"-password -_id -__v"
		);
		return res.status(200).json({ user });
	} catch (error) {
		console.log(error);
		res.status(400).json({ error });
	}
};

export const getStatus = async (req, res) => {
	try {
		console.log(req.user.id);
		const user = await User.findById(req.user.id);
		console.log(user.status);
		return res.status(200).json({ status: user.status });
	} catch (error) {
		console.log(error);
		res.status(400).json({ error });
	}
};

export const sendEmail = async (req, res) => {
	try {
		console.log("Trying to send Email now");
		const theEmail = {
			from: process.env.APP_EMAIL,
			to: "zaidb02@approich.com",
			subject: "example application for vacation",
			text: "Hello i want to go for a 100 year long vacation on mars",
		};
		console.log(theEmail);

		const transporter = transporterConstructor();
		// const info = await transporter.sendMail(theEmail);

		await transporter.sendMail(theEmail, (error) => {
			if (error) return res.status(400).json({ "Email not sent": error });
		});

		console.log("Email has been sent successfully");
		res.status(200).json({ message: "Email sent successfully" });
	} catch (error) {
		console.error("Error occurred while sending email: ", error);
		res.status(400).json({ error });
	}
};

export const getAttendancePDF = async (req, res) => {
	try {
		let { from, to } = req.query;
		let userId = "";
		const date = new Date();
		let user;

		if (!from) {
			from = new Date(date.getFullYear(), date.getMonth(), 1).valueOf();
		}
		if (!to) {
			to = from + 2678400000;
			if (to > date.valueOf()) {
				to = date.valueOf();
			}
		} else if (to - from > 2678400000) {
			to = from + 2678400000;
		}

		if (!userId) {
			userId = req.user.id;
			user = req.user;
		} else {
			user = await User.findById(userId);
			if (!user)
				return res.status(400).json({ message: "user not found" });
		}

		const result = await Attendance.find({
			userId: userId,
			date: { $gte: from, $lte: to },
		});
		const numberOfEntries = result.length;

		const doc = new jsPDF();

		const columns = [
			"Date",
			"Check in",
			"Check Out",
			"total Duration",
			"Break Duration",
			"Net Duration",
		];
		const rows = result.map((e) => {
			return [
				unixToDate(e.date),
				unixToTime(e.checkIn),
				unixToTime(e.checkOut),
				unixTo24Time(e.totalDuration),
				unixTo24Time(e.breakDuration),
				unixTo24Time(e.netDuration),
			];
		});

		const logoData = fs.readFileSync("utils/ff-01.png", "base64");
		doc.addImage(logoData, "PNG", 85, 0, 30, 30);

		doc.setFontSize(10);

		doc.text(
			`User: ${user.firstName} ${user.lastName} / ${user.companyId}`,
			14,
			28
		);

		doc.setFontSize(18);

		doc.text(`Attendance`, 14, 36);

		doc.autoTable({
			head: [columns],
			body: rows,
			startY: 40,
		});

		let finalY = doc.lastAutoTable.finalY + 10;

		const totalDuration = result
			.map((e) => {
				if (e.totalDuration == undefined) {
					return 0;
				} else {
					return e.totalDuration;
				}
			})
			.reduce((p, c) => p + c);

		const breakDuration = result
			.map((e) => {
				if (e.breakDuration == undefined) {
					return 0;
				} else {
					return e.breakDuration;
				}
			})
			.reduce((p, c) => p + c);

		const netDuration = result
			.map((e) => {
				if (e.netDuration == undefined) {
					return 0;
				} else {
					return e.netDuration;
				}
			})
			.reduce((p, c) => p + c);

		const columns2 = ["total Duration", "Break Duration", "Net Duration"];
		const rows2 = [
			[
				unixTo24Time(totalDuration / numberOfEntries),
				unixTo24Time(breakDuration / numberOfEntries),
				unixTo24Time(netDuration / numberOfEntries),
			],
		];
		doc.text("Averages", 14, finalY);

		doc.autoTable({
			head: [columns2],
			body: rows2,
			startY: finalY + 5,
		});

		finalY = doc.lastAutoTable.finalY;

		doc.setFontSize(10); // Set font size
		doc.setTextColor(112, 128, 144); // Set text color (RGB: blue)

		doc.text(
			"*This is a computer generated file, for any issues, please contact management",
			14,
			finalY + 5
		);

		const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
		const filenameDate = new Date(from);
		console.log(filenameDate);

		const filename = `${
			req.user.companyId
		}-${filenameDate.getDate()}-${filenameDate.getMonth()}-${filenameDate.getFullYear()}`;

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=${filename}.pdf`
		);
		res.setHeader('hi','ho')
		res.status(200).send(pdfBuffer);
	} catch (err) {
		return res.status(400).json({
			message:
				"something went wrong while creating your pdf, please contact management",
			error: err,
		});
	}
};

export const isAdmin = async (req, res) => {
	res.status(200).json({ isAdmin: req.user.role });
};

const updateDetailsJoi = Joi.object({
	firstName: Joi.string().max(30).messages({
		"string.empty": "First name cannot be empty.",
		"string.max": "User name should not exceed 30 characters.",
	}),

	lastName: Joi.string().max(30).messages({
		"string.empty": "Last name cannot be empty.",
		"string.max": "User name should not exceed 30 characters.",
	}),

	DOB: Joi.string()
		.max(30)
		.regex(/^((?:19|20)\d\d)-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/)
		.messages({
			"string.max": "DOB should not exceed 30 characters.",
			"string.pattern.base": "enter a valid DOB ex:(YYYY-MM-DD)",
		}),

	CNIC: Joi.string()
		.regex(/^[0-9]{13}$/)
		.length(13)
		.messages({
			"string.length": "enter a valid CNIC ex:(4230100000000)",
			"string.pattern.base": "enter a valid CNIC ex:(4230100000000)",
		}),

	phone: Joi.string()
		.regex(/^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/)
		.messages({
			"string.pattern.base": "enter a valid Pakistani Phone number",
		}),
}).or("firstName", "lastName", "CNIC", "DOB", "phone");

export const updateProfile = async (req, res) => {
	try {
		const { firstName, lastName, DOB, CNIC, phone } = req.body;
		console.log("req.body: ", req.body);
		console.log("req.user: ", req.user);

		const { error } = updateDetailsJoi.validate(req.body);
		if (error) {
			console.log(error);
			return res.status(400).json({ message: error.details });
		}

		if (firstName !== undefined) {
			firstName = uppercaseFirstLetter(firstName);
			console.log("updating first name");
			req.user.firstName = firstName;
		}
		if (lastName !== undefined) {
			lastName = uppercaseFirstLetter(lastName);
			console.log("updating last name");
			req.user.lastName = lastName;
		}
		if (DOB !== undefined) {
			console.log("updating DOB");
			req.user.DOB = DOB;
		}
		if (CNIC !== undefined) {
			console.log("updating CNIC");
			req.user.CNIC = CNIC;
		}
		if (phone !== undefined) {
			console.log("updating phone");
			req.user.phone = phone;
		}

		await req.user.save();

		return res
			.status(200)
			.json({ message: "Account details updated successfully" });
	} catch (err) {
		console.log(err);
		return res.status(400).json({
			message: "something went wrong while updating user profile",
		});
	}
};
