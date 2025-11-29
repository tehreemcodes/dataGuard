// backend/src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "analyst" | "compliance" | "none";
  status: "pending" | "active" | "rejected";
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // NEW
  role: {
    type: String,
    enum: ["admin", "analyst", "compliance", "none"],
    default: "none"
  },
  status: {
    type: String,
    enum: ["pending", "active", "rejected"],
    default: "pending"
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>("User", UserSchema);
