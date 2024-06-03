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

  DOB: Joi.string().required().max(30).regex(/^((?:19|20)\d\d)-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/).messages({
    "any.required": "DOB is required.",
    "string.empty": "DOB cannot be empty.",
    "string.max": "DOB should not exceed 30 characters.",
    "string.pattern.base":"enter a valid DOB ex:(YYYY-MM-DD)"
  }),

  CNIC: Joi.string().required().regex(/^[0-9]{13}$/).length(13).message({
    'string.length': 'enter a valid CNIC ex:(4230100000000)',
    "string.pattern.base":"enter a valid CNIC ex:(4230100000000)"
  }),

  phone: Joi.string().required().regex(/^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/).message({
    "string.pattern.base":"enter a valid Pakistani Phone number"
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




  shift:Joi.string().required().max(30).messages({
    "any.required": "shift is required.",
    "string.empty": "shift cannot be empty.",
    "string.max": "shift should not exceed 30 characters.",
  }),

  department: Joi.string().required().max(30).messages({
    "any.required": "department is required.",
    "string.empty": "department cannot be empty.",
    "string.max": "department should not exceed 30 characters.",
  }),
  role: Joi.string()
  .valid('admin', 'user')
  .required()
  .messages({
    'any.only': 'role must be either admin or user',
    'any.required': 'role is required',
    'string.base': 'role must be a string'
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
  })
});




export const registerUser =async (req, res) => {
  try{
    if(req.user.role!=='admin'){
      res.status(401).json({message:"Unauthorized"})
    }
    
    let {email,companyId,password,confirmPassword,firstName,lastName,DOB,CNIC,phone,designation,teamLead,shift,department,role}=req.body

    
    const { error, value } = registerUserJoi.validate(req.body);
    if (error) {
      console.log(error);
        return res.status(400).json({message: error.details})
    } else {
        
  console.log("checking bro:", value);
    // if(email==''|| password==''||confirmPassword==''|| firstName==''|| lastName==''|| DOB==''|| CNIC==''|| phone==''|| designation==''|| teamLead==''|| shift==''|| department==''|| role==''){
    //   return res.status(400).json({message:"data incomplete"})
    // }

    // if(!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/g.test(email)){
    //   return res.status(400).json({message:"enter a valid email"})
    // }

    // if (typeof(password)!=='string'){
    //   return res.status(400).json({message:"enter a valid password"})
    // }
    // if (typeof(confirmPassword)!=='string' && confirmPassword !== password ){
    //   return res.status(400).json({message:"confirm password does not match password"})
    // }
    // if(password.length<6){
    //   return res.status(400).json({message:"password is too short"})
    // }
    
    // if (typeof(firstName)!=='string'){
    //   return res.status(400).json({message:"enter a valid name"})
    // }

    // if (typeof(lastName)!=='string'){
    //   return res.status(400).json({message:"enter a valid name"})
    // }

    // if(firstName.length>20){
    //   return res.status(400).json({message:"enter a valid name"})
    // }

    // if(lastName.length>20){
    //   return res.status(400).json({message:"enter a valid name"})
    // }

    // if(!/^[0-9]{13}$/g.test(CNIC)){
    //   return res.status(400).json({message:"enter a valid CNIC ex:(4230100000000)"})
    // }

    // if(!/^((?:19|20)\d\d)-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/.test(DOB)){
    //   return res.status(400).json({message:"enter a valid date (YYYY-MM-DD)"})
    // }

    // if (typeof(phone)!== "string") {
    //   console.log("phone must be string");
    //  return  res.status(401).json({message:"phone must be string"})
    // }
    
    // if (!/^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/gm.test(phone)) {
    //   // https://github.com/fWd82/Pakistan-Mobile-Number-Validator
    //   console.log("Pakistani Phone Number not valid");
    //  return  res.status(401).json({message:"Pakistani Phone Number not valid"})
    // }

    // if (typeof(designation)!== "string" ) {
    //   console.log("designation must be string");
    //  return  res.status(401).json({message:"designation must be string"})
    // }
    // if (typeof(teamLead)!== "string" ) {
    //   console.log("teamLead must be string");
    //  return  res.status(401).json({message:"teamLead must be string"})
    // }
    // if (typeof(designation)!== "string" ) { //predefined
    //   console.log("designation must be string");
    //  return  res.status(401).json({message:"designation must be string"})
    // }
    // if (typeof(shift)!== "string" ) {
    //   console.log("shift must be string");
    //  return  res.status(401).json({message:"shift must be string"})
    // }
    // if (typeof(department)!== "string" ) {
    //   console.log("department must be string");
    //  return  res.status(401).json({message:"department must be string"})
    // }
    // if (role!== "admin"&&role!== "user") {
    //   console.log("role must be string");
    //  return  res.status(401).json({message:"role must be either admin or user"})
    // }

    firstName=uppercaseFirstLetter(firstName)
    lastName=uppercaseFirstLetter(lastName)


    const existedUser = await User.findOne({email:req.body.email});
    if (existedUser) {
      res.status(400).json({message:"user already exists"})
    }
    
    const user = await User.create(req.body);
  
    return res.status(201).json(
      {
        "createdUser":user,
        "message":"User registered Successfully"
      }
    );
 } }catch(error){
    console.log(error)
    res.json(error)
  }
};

export const getUserAttendance=async (req,res)=>{
  try{
    const date=new Date()
    let {from,to,userId}=req.query

    if(!userId){
      return res.status(400).json({message:"please enter an ID"})
    }
    if(!from){
      from =new Date(date.getFullYear(), date.getMonth(), 1).valueOf();
    }
    if(!to){
      to=from+2629746000
      if(to>date.valueOf()){
        to=date.valueOf()
      }
    }
    const result= await Attendance.find({userId,date:{$gte:from,$lte:to}})
    res.status(200).json({result})
  }catch(err){
    console.log(err)
  }
}

export const getAllUsers = async(req,res) => {
  try {
    if(req.user.role!=='admin'){
      res.status(401).json({message:"Unauthorized"})
    }

    const result= await User.find().select("-password -refreshToken -__v")
    console.log(result);
    return res.status(200).json(result)

  } catch (error) {
    console.log(error);
    res.status(400).json({error})
  }
}

export const getUser = async(req, res) => {
  try {
    if(req.user.role!=='admin'){
      res.status(401).json({message:"Unauthorized"})
    }
    const userId = req.query.id
    if (typeof(userId) !== "string") {
      console.log("ID must be string");
     return  res.status(401).json({message:"ID must be string"})
    }
    const user=await User.findById(userId)
    if (!user) {
      console.log("user does not exist");
     return  res.status(401).json({message:"user does not exist"})
    }
    console.log(user)
    return res.status(200).json({"user":user})
  } catch (error) {
    console.log(error);
    res.status(400).json({error})
  }
}