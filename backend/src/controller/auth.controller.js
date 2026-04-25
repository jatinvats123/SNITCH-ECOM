import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res, message) {
  const token = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    { expiresIn: "100d" }
  );



 res.cookie("token", token)


  res.status(200).json({
    message,
    success: true,
    user: {
        id: user._id,
        email: user.email,
        contact: user.contact,
        fullName: user.fullName,
        role: user.role,
    },
}
);
}

export const regitser = async (req, res) => {
  const { email, contact, password, fullname, isSeller } = req.body;

  try {
    const existingUser = await userModel.findOne({
      $or: [{ email }, { contact }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await userModel.create({
      email,
      contact,
      password,
      fullName: fullname,
      role: isSeller ? "seller" : "buyer",
    });
    await sendTokenResponse(user, res, "User registered successfully");
  } catch (error) {
    throw error;
  }
};

export const login = async (req, res)=>{
  const{email,password}= req.body;


  const user = await userModel.findOne({email});
  if(!user){
    return res.status(400).json({message:"Invalid credentials"});
  }
  const isMatch = await user.comparePassword(password);
  if(!isMatch){
    return res.status(400).json({message:"Invalid credentials"});
  }
  await sendTokenResponse(user, res, "User logged in successfully");
}

export const googleCallBack = async (req, res) => {
  const {id, displayName, emails, photos}=req.user
  const email = emails[0].value;
  const profilePic = photos[0].value;
  let user = await userModel.findOne({email});
  if(!user){
    user = await userModel.create({
      email,
      googleId:id,
      fullName:displayName,
     
    })

  }
  const token = jwt.sign({
    id: user._id,
  }, config.JWT_SECRET, {expiresIn:"100d"
  })
  res.cookie("token", token);
  res.redirect("http://localhost:5173/?google=success")
}
export const getMe = async (req, res)=>{
  const user = req.user;
  res.status(200).json({
    message:"User fetched successfully",
    success:true,
    user:{
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullName: user.fullName,
      role: user.role,
    },
  })
}