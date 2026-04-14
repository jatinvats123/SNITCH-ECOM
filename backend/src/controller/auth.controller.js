import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {config} from "../config/config.js";


async function sendTokenResponse(user,res){
    const token = jwt.sign({
        id:user._id,
    }, config.JWT_SECRET,{ expiresIn: '100d' })
}

export const regitser = async(req,res)=>{
    const{email,contact,password,fullname}=req.body;

    try{
        const existingUser = await userModel.findOne({
            $or:[{email},{contact}]
        })
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        const user= await userModel.create({
            email,
            contact,
            password,
            fullName
        });


    }
}
}   