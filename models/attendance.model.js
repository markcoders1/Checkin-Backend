import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    date:{
        type:Number,
        default:new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 1).valueOf()
    },
    checkIn:{
        type:Number,
    },
    checkOut:{
        type:Number,
    },
    breakIn:{
        type:Array,
        default: []
    },
    breakOut:{
        type:Array,
        default: []
    },
    breakDuration:{
        type:Number,
        default: 0
    },
    totalDuration:{
        type:Number,
    },
    netDuration:{
        type:Number,
    },
    flag:{
        type :Boolean,
        default:false
    }
})


export const Attendance = mongoose.model("Attendance", AttendanceSchema);