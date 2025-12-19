import dotenv from "dotenv";
import User from "../models/User";
import Place from "../models/Place";
import connectDB from "../config/database";

dotenv.config();

const seedData = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    await Place.deleteMany({});

    console.log("Cleared existing data...");

    // Create demo users
    const promoter = new User({
      email: "demo@example.com",
      username: "DemoUser",
      password: "demo123",
      role: "promoter",
    });

    const visitor = new User({
      email: "visitor@example.com",
      username: "VisitorDemo",
      password: "demo123",
      role: "visitor",
    });

    await promoter.save();
    await visitor.save();

    console.log("Created users...");

    // Create demo places
    const places = [
      {
        name: "Mario's Italian Bistro",
        description:
          "A cozy restaurant serving authentic Italian cuisine with a modern twist. Perfect for romantic dinners and family gatherings.",
        category: "Restaurant" as const,
        address: "123 Main Street, Downtown",
        latitude: 40.7128,
        longitude: -74.006,
        uploaderId: promoter._id,
        reviews: [
          {
            userId: promoter._id,
            userName: "DemoUser",
            rating: 5,
            comment:
              "Amazing pasta and excellent service! Highly recommend the carbonara.",
            date: Date.now() - 86400000,
          },
        ],
        uploadedAt: Date.now() - 86400000 * 7,
      },
      {
        name: "Central Park",
        description:
          "Beautiful urban park with walking trails, playgrounds, and scenic views. Great for picnics and outdoor activities.",
        category: "Visitable Place" as const,
        address: "456 Park Avenue",
        latitude: 40.7829,
        longitude: -73.9654,
        uploaderId: promoter._id,
        reviews: [
          {
            userId: promoter._id,
            userName: "DemoUser",
            rating: 4,
            comment: "Lovely place for a morning jog. Very well maintained.",
            date: Date.now() - 172800000,
          },
        ],
        uploadedAt: Date.now() - 172800000 * 2,
      },
      {
        name: "Modern Art Museum",
        description:
          "Contemporary art museum featuring rotating exhibitions from local and international artists.",
        category: "Visitable Place" as const,
        address: "789 Culture Boulevard",
        latitude: 40.7614,
        longitude: -73.9776,
        uploaderId: promoter._id,
        reviews: [],
        uploadedAt: Date.now() - 259200000,
      },
      {
        name: "Brew & Bean Cafe",
        description:
          "Artisan coffee shop with freshly baked pastries and a cozy atmosphere. Perfect for remote work.",
        category: "Cafe" as const,
        address: "321 Coffee Lane",
        latitude: 40.7489,
        longitude: -73.968,
        uploaderId: promoter._id,
        reviews: [
          {
            userId: promoter._id,
            userName: "DemoUser",
            rating: 5,
            comment: "Best latte in town! The ambiance is perfect for working.",
            date: Date.now() - 259200000,
          },
        ],
        uploadedAt: Date.now() - 259200000 * 2,
      },
      {
        name: "Grand Mountain Resort",
        description:
          "Experience breathtaking mountain views with guided hiking tours, camping packages, and adventure activities. Perfect for nature enthusiasts.",
        category: "Mountain" as const,
        address: "Mountain Trail Road, Alpine Valley",
        latitude: 40.7589,
        longitude: -73.9851,
        uploaderId: promoter._id,
        reviews: [],
        uploadedAt: Date.now() - 86400000,
      },
      {
        name: "Luxury Downtown Hotel",
        description:
          "5-star hotel in the heart of the city with premium amenities, spa services, and fine dining. Perfect for business and leisure travelers.",
        category: "Hotel" as const,
        address: "789 Luxury Boulevard, Downtown",
        latitude: 40.7505,
        longitude: -73.9934,
        uploaderId: promoter._id,
        rooms: [
          { id: "room_a", name: "Room A", isAvailable: true },
          { id: "room_b", name: "Room B", isAvailable: true },
          { id: "room_c", name: "Room C", isAvailable: true },
          { id: "room_d", name: "Room D", isAvailable: true },
          { id: "room_e", name: "Room E", isAvailable: false },
        ],
        reviews: [
          {
            userId: visitor._id,
            userName: "VisitorDemo",
            rating: 5,
            comment:
              "Exceptional service and beautiful rooms. Highly recommended!",
            date: Date.now() - 432000000,
          },
        ],
        uploadedAt: Date.now() - 432000000,
      },
      {
        name: "Eagle Peak Mountain Trail",
        description:
          "Challenging mountain trail with stunning panoramic views. Features multiple difficulty levels, wildlife spotting opportunities, and professional guides. Perfect for adventure seekers and nature photographers.",
        category: "Mountain" as const,
        address: "Eagle Peak Road, High Altitude Range",
        latitude: 41.0128,
        longitude: -74.1234,
        uploaderId: promoter._id,
        reviews: [
          {
            userId: visitor._id,
            userName: "VisitorDemo",
            rating: 5,
            comment:
              "Amazing experience! The views were absolutely breathtaking. The guides were knowledgeable and friendly.",
            date: Date.now() - 345600000,
          },
        ],
        uploadedAt: Date.now() - 345600000,
      },
    ];

    await Place.insertMany(places);

    console.log("Created places...");
    console.log("Seed data created successfully!");
    console.log("\nDemo accounts:");
    console.log("Promoter: demo@example.com / demo123");
    console.log("Visitor: visitor@example.com / demo123");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();

