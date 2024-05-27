import { User } from "../models/user.model.js";
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

const checkinUser = async(req,res)=>{

    try {
        const user = await User.findById(req.user.id); //get logged in user 
        const checkinTime = user.attendance.push({ checkIn: new Date() }); // add current time object to attendance check in

    console.log(checkinTime); // remove when testing done

    await user.save();
    return res.json({"message":"checked in successfully"});
  } catch (error) {
    res.status(500).json({
      message:"Server error, Could not check in",
      error:error.message
    })
  }
};

const checkoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    //user ki attendance ki details lelo
    const attendance = user.attendance;

    console.log("attendance: ", attendance); // remove when testing is done

    if (attendance.length === 0) {
      //no attendance records at all, means they haven't checked in.
      throw new Error("No check-in detected, check-in first");
    }
    if (attendance[attendance.length - 1].checkOut) {
      //check if user has already checked out.

      throw new Error(
        "Error: User has already checked-out,  Check-in First"
      );
    }

    //adding check out time to user database
    attendance[attendance.length - 1].checkOut = new Date();

    console.log("CHECKOUT TIME : ", checkoutTime); //remove this when testing is done

    // read the checkin value from attendance so we can calculate duration
    const checkInTime1 = attendance[attendance.length - 1].checkIn;

    // use function
    const calculatedDurationLocal = calculateDuration(
      checkInTime1,
      checkoutTime
    );

    //now add this calculated Duration string to user
    if (attendance[attendance.length - 1].duration) {
      throw new Error("Error: value detected inside duration field");
    }

        attendance[attendance.length - 1].duration = calculatedDurationLocal
        console.log("Successfully Added Duration:  ",calculatedDurationLocal); //remove this when testing is done
        
        
        await user.save();
        return res
        .json(
            {"message":"checked out successfully"}
        );
    } catch (error) {
      res.status(500).json({
        message:"Server Error: Could not Check out ",
        error:error.message
      })
    }

};

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
  checkinUser,
  checkoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
};
