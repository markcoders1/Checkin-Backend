import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const logoutUser =async (req, res, next) => {
    try {
            await User.findByIdAndUpdate(
                req.user._id, // req.user will not be accessible without middleware verifyJWT
                {
                    $set: {
                        refreshToken: undefined,
                    },
                },
                {
                    new: true,
                }
            );
            const options = {
                httpOnly: true,
                secure: true,
            };
            return res
                .status(200)
                .clearCookie("accessToken")
                .clearCookie("refreshToken")
                .json({"message":"user logged out"});
        } catch (error) {
            res.json({error})
    }
};  
// a function that takes two Date() objects and 
/*
ToDo: change user schema to have month-wise object
ToDo: merge check in and check out apis
ToDo: have it so that only admins can create users 
*/

// a function that takes two Date() objects and
// and returns the value of duration between them as String (08:45:34)
const calculateDuration = (checkInTime, checkOutTime)=>{
    if (!checkInTime) {
        throw new Error("no check in time to calculate duration")
    };
    if (!checkOutTime) {
        throw new Error("no check out time to calculate duration")
    };

    //number of milliseconds between the date object and midnight January 1, 1970 UTC
    // difference calculate karne k lye dono ki value numbers me chahiye so that we can subtract

    const checkInTimeInMilliSeconds = checkInTime.valueOf();
    console.log("checkInTimeInMilliSeconds: ", checkInTimeInMilliSeconds);

    const checkOutTimeInMilliSeconds = checkOutTime.valueOf();
    console.log("checkOutTimeInMilliSeconds",checkOutTimeInMilliSeconds);

    //calculate their difference
    const durationInMilliseconds = checkOutTimeInMilliSeconds - checkInTimeInMilliSeconds
    console.log("durationInMilliseconds: ", durationInMilliseconds);
 
    // convert the duration from milliseconds to Hours and Minutes string format( "08:56:01" ) 
    // Convert milliseconds to hours, minutes, and seconds
    const millisecondsInAnHour = 1000 * 60 * 60;
    const millisecondsInAMinute = 1000 * 60;
    const millisecondsInASecond = 1000;
    
    const totalHours = Math.floor(durationInMilliseconds / millisecondsInAnHour);
    const totalMinutes = Math.floor((durationInMilliseconds % millisecondsInAnHour) / millisecondsInAMinute);
    const totalSeconds = Math.floor((durationInMilliseconds % millisecondsInAMinute) / millisecondsInASecond);
    
    // Format hours, minutes, and seconds to be two digits
    const hoursString = String(totalHours).padStart(2, '0');
    const minutesString = String(totalMinutes).padStart(2, '0');
    const secondsString = String(totalSeconds).padStart(2, '0');
    
    // Combine hours, minutes, and seconds into a digital clock format
    const formattedTime = `${hoursString}:${minutesString}:${secondsString}`;
    
    console.log(`Formatted Duration: ${formattedTime}`);

    return formattedTime
}

const generateAccessAndRefreshToken = async (userId) => {
  // call this method whenever you need to generate access and refresh token,
  // takes userId as parameter, returns the generated AccessToken and refreshToken

  try {
    const user = await User.findById(userId); // database se is ID ka user nikalo
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // User.model.js me jo refreshToken hai usme daldo generated refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // save bhi karlo changes
    // validate before save = false because otherwise password validate hoga,
    // required field hai user.model.js me password
    // aur yahan hamne koi password ni diya, validate hota to error ata

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(
      "Something went wrong while generating Access and Refresh Tokens"
    );
  }
};


const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    console.log("incomingRefreshToken : ");
    console.log(incomingRefreshToken);

    if (!incomingRefreshToken) {
      throw new Error("unauthorized request");
    }
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      console.log("decodedToken : ");
      console.log(decodedToken);

      const user = await User.findById(decodedToken?._id);

      console.log("user : ");
      console.log(user);

      if (!user) {
        throw new Error("Error: Invalid refresh token");
      }

      if (incomingRefreshToken !== user?.refreshToken) {
        throw new Error("Refresh token is expired or used");
      }

      const options = {
        httpOnly: true,
        secure: true,
      };

      const { accessToken, newRefreshToken } =
        await generateAccessAndRefereshTokens(user._id);

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json({
          accessToken,
          refreshToken: newRefreshToken,
          message: "Access token refreshed",
        });
  } catch (error) {
    res.status(401).json({error:error?.message || "Invalid refresh token"})
  }
};


//!email not found error not yet implemented
const loginUser =async (req, res) => {
    // algorithm
    // 1. req.body se data lao
    // 2. email hai ya nahi check
    // 3. find the user
    // 3.5 return error if cant find the user
    // 4. password check
    // 5. generate and send access and refresh token
    // 6. send cookie

    // 1.
   try {
     const { email, password } = req.body;
 
     // 2.
     if (!email) {
        throw new Error("Email is required");
     }
     console.log("logged in Email: ", email);
 
     // 3. database me find karen dono, return jo pehle mila
     const user = await User.findOne({
        $or: [{ email }],
     });
 
     // 3.5 agar database me nahi mila matlab is username/email ka koi user database me nahi hai
     if (!user) throw new Error("Failed to login, User with this Email does not exist");
 
     // 4
     const isPasswordValid = await user.isPasswordCorrect(password);
     if (!isPasswordValid) {
         throw new Error("Invalid Password");
     }
 
     // 5.
     const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
         user._id
     );
 
     // 6. cookie
 
     const loggedInUser = await User.findById(user._id).select(
         "-password -refreshToken"
     );
 
     // cookies bhejte waqt uske kuch options design karte parte hain (object hota hai)
     const options = {
         httpOnly: true,
         secure: true,
     };
     return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", refreshToken, options)
          .json({
            "user":loggedInUser,
            accessToken,
            refreshToken
        })
   } catch (error) {
    res.status(500).json({
      "message":"login failed",
      error
    })
   }
};

const test=async (req,res)=>{
  try{
    const testItem=Number(new Date().getFullYear())
    console.log(testItem)
    res.status(200).json({testItem})
  }catch(err){
    console.log(err)
  }
}

//! month end edge case
const checkInOrCheckOut = async (req,res) =>{
  try {
        let user = await User.findById(req.user.id);
        const month="2024-06"
        // const month = new Date().toISOString().slice(0,7)
        console.log(req.user.id)
        let UserAttendance = await Attendance.findOne({userId:req.user.id,month:month})

        const status=user.status

        
        let prevUserAttendance
        let newMonthFlag=false
        let objectArray

        if (!UserAttendance){
          UserAttendance=await Attendance.create({userId:req.user.id})
          objectArray=UserAttendance.attendance
          
          if(status==="checkin"){
            let newMonth=new Date().getMonth()+1
            let year = Number(new Date().getFullYear())
            
            if(newMonth==1){
              newMonth=12
              year=new Date().getFullYear()-1
            }
            newMonth=String(newMonth-1)
            const lastMonth=`${year}-${newMonth.length==1?`0${newMonth}`:newMonth}`
            prevUserAttendance=await Attendance.findOne({userId:req.user.id,month:lastMonth})
            
            objectArray=prevUserAttendance.attendance
            newMonthFlag=true

          }
        }else{
          objectArray=UserAttendance.attendance
        }

        UserAttendance.findOne()

        if(status==="checkout"){
          UserAttendance.attendance.push({ checkIn: new Date().valueOf()});
          user.status="checkin"
          await user.save()
          await UserAttendance.save()
          return res.status(200).json({"message":"checked in successfully"})
        }else if(status==="checkin"){
          console.log("obj array",objectArray)
          const outTime=objectArray[objectArray.length-1].checkOut=new Date().valueOf()
          const inTime=objectArray[objectArray.length-1].checkIn

          objectArray[objectArray.length-1].duration=outTime-inTime

          user.status="checkout"
          newMonthFlag?prevUserAttendance.save():UserAttendance.save()
          user.save()
          return res.status(200).json({"message":"checked out successfully"})

        }


    } catch (error) {
      console.log(error)
        res.status(500)
        .json({
            message: "Something went wrong while checkin/checkout operation",
            error
        })
    }
}

const changeCurrentPassword =async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
    
        //pehle current user lo jo already logged in hai
        //login k waqt auth middleware me data gya hoga uska (req.user)
        const user = await User.findById(req.user?._id);
    
        //hamare pas user schema mein aik method hai isPasswordCorrect jo true ya falsa return karta hai
    
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword); // save this true/false value in a variable
    
        if (!isPasswordCorrect) {
            throw new Error("Old Password is not correct");
        }
        // if isPasswordCorrect = true to is line pe ayega
        user.password = newPassword; // set newPassword, this only sets it and does not save it
    
        await user.save({ validateBeforeSave: false });
    
        return res
            .status(200)
            .json({"message":"password changed successfully"});
    } catch (error) {
        res.status().json({
          message:"Server Error: could not change password",
          error:error.message
        })
    }
};

const updateAccountDetails =async (req, res) => {
try {
        const { fullName, email } = req.body; 
        if (!fullName || !email) {
            throw new Error("All fields are required");
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullName: fullName,
                    email: email,
                },
            },
            { new: true }
        ).select("-password");
    
        return res
            .status(200)
            .json(
                {"message":"Account details updated successfully",user}
            );
} catch (error) {

    res.status(500).json({
      error
    })
}
};


export {
  loginUser,
  logoutUser,
  checkInOrCheckOut,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  test
};
