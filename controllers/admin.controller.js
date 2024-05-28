import { User } from "../models/user.model.js";

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