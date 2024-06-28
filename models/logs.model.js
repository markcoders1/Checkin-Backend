
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

logSchema.methods.logger = async function(userId, deviceIds, logType) {
    try {
        // Ensure deviceIds is always treated as an array
        const ids = Array.isArray(deviceIds) ? deviceIds : [deviceIds];

        // Iterate over each deviceId and create a log
        for (const id of ids) {
            await this.model('Log').create({
                userId: userId,
                deviceId: id,
                logType: logType
            });
            console.log(`"${logType}" log created for deviceId: ${id}`);
        }
    } catch (error) {
        console.error(`Error creating ${logType} logs:`, error);
        throw error;
    }
};

export const Log = mongoose.model("Log", logSchema);
