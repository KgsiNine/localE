import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/database";

dotenv.config();

/**
 * Initialize MongoDB database
 * Creates indexes and verifies connection
 */
const initDatabase = async (): Promise<void> => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    console.log("Creating indexes...");

    // Get models to ensure indexes are created
    const User = (await import("../models/User")).default;
    const Place = (await import("../models/Place")).default;
    const Booking = (await import("../models/Booking")).default;

    // Ensure indexes are created
    await User.createIndexes();
    await Place.createIndexes();
    await Booking.createIndexes();

    console.log("Indexes created successfully!");

    // Verify connection
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      console.log("\nExisting collections:", collections.map((c) => c.name));

      const stats = await db.stats();
      console.log("\nDatabase stats:");
      console.log(`- Database name: ${stats.db}`);
      console.log(`- Collections: ${stats.collections}`);
      console.log(`- Data size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    }

    console.log("\n✅ Database initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    process.exit(1);
  }
};

initDatabase();

