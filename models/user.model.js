/*
Complete Functionality:

1. User k models mein 
FullName:
Email:                     //username nahi rakh rha no need
Password:


2. Controllers and routes
/signup     : controller will be for registering a new user: 
/login      : for user login, will lead to home page where he can change password or checkin/checkout or log out (will require registered user)

// below all controllers will require login to access

/logout     :  
/changeUser : this controller will be for editing user details such as changing password or full name or timings 
/checkin    : pressing the checkin button will trigger this
/checkout   : pressing the checkout button will trigger this

3. make an authenticator middleware VerifyJWT which will see if user is logged in or not and npm install jwt library

4. password will be  encrypted before saving using bcrypt library 

5. see how to add a admin account/route like in linton so that an admin can see everyone's attendance and see who is late etc
*/

/*

Future functionality:

look into how to make it easier to Check in and check out using fingerprint or a QR Code scanner 

add graphs for every user to see who's spending average 9 hours/day (excluding weekends and holidays)
add usual timings of users in model maybe
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
    refreshToken: {
        type: String,
    },
    attendance: [{
        checkIn: Date,
        checkOut: Date,
        duration: String
    }]
},
{ timestamps: true }
); 
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});




//custom method banaya hai
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function () {
    //jwt ki documentation parho, iska sign method karta hai token generate
    return jwt.sign(
        {
            _id: this.ObjectId,
            email: this.email,
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
// yeh User database se direct contact kar sakta hai because it is made with mongoose.