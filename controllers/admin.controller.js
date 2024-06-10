import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";
import { uppercaseFirstLetter } from "../utils/utils.js";
import Joi from "joi";

const registerUserJoi = Joi.object({
  firstName: Joi.string().required().max(30).messages({
    "any.required": "First name is required.",
    "string.empty": "First name cannot be empty.",
    "string.max": "User name should not exceed 30 characters.",
  }),

  lastName: Joi.string().required().max(30).messages({
    "any.required": "Last name is required.",
    "string.empty": "Last name cannot be empty.",
    "string.max": "User name should not exceed 30 characters.",
  }),

  companyId: Joi.string().required().messages({
    "any.required": "companyId is required.",
    "string.empty": "companyId cannot be empty.",
  }),

  DOB: Joi.string()
    .required()
    .max(30)
    .regex(/^((?:19|20)\d\d)-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/)
    .messages({
      "any.required": "DOB is required.",
      "string.empty": "DOB cannot be empty.",
      "string.max": "DOB should not exceed 30 characters.",
      "string.pattern.base": "enter a valid DOB ex:(YYYY-MM-DD)",
    }),

  CNIC: Joi.string()
    .required()
    .regex(/^[0-9]{13}$/)
    .length(13)
    .message({
      "string.length": "enter a valid CNIC ex:(4230100000000)",
      "string.pattern.base": "enter a valid CNIC ex:(4230100000000)",
    }),

  phone: Joi.string()
    .required()
    .regex(/^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/)
    .message({
      "string.pattern.base": "enter a valid Pakistani Phone number",
    }),

  designation: Joi.string().required().max(30).messages({
    "any.required": "designation is required.",
    "string.empty": "designation cannot be empty.",
    "string.max": "designation should not exceed 30 characters.",
  }),

  teamLead: Joi.string().required().max(30).messages({
    "any.required": "teamLead is required.",
    "string.empty": "teamLead cannot be empty.",
    "string.max": "teamLead should not exceed 30 characters.",
  }),

  shift: Joi.string().required().max(30).messages({
    "any.required": "shift is required.",
    "string.empty": "shift cannot be empty.",
    "string.max": "shift should not exceed 30 characters.",
  }),

  department: Joi.string().required().max(30).messages({
    "any.required": "department is required.",
    "string.empty": "department cannot be empty.",
    "string.max": "department should not exceed 30 characters.",
  }),

  role: Joi.string().valid("admin", "user").required().messages({
    "any.only": "role must be either admin or user",
    "any.required": "role is required",
    "string.base": "role must be a string",
  }),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9@]{5,30}$")).messages({
    "string.pattern.base":
      'Password must contain only letters, numbers, or "@" and be between 5 and 30 characters long.',
  }),

  confirmPassword: Joi.ref("password"),

  email: Joi.string().email().required().messages({
    "any.required": "Email is required.",
    "string.empty": "Email cannot be empty.",
    "string.email": "Invalid email format.",
  }),
});
export const registerUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      res.status(401).json({ message: "Unauthorized" });
    }

    let {firstName,lastName} = req.body;

    const {error} = registerUserJoi.validate(req.body);
    if (error) {
      console.log(error);
      return res.status(400).json({ message: error.details });
    } else {
      firstName = uppercaseFirstLetter(firstName);
      lastName = uppercaseFirstLetter(lastName);

      const existedUser = await User.findOne({ email: req.body.email });
      if (existedUser) {
        res.status(400).json({ message: "user already exists" });
      }

      const user = await User.create(req.body);

      return res.status(201).json({
        createdUser: user,
        message: "User registered Successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

export const getUserAttendance = async (req, res) => {
  try {
    const date = new Date();
    let { from, to, userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "please enter an ID" });
    }
    if (!from) {
      from = new Date(date.getFullYear(), date.getMonth(), 1).valueOf();
    }
    if (!to) {
      to = from + 2629746000;
      if (to > date.valueOf()) {
        to = date.valueOf();
      }
    }
    const result = await Attendance.find({
      userId,
      date: { $gte: from, $lte: to },
    });
    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      res.status(401).json({ message: "Unauthorized" });
    }

    const result = await User.find().select("-password -refreshToken -__v");
    console.log(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

export const getUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.query.id;
    if (typeof userId !== "string") {
      console.log("ID must be string");
      return res.status(401).json({ message: "ID must be string" });
    }
    const user = await User.findById(userId);
    if (!user) {
      console.log("user does not exist");
      return res.status(401).json({ message: "user does not exist" });
    }
    console.log(user);
    return res.status(200).json({ user: user });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

export const getAttendancePDF= async (req,res)=>{
  try{
    let {from,to,userId}=req.query
    const date=new Date()
    let user
  
    if(!from){
      from =new Date(date.getFullYear(), date.getMonth(), 1).valueOf();
    }
    if(!to){
      to=from+2678400000
      if(to>date.valueOf()){
        to=date.valueOf()
      }
    }else if(to-from>2678400000){
      to=from+2678400000
    }
  
    if(!userId){
      userId = req.user.id
      user = req.user
    }else{
      user = await User.findById(userId)
      if(!user) return res.status(400).json({message:"user not found"})
    }
  
    const result= await Attendance.find({userId:userId,date:{$gte:from,$lte:to}})
    const numberOfEntries=result.length
  
    const doc = new jsPDF();
  
    const columns = ["Date", "Check in","Check Out","total Duration","Break Duration","Net Duration"];
    const rows = result.map((e)=>{
      return [
        unixToDate(e.date),
        unixToTime(e.checkIn),
        unixToTime(e.checkOut),
        unixTo24Time(e.totalDuration),
        unixTo24Time(e.breakDuration),
        unixTo24Time(e.netDuration)
      ]
    })
  
    const logoData = fs.readFileSync("utils/ff-01.png",'base64')
    doc.addImage(logoData,'PNG',85, 0, 30, 30)
  
    doc.setFontSize(10); 
  
    doc.text(`User: ${user.firstName} ${user.lastName} / ${user.companyId}`,14,28)
  
    doc.setFontSize(18)
  
    doc.text(`Attendance`, 14, 36);
  
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 40
    });
  
    let finalY = doc.lastAutoTable.finalY + 10;
  
    const totalDuration=result.map((e)=>{
      if(e.totalDuration==undefined){
        return 0
      }else{
        return e.totalDuration
      }
    }).reduce((p,c)=>p+c)
  
    const breakDuration=result.map((e)=>{
  
      if(e.breakDuration==undefined){
        return 0
      }else{
        return e.breakDuration
      }
      
    }).reduce((p,c)=>p+c)
  
    const netDuration=result.map((e)=>{
  
      if(e.netDuration==undefined){
        return 0
      }else{
        return e.netDuration
      }
  
    }).reduce((p,c)=>p+c)
  
    const columns2=["total Duration","Break Duration","Net Duration"]
    const rows2=[[unixTo24Time(totalDuration/numberOfEntries),unixTo24Time(breakDuration/numberOfEntries),unixTo24Time(netDuration/numberOfEntries)]]
    doc.text("Averages",14,finalY)
  
    doc.autoTable({
      head:[columns2],
      body:rows2,
      startY:finalY+5
    })
  
    finalY = doc.lastAutoTable.finalY
  
    doc.setFontSize(10); // Set font size
    doc.setTextColor(112, 128, 144); // Set text color (RGB: blue)
  
  
    doc.text("*This is a computer generated file, for any issues, please contact management",14,finalY+5)
  
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const filenameDate=new Date(from)
    console.log(filenameDate)
  
    const filename=`${req.user.companyId}.${filenameDate.getDate()}-${filenameDate.getMonth()}-${filenameDate.getFullYear()}`
  
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
    return res.status(200).send(pdfBuffer);
  }catch(err){
    return res.status(400).json({message:"something went wrong while creating your pdf, please contact management",error:err})
  }

}

export const toggleUserAccount=async (req,res)=>{
  try{
    let {userId}=req.query

    const user = await User.findById(userId)
    user.active=!user.active
    await user.save()
    return res.status(200).json({message:"user account toggled successfully"})
  }catch(error){
    return res.status(400).json({message:"something went wrong, please contact management"})
  }
}

export const autoCheck = async(req,res) =>{
try {
  //find users that are checked in
  const usersCheckedIn= await User.find({status: "checkin"})
  // find users inbreak
  const usersInBreak = await User.find({status: "inbreak"})
  // merge
  const users = usersCheckedIn.concat(usersInBreak);
  console.log("These are users currently inbreak or checked in" , users);
  users.map(async (user)=>{
    
    //status
    const status = user.status
    console.log(status);

    //get user attendance by ID
    const userAttendance = await Attendance.find({userId: user.id})
    const  lastAttendance = userAttendance[userAttendance.length-1]
    console.log(lastAttendance);

    //get duration
    const currentTime = new Date().valueOf()
    const duration = currentTime - lastAttendance.checkIn 

    if (duration > 15*60*60*1000) {
      console.log("Found duration greater than 15 hours");
      //flag 
      lastAttendance.flag = true
      if (status == "inbreak") { //breakout first if inbreak
        lastAttendance.breakOut.push(new Date().valueOf())
        const breakOutTime = lastAttendance.breakOut[lastAttendance.breakOut.length -1]
        const breakInTime = lastAttendance.breakIn[lastAttendance.breakIn.length -1]
        lastAttendance.breakDuration = (breakOutTime - breakInTime) + lastAttendance.breakDuration
        user.status = "checkin"
        console.log("user breakout successfully ");
      }
      //checkout
      lastAttendance.checkOut=new Date().valueOf()
      lastAttendance.totalDuration=lastAttendance.checkOut-lastAttendance.checkIn
      lastAttendance.netDuration = lastAttendance.totalDuration - lastAttendance.breakDuration
      user.status="checkout"
      console.log("user checked out and flagged");
      await lastAttendance.save()
      await user.save()
    } else {
      console.log("duration does not exceed 15 hours");
    }
  })
  return res.status(200).json({message:"auto-checked successfully"})

} catch (error) {
  return res.status(400).json({message:"something went wrong while auto-checking"}) 
}
}

