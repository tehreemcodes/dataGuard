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



// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
