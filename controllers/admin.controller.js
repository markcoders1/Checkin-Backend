import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";
import { uppercaseFirstLetter } from "../utils/utils.js";
import { jsPDF } from "jspdf";
import { unixToDate, unixToTime, unixTo24Time } from "../utils/utils.js";
import fs from "fs";

export const registerUser = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			res.status(401).json({ message: "Unauthorized" });
		}

		const { error } = registerUserJoi.validate(req.body);
		if (error) {
			console.log(error);
			return res.status(400).json({ message: error.details });
		}
		req.body.fullName = uppercaseFirstLetter(req.body.fullName);

		const existedUser = await User.findOne({ email: req.body.email });
		if (existedUser) {
			return res.status(400).json({ message: "user already exists" });
		}

		const user = await User.create({ ...req.body, password:"admin1" });

		return res.status(201).json({
			createdUser: user,
			message: "User registered Successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
};

export const getUserAttendance = async (req, res) => {
	try {
		const date = new Date();
		let { from, to, userId } = req.query;

		if (!userId) {
			return res.status(400).json({ message: "please enter a userId" });
		}
		if (!from) {
			from = new Date(date.getFullYear(), date.getMonth(), 1).valueOf();
		}
		if (!to) {
			to = from + 2629746000;
			if (to > date.valueOf()) {
				to = date.valueOf();
			}
		}
		const result = await Attendance.find({
			userId,
			date: { $gte: from, $lte: to },
		});
		return res.status(200).json({ result });
	} catch (err) {
		console.log(err);
	}
};

export const getAllUsers = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			res.status(401).json({ message: "Unauthorized" });
		}

		const result = await User.find().select("-password -refreshToken -__v");
		console.log(result);
		return res.status(200).json(result);
	} catch (error) {
		console.log(error);
		res.status(400).json({ error });
	}
};

export const getUser = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			res.status(401).json({ message: "Unauthorized" });
		}
		const userId = req.query.id;
		if (typeof userId !== "string") {
			console.log("ID must be string");
			return res.status(401).json({ message: "ID must be string" });
		}
		const user = await User.findById(userId);
		if (!user) {
			console.log("user does not exist");
			return res.status(401).json({ message: "user does not exist" });
		}
		console.log(user);
		return res.status(200).json({ user: user });
	} catch (error) {
		console.log(error);
		res.status(400).json({ error });
	}
};

// // REDUNDANT BECAUSE GETUSER DOES RETURN DEVICES AS WELL
// export const getUserDevices = async (req, res) => {
// 	try {
// 		if (req.user.role !== "admin") {
// 			res.status(401).json({ message: "Unauthorized" });
// 		}
// 		const userId = req.query.id;
// 		if (typeof userId !== "string") {
// 			console.log("ID must be string");
// 			return res.status(401).json({ message: "ID must be string" });
// 		}
// 		const user = await User.findById(userId);
// 		if (!user) {
// 			console.log("user does not exist");
// 			return res.status(401).json({ message: "user does not exist" });
// 		}
// 		console.log(user);
// 		return res.status(200).json(user.devices);
// 	} catch (error) {
// 		return res.status(400).json({
// 			message:
// 				"something went wrong while getting specific user's logged in devices",
// 				error,
// 			});
// 		}
// 	};

export const deleteUser = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			res.status(400).json({ message: "Unauthorized" });
		}
		const userId = req.query.id;
		if (typeof userId !== "string") {
			console.log(userId);
			console.log("ID must be string");
			return res.status(400).json({ message: "ID must be string" });
		}
		const user = await User.findById(userId);
		if (!user) {
			console.log("user does not exist");
			return res.status(400).json({ message: "user does not exist" });
		}
		console.log("User detected: ", user);

		//deleting user
		const deletedUser = await User.deleteOne({ _id: userId });
		console.log("Deleted user: ", deletedUser);

		//deleting user attendance
		const deletedAttendance = await Attendance.deleteMany({
			userId: userId,
		});
		console.log("Deleted user Attendance: ", deletedAttendance);

		return res.status(200).json({ message: "User deleted Successfully" });
	} catch (error) {
		console.log(error);
		res.status(400).json({ error });
	}
};

export const getAttendancePDF = async (req, res) => {
	try {
		let { from, to, userId } = req.query;
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
		})||[{}];

		
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

		doc.text(`User: ${user.fullName} / ${user.companyId}`, 14, 28);

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
			.reduce((p, c) => p + c,0);

		const breakDuration = result
			.map((e) => {
				if (e.breakDuration == undefined) {
					return 0;
				} else {
					return e.breakDuration;
				}
			})
			.reduce((p, c) => p + c,0);

		const netDuration = result
			.map((e) => {
				if (e.netDuration == undefined) {
					return 0;
				} else {
					return e.netDuration;
				}
			})
			.reduce((p, c) => p + c,0);

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
		}.${filenameDate.getDate()}-${filenameDate.getMonth()}-${filenameDate.getFullYear()}`;

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=${filename}.pdf`
		);
		return res.status(200).send(pdfBuffer);
	} catch (err) {
		return res.status(400).json({
			message:
				"something went wrong while creating your pdf, please contact management",
			error: err,
		});
	}
};

export const toggleUserAccount = async (req, res) => {
	try {
		let { userId } = req.query;

		const user = await User.findById(userId);
		user.active = !user.active;
		await user.save();
		return res
			.status(200)
			.json({ message: "user account toggled successfully" });
	} catch (error) {
		return res.status(400).json({
			message: "something went wrong, please contact management",
		});
	}
};

export const autoCheck = async () => {
	try {
		console.log("autoCheck start");
		const usersCheckedIn = await User.find({ status: "checkin" });
		const usersInBreak = await User.find({ status: "inbreak" });
		// merge
		const users = usersCheckedIn.concat(usersInBreak);
		users.map(async (user) => {
			const status = user.status;
			//get user attendance by ID
			const userAttendance = await Attendance.find({
				userId: user.id,
				date: { $gte: new Date(new Date() - 1 * 60 * 60 * 24 * 1000) },
			});
			const lastAttendance = userAttendance[userAttendance.length - 1];
			//get duration
			const currentTime = new Date().valueOf();
			const duration = currentTime - lastAttendance.checkIn;

			if (duration > 15 * 60 * 60 * 1000) {
				//flag
				lastAttendance.flag = true;
				if (status == "inbreak") {
					//breakout first if inbreak
					lastAttendance.breakOut.push(new Date().valueOf());
					const breakOutTime =
						lastAttendance.breakOut[
							lastAttendance.breakOut.length - 1
						];
					const breakInTime =
						lastAttendance.breakIn[
							lastAttendance.breakIn.length - 1
						];
					lastAttendance.breakDuration =
						breakOutTime -
						breakInTime +
						lastAttendance.breakDuration;
					user.status = "checkin";
					console.log("user BreakOut Successfully");
				}
				//checkout
				lastAttendance.checkOut = new Date().valueOf();
				lastAttendance.totalDuration =
					lastAttendance.checkOut - lastAttendance.checkIn;
				lastAttendance.netDuration =
					lastAttendance.totalDuration - lastAttendance.breakDuration;
				user.status = "checkout";
				await lastAttendance.save();
				await user.save();
				console.log("User CheckOut Successfully ", user?.fullName);
			}
		});
		console.log(JSON.parse({ message: "auto-checked successfully" }));
	} catch (error) {
		return console.log(
			JSON.parse({ message: "something went wrong while auto-checking" })
		);
	}
};

// Function to update specific User's details with the values provided by Admin
const updateObject = (target, updates) => {
	for (const key in updates) {
		if (updates.hasOwnProperty(key)) {
			// Skip the _id update
			if (key === "id") {
				continue;
			}
			target[key] = updates[key];
		}
	}
};

export const updateAnyProfile = async (req, res) => {
	try {
		const { error, value } = updateAnyProfileJoi.validate(req.body);
		if (error) {
			console.log(error);
			return res.status(400).json({ message: error.details });
		}
		// Filter out the fields that are present in the request body
		const presentFields = Object.keys(value).filter(
			(key) => value[key] !== undefined
		);

		// Create an object with only the present fields
		const updateFields = presentFields.reduce((acc, key) => {
			acc[key] = value[key];
			return acc;
		}, {});
		console.log("valid details detected: ", updateFields);

		// find user by id
		const user = await User.findById({
			_id: updateFields.id,
		}).select("-password -refreshToken -__v -active -status -role -image");

		//update user
		updateObject(user, updateFields);
		console.log("User: ", user);
		await user.save();

		return res.status(200).json({
			message: "Specific User details updated Successfully",
			user,
		});
	} catch (error) {
		return res.status(400).json({
			message:
				"something went wrong while updating specific user profile",
			error,
		});
	}
};
