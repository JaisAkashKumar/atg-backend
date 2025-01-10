import User from "../models/user.js";

import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const signUp = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (confirmPassword !== password)
    res.status(404).json({ msg: "Password not matches" });
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(404).json({ msg: "Email Already in Use Try Another" });
    }
    const user = await User.create({ name, email, password });
    const token = user.createJWT();
    res
      .status(200)
      .json({ name: user.name, token, msg: "SignUp Successfull!" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(202).json({ msg: "Invalid Email" });
  }
  const isCorrect = user.comparePassword(password);
  if (!isCorrect) {
    res.status(202).json({ msg: "Invalid Credentials" });
  }
  const token = user.createJWT();
  res.status(200).json({ name: user.name, token, msg: "SignIn Sucessfull!" });
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email === "") {
      return res.status(400).json({ message: "Invalid email address." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset",
      text: `Click on this link to reset your password: ${process.env.CLIENT_URL}/reset-password?token=${resetToken}`,
      html: `<p>Click on this <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}">link</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);

    // Respond to client
    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    console.error("Error in forgetPassword:", error);
    res.status(500).json({
      message: "Error sending password reset email.",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.password = newPassword;

    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password." });
  }
};

export { signUp, signIn, forgetPassword, resetPassword };
