
import mongoose from "mongoose"


const logSchema = new mongoose.Schema({
	userId:{
        type:String,
        required:true,
    },
    deviceId: {
		type: String,
		required: true,
	},
    logType: {
        type: String,
        required:true
    },
    latitude:{
        type: String
    },
    longitude:{
        type:String
    }


},
	{ timestamps: true }
)

logSchema.methods.logger = async function (userId, deviceIds, logType) {
	try {
		// Ensure deviceIds is always treated as an array
		const ids = Array.isArray(deviceIds) ? deviceIds : [deviceIds];

		// Get current count of logs for the user
		const logCount = await this.model("Log").countDocuments({ userId });

		// If log count exceeds 100, delete the oldest logs for this user
		if (logCount >= 10) {
			const oldestLogs = await this.model("Log").find(
				{ userId },
				{},
				{ sort: { createdAt: 1 }, limit: logCount - 9 }
			);
			for (const log of oldestLogs) {
				await log.remove();
                await log.save()
				console.log(`Oldest log removed for userId ${userId}`);
			}
		}

		// Iterate over each deviceId and create a log
		for (const id of ids) {
			await this.model("Log").create({
				userId: userId,
				deviceId: id,
				logType: logType,
			});
			console.log(`"${logType}" log created for deviceId: ${id}`);
		}
	} catch (error) {
		console.error(`Error creating ${logType} logs:`, error);
		throw error;
	}
};

export const Log = mongoose.model("Log", logSchema);
