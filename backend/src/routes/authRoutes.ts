import express from "express";
import { signup, login } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";
import User from "../models/User";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById((req as any).user.userId).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
