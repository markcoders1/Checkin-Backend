
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

logSchema.methods.logger =  async (userId, deviceId, logType) => {
    // a function to create user logs, 
        console.log("USERID : ", userId);
        console.log("DEVICEID: ", deviceId);
        console.log("LOGTYPE: ", logType);
    
    
        // Ensure deviceId is always treated as an array
        const deviceIds = Array.isArray(deviceId) ? deviceId : [deviceId];
    
        // Iterate over each deviceId and create a log
        for (const id of deviceIds) {
            try {
                // Log creation for each deviceId
                await Log.create({
                    userId: userId,
                    deviceId: id,
                    logType: logType
                });
            } catch (error) {
                console.error(`Error creating ${logType} log for deviceId ${id}:`, error);
                // Handle error as needed
            }
        }
    };

export const Log = mongoose.model("Log", logSchema);
