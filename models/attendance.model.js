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
        required:true
    },
    checkOut:{
        type:Number,
        required:true
    },
    breakIn:{
        type:Number,
        required:true
    },
    breakOut:{
        type:Number,
        required:true
    },
    breakDuration:{
        type:Number,
        required:true
    },
    totalDuration:{
        type:Number,
        required:true
    },
    netDuration:{
        type:Number,
        required:true
    }
})


export const Attendance = mongoose.model("Attendance", AttendanceSchema);