import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";
import { uppercaseFirstLetter } from "../utils/utils.js";

export const registerUser =async (req, res) => {
  try{
    if(req.user.role!=='admin'){
      res.status(401).json({message:"Unauthorized"})
    }
    
    let {email,password,firstName,lastName,DOB,CNIC,phone,designation,teamLead,shift,department,role}=req.body
    
    if(email==''|| password==''|| firstName==''|| lastName==''|| DOB==''|| CNIC==''|| phone==''|| designation==''|| teamLead==''|| shift==''|| department==''|| role==''){
      return res.status(400).json({message:"data incomplete"})
    }

    if(!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/g.test(email)){
      return res.status(400).json({message:"enter a valid email"})
    }

    if (typeof(password)!=='string'){
      return res.status(400).json({message:"enter a valid password"})
    }

    if(password.length<6){
      return res.status(400).json({message:"password is too short"})
    }
    
    if (typeof(firstName)!=='string'){
      return res.status(400).json({message:"enter a valid name"})
    }

    if (typeof(lastName)!=='string'){
      return res.status(400).json({message:"enter a valid name"})
    }

    if(firstName.length>20){
      return res.status(400).json({message:"enter a valid name"})
    }

    if(lastName.length>20){
      return res.status(400).json({message:"enter a valid name"})
    }

    if(!/^[0-9]{13}$/g.test(CNIC)){
      return res.status(400).json({message:"enter a valid CNIC ex:(4230100000000)"})
    }

    if(!/^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[012])-((?:19|20)\d\d)$/.test(DOB)){
      return res.status(400).json({message:"enter a valid date (DD-MM-YYYY)"})
    }

    if (typeof(phone)!== "string") {
      console.log("phone must be string");
     return  res.status(401).json({message:"phone must be string"})
    }
    
    if (!/^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/gm.test(phone)) {
      // https://github.com/fWd82/Pakistan-Mobile-Number-Validator
      console.log("Pakistani Phone Number not valid");
     return  res.status(401).json({message:"Pakistani Phone Number not valid"})
    }

    if (typeof(designation)!== "string" ) {
      console.log("designation must be string");
     return  res.status(401).json({message:"designation must be string"})
    }
    if (typeof(teamLead)!== "string" ) {
      console.log("teamLead must be string");
     return  res.status(401).json({message:"teamLead must be string"})
    }
    if (typeof(designation)!== "string" ) { //predefined
      console.log("designation must be string");
     return  res.status(401).json({message:"designation must be string"})
    }
    if (typeof(shift)!== "string" ) {
      console.log("shift must be string");
     return  res.status(401).json({message:"shift must be string"})
    }
    if (typeof(department)!== "string" ) {
      console.log("department must be string");
     return  res.status(401).json({message:"department must be string"})
    }
    if (role!== "admin"&&role!== "user") {
      console.log("role must be string");
     return  res.status(401).json({message:"role must be either admin or user"})
    }

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
  }catch(error){
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
    const result= await Attendance.find({userId:req.user.id,date:{$gte:from,$lte:to}})
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