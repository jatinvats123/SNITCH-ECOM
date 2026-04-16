import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res,message) {
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
export const regitser = async (req, res) => {
  const { email, contact, password, fullname } = req.body;

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
      fullName,
    });
    await sendTokenResponse(user, res, "User registered successfully");
  } catch (error) {
    throw error;
  }
};
}
