import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const registerUser =async (req, res) => {
    const { fullName, email, password } = req.body;
    if (
      [fullName, email, password].some((field) => field?.trim() === "")
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
      console.log("existedUser: ", existedUser);
      throw new ApiError(409, "Error: Email already used");
    }
  
    //6
    const user = await User.create({
      fullName,
      email: email?.toLowerCase(),
      password,
    });
  
    const createdUser = await User.findById(user._id).select("-password");
    // 8
    if (!createdUser) {
      throw new ApiError(
        500,
        "something went wrong while registering a new user"
      );
    }
    return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully") // new object
    );
  };