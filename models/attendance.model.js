import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:new Date()
    },
    checkIn:{
        type:Number,
    },
    checkOut:{
        type:Number,
    },
    breakIn:{
        type:Number,
    },
    breakOut:{
        type:Number,
    },
    breakDuration:{
        type:Number,
    },
    totalDuration:{
        type:Number,
    },
    netDuration:{
        type:Number,
    }
})


export const Attendance = mongoose.model("Attendance", AttendanceSchema);