import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import datasetRoutes from "./routes/datasetRoutes";
import classificationRoutes from "./routes/classificationRoutes";
import policyRoutes from "./routes/policyRoutes";
import jobRoutes from "./routes/jobRoutes";
import adminRoutes from "./routes/adminRoutes";
import auditRoutes from "./routes/auditRoutes";
import statsRoutes from "./routes/statsRoutes";
import privacyRoutes from "./routes/privacyRoutes";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// connect to database
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/classification", classificationRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/privacy", privacyRoutes);



// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
