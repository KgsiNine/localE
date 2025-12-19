import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Place from "../models/Place";
import { authMiddleware, optionalAuth } from "../middleware/auth";
import { PlaceCategory } from "../types";

const router: express.Router = express.Router();

interface PlaceQuery {
  category?: string;
  search?: string;
}

// @route   GET /api/places
// @desc    Get all places (with optional filtering)
// @access  Public
router.get(
  "/",
  optionalAuth,
  async (
    req: Request<{}, {}, {}, PlaceQuery>,
    res: Response
  ): Promise<void> => {
    try {
      const { category, search } = req.query;
      const query: any = {};

      // Filter by category
      if (category && category !== "all") {
        query.category = category;
      }

      // Search by name or description
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // If user is promoter, only show their places
      if (req.user && req.user.role === "promoter") {
        query.uploaderId = req.user._id;
      }

      const places = await Place.find(query)
        .populate("uploaderId", "username email")
        .sort({ uploadedAt: -1 });

      res.json(places);
    } catch (error) {
      console.error("Get places error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

// @route   GET /api/places/:id
// @desc    Get a single place by ID
// @access  Public
router.get(
  "/:id",
  optionalAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const place = await Place.findById(req.params.id).populate(
        "uploaderId",
        "username email"
      );

      if (!place) {
        res.status(404).json({ message: "Place not found" });
        return;
      }

      // Promoters can only view their own places
      if (req.user && req.user.role === "promoter") {
        // Handle both populated object and ObjectId cases
        const uploaderIdAny = place.uploaderId as any;
        const placeUploaderId = uploaderIdAny?._id
          ? uploaderIdAny._id.toString()
          : uploaderIdAny.toString();

        if (req.user._id.toString() !== placeUploaderId) {
          res.status(403).json({ message: "Access denied" });
          return;
        }
      }

      res.json(place);
    } catch (error) {
      console.error("Get place error:", error);
      if (error instanceof Error && error.name === "CastError") {
        res.status(404).json({ message: "Place not found" });
        return;
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

// @route   POST /api/places
// @desc    Create a new place
// @access  Private (Promoter only)
router.post(
  "/",
  authMiddleware,
  [
    body("name").trim().notEmpty().withMessage("Place name is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("category")
      .isIn(["Restaurant", "Hotel", "Cafe", "Mountain", "Visitable Place"])
      .withMessage("Invalid category"),
    body("address").trim().notEmpty().withMessage("Address is required"),
    body("latitude").optional().isNumeric(),
    body("longitude").optional().isNumeric(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Only promoters can create places
      if (!req.user || req.user.role !== "promoter") {
        res.status(403).json({ message: "Only promoters can create places" });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const {
        name,
        description,
        category,
        address,
        latitude = 0,
        longitude = 0,
        image,
        rooms,
      } = req.body;

      const place = new Place({
        name,
        description,
        category: category as PlaceCategory,
        address,
        latitude,
        longitude,
        uploaderId: req.user._id,
        image: image || null,
        uploadedAt: Date.now(),
        rooms: category === "Hotel" && rooms ? rooms : [],
      });

      await place.save();
      await place.populate("uploaderId", "username email");

      res.status(201).json(place);
    } catch (error) {
      console.error("Create place error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

// @route   PUT /api/places/:id
// @desc    Update a place
// @access  Private (Promoter - own places only)
router.put(
  "/:id",
  authMiddleware,
  [
    body("name").optional().trim().notEmpty(),
    body("description").optional().trim().notEmpty(),
    body("category")
      .optional()
      .isIn(["Restaurant", "Hotel", "Cafe", "Mountain", "Visitable Place"]),
    body("address").optional().trim().notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const place = await Place.findById(req.params.id);

      if (!place) {
        res.status(404).json({ message: "Place not found" });
        return;
      }

      // Only the uploader can update
      if (
        !req.user ||
        place.uploaderId.toString() !== req.user._id.toString()
      ) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const updateData = { ...req.body };
      delete updateData.uploaderId; // Prevent changing uploader
      delete updateData.reviews; // Reviews are managed separately

      Object.assign(place, updateData);
      await place.save();
      await place.populate("uploaderId", "username email");

      res.json(place);
    } catch (error) {
      console.error("Update place error:", error);
      if (error instanceof Error && error.name === "CastError") {
        res.status(404).json({ message: "Place not found" });
        return;
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

// @route   DELETE /api/places/:id
// @desc    Delete a place
// @access  Private (Promoter - own places only)
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const place = await Place.findById(req.params.id);

      if (!place) {
        res.status(404).json({ message: "Place not found" });
        return;
      }

      // Only the uploader can delete
      if (
        !req.user ||
        place.uploaderId.toString() !== req.user._id.toString()
      ) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      await Place.findByIdAndDelete(req.params.id);

      res.json({ message: "Place deleted successfully" });
    } catch (error) {
      console.error("Delete place error:", error);
      if (error instanceof Error && error.name === "CastError") {
        res.status(404).json({ message: "Place not found" });
        return;
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

export default router;
