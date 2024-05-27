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
  
    const createdUser = await User.findById(user._id).select("-password");
    return res.status(201).json(
      {
        "createdUser":createdUser,
        "message":"User registered Successfully"
      }
    );
  }catch(error){
    res.json({error})
  }
};