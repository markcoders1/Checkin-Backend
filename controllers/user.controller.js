import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";
import jwt from "jsonwebtoken";
import { transporterConstructor ,generateOTP } from "../utils/email.js";





export const logoutUser =async (req, res, next) => {
    try {
            await User.findByIdAndUpdate(req.user._id,{$set: {refreshToken: undefined}},{new: true});
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



export const generateAccessAndRefreshToken = async (userId) => {

  try {
    const user = await User.findById(userId); 
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(
      "Something went wrong while generating Access and Refresh Tokens"
    );
  }
};


export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(400).json({message:"no refresh token"})
    }
      const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

      const user = await User.findById(decodedToken?._id);

      if (!user) {
        return res.status(400).json({message:"user not found"})
      }

      if (incomingRefreshToken !== user?.refreshToken) {
        return res.status(400).json({message:"refresh token is expired or used"})
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

   try {
     const { email, password } = req.body;
 
     if (!email) {
      return res.status(400).json({message:"please enter an email"})
     }else if(!password){
      return res.status(400).json({message:"please enter a password"})
     }
 
     const user = await User.findOne({email:email});
 
     if (!user) {
      return res.status(400).json({message:"user not found"})
     }
 
     const isPasswordValid = await user.isPasswordCorrect(password);
     if (!isPasswordValid) {
      return res.status(400).json({message:"email or password incorrect"})
     }
 
     const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
     );
 
 
     const loggedInUser = await User.findById(user._id).select(
         "-password -refreshToken"
     );
 
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
    console.log(req.body);
    const date=new Date()
    
    const user = await User.findOne(req.body);
    if (!user) {
        console.log('User not found');
    }
    console.log('User found:', user);
    const testItem=user
    console.log(testItem)
    res.status(200).json({testItem})
  }catch(err){
    console.log(err)
  }
}

export const checkInOrCheckOut = async (req,res) =>{

  try {
        let user = await User.findById(req.user.id);
        const status=user.status

        if(status==="checkout"){
          // check in
          Attendance.create({userId:req.user.id,checkIn:new Date().valueOf()})
          user.status="checkin"
          await user.save()
          return res.status(200).json({"message":"checked in successfully","status":user.status})


        }else if(status==="checkin"){
          //calculate totalDuration and netduration and checkout
          const array=await Attendance.find({userId:req.user.id,date:{$gte: new Date(new Date()-1*60*60*24*1000)}})
          const objToChange=array[array.length-1]
          // const duration=(new Date().valueOf())-objToChange.checkIn
          // if(duration<1000*60*60*2){
          //   res.status(403).json({message:"Please consult Management about leaving early"})
          //   return;
          // }

          objToChange.checkOut=new Date().valueOf()
          objToChange.totalDuration=objToChange.checkOut-objToChange.checkIn

          objToChange.netDuration = objToChange.totalDuration - objToChange.breakDuration


          user.status="checkout"
          objToChange.save()
          user.save()
          return res.status(200).json({"message":"checked out successfully","status":user.status})

        }else if(status === "inbreak") {
          // break out:
          const array=await Attendance.find({userId:req.user.id,date:{$gte: new Date(new Date()-1*60*60*24*1000)}})
         
          let objToChange =array[array.length-1]
          //put new time value in breakIn which is inside this object
          //if array is empty, simply push else append at the end
          objToChange.breakOut.push(new Date().valueOf())
          const breakOutTime = objToChange.breakOut[objToChange.breakOut.length -1]
          const breakInTime = objToChange.breakIn[objToChange.breakIn.length -1]
          objToChange.breakDuration = (breakOutTime - breakInTime) + objToChange.breakDuration
          user.status = "checkin"
          await user.save();
          await objToChange.save();
          //checking out
          objToChange.checkOut=new Date().valueOf()
          const duration = objToChange.checkOut-objToChange.checkIn

          // if(duration<1000*60*60*2){
          //   res.status(403).json({message:"Please consult Management about leaving early"})
          //   return;
          // }

          objToChange.totalDuration= duration
          objToChange.netDuration = objToChange.totalDuration - objToChange.breakDuration
          user.status="checkout"
          await user.save();
          await objToChange.save();
          return res.json({ message: "break out and checkout Successfully", "status":user.status });
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
export const breakUser = async (req, res) => {
  try {
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
          objToChange.breakIn.push(new Date().valueOf())
        //change status to inbreak
        user.status = "inbreak";
        //save 
        await user.save();
        await objToChange.save();
        return res.status(200).json({ message: "break in successfully", objToChange,"status":user.status})

      } else if(status === "inbreak") {
        // break out:

        //get last object in attendance array
        let objToChange =array[array.length-1]
        //put new time value in breakIn which is inside this object
        //if array is empty, simply push else append at the end
        objToChange.breakOut.push(new Date().valueOf())
        const breakOutTime = objToChange.breakOut[objToChange.breakOut.length -1]
        const breakInTime = objToChange.breakIn[objToChange.breakIn.length -1]
        objToChange.breakDuration = (breakOutTime - breakInTime) + objToChange.breakDuration
        
        user.status = "checkin"
        await user.save();
        await objToChange.save();
        return res.json({ message: "break out Successfully", objToChange,"status":user.status });
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

export const resetPassword = async (req,res) =>{
  // 1. take email from user (req.body) 
  // 2. generate a new OTP, 
  // 3. set that otp as new password 
  // 4. send otp to user through email
  try {
    console.log(req.body)
    console.log("hi")
    const user = await User.findOne({email:req.body.email});
    if (!user) {
        console.log('User not found');
        return null;
    }
    console.log('User found:', user);

    const emailToSendOTP =  user.email
    const otp = generateOTP(6)
    console.log(`Trying to send OTP "${otp}" to ${emailToSendOTP} now`);
    

    // Email defined here
    const theEmail  = {
      from : process.env.APP_EMAIL,
      to:  emailToSendOTP,
      subject:  "OTP",
      text: `This is an automated Email for ${emailToSendOTP}. Your new password has been set to ${otp}`
    };
    console.log(theEmail)
    //send email
    const transporter = transporterConstructor()

    await transporter.sendMail(theEmail, (error) => {
      if (error) return res.status(400).json({"Email not sent":error});
    });

    console.log("Email with OTP has been sent successfully");

    //change password after email is sent with code
    user.password = otp;
    await user.save({ validateBeforeSave: false });
   console.log("password has been reset. ");
    res.status(200).json({message: 'Email with OTP sent successfully and password has been reset'});
  } catch (error) {
    console.error("Error occurred while sending OTP email: ", error);
    res.status(400).json({error});
  }
}
export const changeCurrentPassword =async (req, res) => {
    try {
      
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword||!newPassword){
          return res.status(400).json({message:"incomplete data"})
        }

        const user = await User.findById(req.user?._id);
    
    
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword); 
        if (!isPasswordCorrect) {
          return res.status(400).json({message:"password is incorrect"})
        }
        user.password = newPassword;
    
        await user.save({ validateBeforeSave: false });
        return res.status(200).json({"message":"password changed successfully"});

    } catch (error) {
        res.status().json({
          message:"Server Error: could not change password",
          error:error.message
        })
    }
};


export const getUser=async (req,res)=>{
  try{
    const user=await User.findById(req.user.id).select('-password -_id -__v')
    return res.status(200).json({user})
  }catch(error){
    console.log(error);
    res.status(400).json({error})
  }
}

export const getStatus=async (req,res)=>{
  try{
    console.log(req.user.id)
    const user=await User.findById(req.user.id)
    console.log(user.status)
    return res.status(200).json({"status":user.status})
  }catch(error){
    console.log(error);
    res.status(400).json({error})
  }
}

export const sendEmail = async(req, res) => {
  try {
    console.log("Trying to send Email now");
    const theEmail  = {
      from : process.env.APP_EMAIL,
      to:  "zaidb02@approich.com",
      subject:  "example application for vacation",
      text: "Hello i want to go for a 100 year long vacation on mars"
    };
    console.log(theEmail)
    
    const transporter = transporterConstructor()
    // const info = await transporter.sendMail(theEmail);
    
    await transporter.sendMail(theEmail, (error) => {
      if (error) return res.status(400).json({"Email not sent":error});
    });


    console.log("Email has been sent successfully");
    res.status(200).json({message: 'Email sent successfully'});
  } catch (error) {
    console.error("Error occurred while sending email: ", error);
    res.status(400).json({error});
  }
}