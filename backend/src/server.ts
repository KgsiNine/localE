import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import authRoutes from "./routes/auth";
import placesRoutes from "./routes/places";
import reviewsRoutes from "./routes/reviews";
import bookingsRoutes from "./routes/bookings";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/places", reviewsRoutes);
app.use("/api/bookings", bookingsRoutes);

// Health check endpoint
app.get("/api/health", (req: Request, res: Response): void => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    console.error("Error:", err);
    const status = (err as any).status || 500;
    res.status(status).json({
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

// 404 handler
app.use((req: Request, res: Response): void => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});

