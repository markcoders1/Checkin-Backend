import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";

export const registerUser =async (req, res) => {
  try{
    if(req.user.role!=='admin'){
      res.status(401).json({message:"Unauthorized"})
    }
  
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
    res.json({error})
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