
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

export const Log = mongoose.model("Log", logSchema);
