// backend/src/controllers/authController.ts  (replace signup & login)
import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logAudit } from "../utils/audit";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      role: "none",       // NEW: no role assigned
      status: "pending"   // NEW: pending approval
    });

    await logAudit({ action: "user.signup", userId: user._id.toString(), userEmail: user.email });

    return res.status(201).json({ message: "Signup successful. Account pending admin approval." });
  } catch (err) {
    console.error("signup error", err);
    res.status(500).json({ message: "Signup failed", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // block pending / rejected users
    if (user.status === "pending")
      return res.status(403).json({ message: "Your account is pending admin approval." });
    if (user.status === "rejected")
      return res.status(403).json({ message: "Your account has been rejected." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // audit login
    await logAudit({ action: "user.login", userId: user._id.toString(), userEmail: user.email });

    // include name in response so frontend can store username
    return res.json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name
    });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ message: "Login failed", error: err });
  }
};
