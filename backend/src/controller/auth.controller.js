import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/config.js";
import { sendResetPasswordEmail } from "../utils/mailer.js";

async function sendTokenResponse(user, res, message) {
  const token = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    { expiresIn: "100d" }
  );

  res.cookie("token", token);

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
  });
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
    res.status(500).json({ message: "Error registering user", error: error.message });
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
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
      await user.save();

      const resetUrl = `${config.CLIENT_URL}/reset-password/${rawToken}`;
      await sendResetPasswordEmail(user.email, resetUrl);
    }

    // Always return the same response, whether or not the email exists, so we don't leak registered emails.
    res.status(200).json({
      message: "If an account with that email exists, a reset link has been sent",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing request", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired", success: false });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully", success: true });
};

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