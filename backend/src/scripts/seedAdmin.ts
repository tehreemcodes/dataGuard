// backend/scripts/seedAdmin.ts
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/User";
import bcrypt from "bcrypt";

const MONGO = process.env.MONGO_URI!;
const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@dataguard.com";
const name = process.env.DEFAULT_ADMIN_NAME || "System Admin";
const pass = process.env.DEFAULT_ADMIN_PASSWORD || "IbIm6MArGpQZ23gW";

async function run(){
  await mongoose.connect(MONGO);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }
  const hash = await bcrypt.hash(pass, 10);
  const u = new User({ name, email, password: hash, role: "admin", status: "active" });
  await u.save();
  console.log("Seeded admin:", email);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
