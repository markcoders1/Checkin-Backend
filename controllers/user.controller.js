import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const logoutUser =async (req, res, next) => {
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



export const generateAccessAndRefreshToken = async (userId) => {
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


export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    console.log("incomingRefreshToken : ");
    // console.log(incomingRefreshToken);

    if (!incomingRefreshToken) {
      throw new Error("unauthorized request");
    }
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      console.log("decodedToken : ");
      // console.log(decodedToken);

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
export const loginUser =async (req, res) => {
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

export const test=async (req,res)=>{
  try{
    const date=new Date()
    const testItem="hi"
    console.log(testItem)
    res.status(200).json({testItem})
  }catch(err){
    console.log(err)
  }
}

//todo check in timer
//todo monthly get requests
export const checkInOrCheckOut = async (req,res) =>{

  try {
        let user = await User.findById(req.user.id);
        const status=user.status

        
      

        if(status==="checkout"){
          // check in
          Attendance.create({userId:req.user.id,checkIn:new Date().valueOf()})
          user.status="checkin"
          await user.save()
          return res.status(200).json({"message":"checked in successfully"})


        }else if(status==="checkin"){
          //calculate totalDuration and netduration and checkout
          const array=await Attendance.find({userId:req.user.id,date:{$gte: new Date(new Date()-1*60*60*24*1000)}})
          const objToChange=array[array.length-1]
          const duration=(new Date().valueOf())-objToChange.checkIn
          if(duration<1000*60*60*2){
            res.status(405).json({message:"Leaving so soon? git back to work"})
            return;
          }

          objToChange.checkOut=new Date().valueOf()
          objToChange.totalDuration=objToChange.checkOut-objToChange.checkIn

          objToChange.netDuration = objToChange.totalDuration - objToChange.breakDuration


          user.status="checkout"
          objToChange.save()
          user.save()
          return res.status(200).json({"message":"checked out successfully"})

        }else if(status === "inbreak") {
          // break out:
          const array=await Attendance.find({userId:req.user.id,date:{$gte: new Date(new Date()-1*60*60*24*1000)}})
    
          //get last object in attendance array
          let objToChange =array[array.length-1]
          //put new time value in breakIn which is inside this object
          objToChange.breakOut=new Date().valueOf() 
          const breakOutTime = objToChange.breakOut
          const breakInTime = objToChange.breakIn
          objToChange.breakDuration = breakOutTime - breakInTime
          console.log("Break Duration: ", objToChange.breakDuration);
          user.status = "checkin"
          //checking out
          objToChange.checkOut=new Date().valueOf()
          objToChange.totalDuration=objToChange.checkOut-objToChange.checkIn
          objToChange.netDuration = objToChange.totalDuration - objToChange.breakDuration
          user.status="checkout"
          await user.save();
          await objToChange.save();
          return res.json({ message: "break out and checkout Successfully", array });
        };

    } catch (error) {
      console.log(error)
        res.status(500)
        .json({
            message: "Something went wrong while checkin/checkout operation",
            error
        })
    }
}
const breakUser = async (req, res) => {
  try {
    //  ALGORITHM:
    //when this function is called through /break route    
    //IF status === "checkout" return with error "Must be checked in to access break"   
    //IF status === "checkin" we note a break start time and change status to "inbreak"                  
    //IF status === "inbreak" then note time and calculate duration of break and make user status back to "checkin"
    let user = await User.findById(req.user.id); 
    
    const array=await Attendance.find({userId:req.user.id,date:{$gte: new Date(new Date()-1*60*60*24*1000)}})
    const status = user.status;
    console.log("Status: ", user.status);

    if (status === "checkout") {
      return res.json({
        message: "User Must be Checked In to access Break",
        status,
      });
    }

    
    if (status === "checkin") {
        //break in:
      
        //get last object in attendance array
        const objToChange =array[array.length-1]
        //put new time value in breakIn which is inside this object
        objToChange.breakIn = new Date().valueOf()
        
        //change status to inbreak
        user.status = "inbreak";
        //save 
        await user.save();
        await objToChange.save();
        return res.status(200).json({ message: "break in successfully", array});



      } else if(status === "inbreak") {
        // break out:

        //get last object in attendance array
        let objToChange =array[array.length-1]
        //put new time value in breakIn which is inside this object
        
        objToChange.breakOut=new Date().valueOf() 
        const breakOutTime = objToChange.breakOut
        const breakInTime = objToChange.breakIn
        objToChange.breakDuration = (breakOutTime - breakInTime) + objToChange.breakDuration
        console.log("Break Duration: ", objToChange.breakDuration);
        user.status = "checkin"
        await user.save();
        await objToChange.save();
        return res.json({ message: "break out Successfully", array });
      }
    
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong in Break function",
      error,
    });
  }
};



export const getUserAttendance=async (req,res)=>{
  try{
    const date=new Date()
    let {from,to}=req.query

    if(!from){
      from =new Date(date.getFullYear(), date.getMonth(), 1).valueOf();
    }
    if(!to){
      to=from+2629746000
      if(to>date.valueOf()){
        to=date.valueOf()
      }
    }
    console.log(new Date(from))
    const result= await Attendance.find({userId:req.user.id,date:{$gte:from,$lte:to}})
    res.status(200).json({result})
  }catch(err){
    console.log(err)
  }
}

export const changeCurrentPassword =async (req, res) => {
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

export const updateAccountDetails =async (req, res) => {
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
