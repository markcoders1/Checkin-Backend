// console.log("starting Employee Attendance Management app")

import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env",
});


// Database connection
connectDB()
    .then(() => {
        app.on("Error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });
        app.listen(process.env.PORT || 6006, () => {
            console.log(`Server is running at port: http//:localhost:${process.env.PORT}/`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed !!", err);
    });
