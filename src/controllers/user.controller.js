import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";




const registerUser = asyncHandler(async (req, res) => {
    // algorithm:
    //step 1: get user details from frontend
    //step 2: check if username is empty 
    //step 3: check if user already exists in database : email should be unique

    //step 6: create user object - create entry in db
    //step 7: user banane k baad response ayega us response se password hata do password show ni karana,
    //remove password from response
    //step 8: check response aya hai ya nahi, user create hwa ya nahi
    //step 9: if created then return response otherwise error bhejdo

    // 1
    const { fullName, email,  password } = req.body;
    console.log("Email yeh agyi hai: " , email);

    // 2
    if (
        // check k koi empty input to nahi agya, agar koi empty hai to error bhejo
        [fullName, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // 3
    const existedUser = await User.findOne({
        //User can communicate with database on our behalf
        $or: [{ email }], //AND gate aur OR gate wala OR operator hai, koi aik value bhi mili to returns true

    });
    if (existedUser) {
        // If koi user esa exist karta hai to error bhejdo
        console.log("existedUserWithEmail: ", existedUser);
        throw new ApiError(409, "Error: Email already used");
    }

    //6
    const user = await User.create({
        fullName,
        email: email?.toLowerCase(),
        password,

    });
    // checking User create hwa ya nahi, agar hwa to uski _id hogi
    //( step 7 bhi yahin hojaega id se select karke)
    const createdUser = await User.findById(user._id).select(
        "-password"
    );
    // 8
    if (!createdUser) {
        throw new ApiError(
            500,
            "something went wrong while registering a new user"
        );
    }

    // 9, will return response using ApiResponse.js
    //
    return res.status(201).json(
        //Json response bhejenge, matlab JavaScript Object Notation style mein
        new ApiResponse(200, createdUser, "User registered Successfully") // new object
    );
});



export {
    registerUser,
    // loginUser,
    // logoutUser,
    // refreshAccesToken,
    // changeCurrentPassword,
    // getCurrentUser,
    // updateAccountDetails,
    // updateUserAvatar,
    // updateUserCoverImage,
    // getUserChannelProfile,
    // getWatchHistory,
};
