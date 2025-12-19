import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Booking from "../models/Booking";
import Place from "../models/Place";
import User from "../models/User";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get bookings (filtered by user role)
// @access  Private
router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const query: any = {};

      // Visitors see their own bookings, promoters see bookings for their places
      if (req.user.role === "visitor") {
        query.visitorId = req.user._id;
      } else if (req.user.role === "promoter") {
        query.promoterId = req.user._id;
      }

      const bookings = await Booking.find(query)
        .populate("placeId", "name category address")
        .populate("visitorId", "username email")
        .populate("promoterId", "username email")
        .sort({ bookingDate: -1 });

      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

// @route   GET /api/bookings/:id
// @desc    Get a single booking by ID
// @access  Private
router.get(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const booking = await Booking.findById(req.params.id)
        .populate("placeId", "name category address")
        .populate("visitorId", "username email")
        .populate("promoterId", "username email");

      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      // Check access: visitor can see their own, promoter can see bookings for their places
      if (req.user.role === "visitor") {
        if (booking.visitorId.toString() !== req.user._id.toString()) {
          res.status(403).json({ message: "Access denied" });
          return;
        }
      } else if (req.user.role === "promoter") {
        if (booking.promoterId.toString() !== req.user._id.toString()) {
          res.status(403).json({ message: "Access denied" });
          return;
        }
      }

      res.json(booking);
    } catch (error) {
      console.error("Get booking error:", error);
      if (error instanceof Error && error.name === "CastError") {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (Visitors only)
router.post(
  "/",
  authMiddleware,
  [
    body("placeId").notEmpty().withMessage("Place ID is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("scheduledDate")
      .notEmpty()
      .withMessage("Scheduled date is required"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Only visitors can create bookings
      if (!req.user || req.user.role !== "visitor") {
        res.status(403).json({ message: "Only visitors can create bookings" });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const place = await Place.findById(req.body.placeId);
      if (!place) {
        res.status(404).json({ message: "Place not found" });
        return;
      }

      // Get promoter info
      const promoter = await User.findById(place.uploaderId);
      if (!promoter) {
        res.status(404).json({ message: "Promoter not found" });
        return;
      }

      // Validate hotel room availability
      if (place.category === "Hotel" && req.body.selectedRoomIds) {
        const selectedRooms = place.rooms?.filter((room) =>
          req.body.selectedRoomIds.includes(room.id)
        ) || [];
        const unavailableRooms = selectedRooms.filter(
          (room) => !room.isAvailable
        );
        if (unavailableRooms.length > 0) {
          res.status(400).json({
            message: "Some selected rooms are not available",
            unavailableRooms: unavailableRooms.map((r) => r.name),
          });
          return;
        }
      }

      const bookingData = {
        placeId: place._id,
        placeName: place.name,
        visitorId: req.user._id,
        visitorName: req.user.username,
        promoterId: promoter._id,
        price: req.body.price,
        duration: req.body.duration || 0,
        scheduledDate: req.body.scheduledDate,
        status: "pending" as const,
        checkInTime: req.body.checkInTime || null,
        tableNumber: req.body.tableNumber || null,
        startDate: req.body.startDate || null,
        endDate: req.body.endDate || null,
        numberOfSlots: req.body.numberOfSlots || null,
        checkInDate: req.body.checkInDate || null,
        checkOutDate: req.body.checkOutDate || null,
        selectedRoomIds: req.body.selectedRoomIds || [],
      };

      const booking = new Booking(bookingData);
      await booking.save();

      await booking.populate("placeId", "name category address");
      await booking.populate("visitorId", "username email");
      await booking.populate("promoterId", "username email");

      res.status(201).json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

// @route   POST /api/bookings/:placeId
// @desc    Create a booking for a specific place (alternative endpoint)
// @access  Private (Visitors only)
router.post(
  "/:placeId",
  authMiddleware,
  [
    body("price").isNumeric().withMessage("Price must be a number"),
    body("scheduledDate")
      .notEmpty()
      .withMessage("Scheduled date is required"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Only visitors can create bookings
      if (!req.user || req.user.role !== "visitor") {
        res.status(403).json({ message: "Only visitors can create bookings" });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const place = await Place.findById(req.params.placeId);
      if (!place) {
        res.status(404).json({ message: "Place not found" });
        return;
      }

      // Get promoter info
      const promoter = await User.findById(place.uploaderId);
      if (!promoter) {
        res.status(404).json({ message: "Promoter not found" });
        return;
      }

      // Validate hotel room availability
      if (place.category === "Hotel" && req.body.selectedRoomIds) {
        const selectedRooms = place.rooms?.filter((room) =>
          req.body.selectedRoomIds.includes(room.id)
        ) || [];
        const unavailableRooms = selectedRooms.filter(
          (room) => !room.isAvailable
        );
        if (unavailableRooms.length > 0) {
          res.status(400).json({
            message: "Some selected rooms are not available",
            unavailableRooms: unavailableRooms.map((r) => r.name),
          });
          return;
        }
      }

      const bookingData = {
        placeId: place._id,
        placeName: place.name,
        visitorId: req.user._id,
        visitorName: req.user.username,
        promoterId: promoter._id,
        price: req.body.price,
        duration: req.body.duration || 0,
        scheduledDate: req.body.scheduledDate,
        status: "pending" as const,
        checkInTime: req.body.checkInTime || null,
        tableNumber: req.body.tableNumber || null,
        startDate: req.body.startDate || null,
        endDate: req.body.endDate || null,
        numberOfSlots: req.body.numberOfSlots || null,
        checkInDate: req.body.checkInDate || null,
        checkOutDate: req.body.checkOutDate || null,
        selectedRoomIds: req.body.selectedRoomIds || [],
      };

      const booking = new Booking(bookingData);
      await booking.save();

      await booking.populate("placeId", "name category address");
      await booking.populate("visitorId", "username email");
      await booking.populate("promoterId", "username email");

      res.status(201).json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

// @route   PUT /api/bookings/:id
// @desc    Update a booking (mainly status updates by promoter)
// @access  Private
router.put(
  "/:id",
  authMiddleware,
  [
    body("status")
      .optional()
      .isIn(["pending", "confirmed", "cancelled"])
      .withMessage("Invalid status"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      // Check access
      if (req.user.role === "visitor") {
        if (booking.visitorId.toString() !== req.user._id.toString()) {
          res.status(403).json({ message: "Access denied" });
          return;
        }
      } else if (req.user.role === "promoter") {
        if (booking.promoterId.toString() !== req.user._id.toString()) {
          res.status(403).json({ message: "Access denied" });
          return;
        }
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Update allowed fields
      const allowedUpdates = [
        "status",
        "checkInTime",
        "tableNumber",
        "startDate",
        "endDate",
        "numberOfSlots",
        "checkInDate",
        "checkOutDate",
        "selectedRoomIds",
        "price",
        "duration",
      ];
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        res.status(400).json({ message: "Invalid updates" });
        return;
      }

      Object.assign(booking, req.body);
      await booking.save();

      await booking.populate("placeId", "name category address");
      await booking.populate("visitorId", "username email");
      await booking.populate("promoterId", "username email");

      res.json(booking);
    } catch (error) {
      console.error("Update booking error:", error);
      if (error instanceof Error && error.name === "CastError") {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking
// @access  Private (Visitor can delete their own, promoter can delete bookings for their places)
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      // Check access
      if (req.user.role === "visitor") {
        if (booking.visitorId.toString() !== req.user._id.toString()) {
          res.status(403).json({ message: "Access denied" });
          return;
        }
      } else if (req.user.role === "promoter") {
        if (booking.promoterId.toString() !== req.user._id.toString()) {
          res.status(403).json({ message: "Access denied" });
          return;
        }
      }

      await Booking.findByIdAndDelete(req.params.id);

      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Delete booking error:", error);
      if (error instanceof Error && error.name === "CastError") {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

export default router;

