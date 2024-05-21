/*
Complete Functionality:

1. User k models mein 
FullName:
Email:                     //username nahi rakh rha no need
Password:
Usual office timings example 11AM - 8PM

2. Controllers and routes
1st /signup     : controller will be for registering a new user: 
2nd /checkin    : for user login (will require registered user)
3rd /checkout   :  (will require checked in user)
4th /changeUser : this controller will be for editing user details such as changing password or full name or timings (will require logged in user)

3. make an authenticator middleware VerifyJWT which will see if user is logged in or not and npm install jwt library

4. password will be  encrypted before saving using bcrypt library 

5. see how to add a admin account/route like in linton so that an admin can see everyone's attendance and see who is late etc
*/

/*

Future functionality:

look into how to make it easier to Check in and check out using fingerprint or a QR Code scanner 

add graphs for every user to see who's spending average 9 hours/day (excluding weekends and holidays)

add integrate work from home scenario 

*/


import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },

    attendance: [{
        checkIn: Date,
        checkOut: Date
    }]
},
{ timestamps: true }
); 
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); //agar modify ni hwa password to direct return

    this.password = await bcrypt.hash(this.password, 10);
    next();
});




//custom method banaya hai
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this.ObjectId,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};



userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this.ObjectId,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);






