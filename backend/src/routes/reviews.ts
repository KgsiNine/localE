import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Place from "../models/Place";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// @route   POST /api/places/:placeId/reviews
// @desc    Add a review to a place
// @access  Private (Visitors only)
router.post(
  "/:placeId/reviews",
  authMiddleware,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment").trim().notEmpty().withMessage("Comment is required"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Only visitors can write reviews
      if (!req.user || req.user.role !== "visitor") {
        res.status(403).json({ message: "Only visitors can write reviews" });
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

      // Check if user already reviewed this place
      const existingReview = place.reviews.find(
        (review) => review.userId.toString() === req.user!._id.toString()
      );
      if (existingReview) {
        res
          .status(400)
          .json({ message: "You have already reviewed this place" });
        return;
      }

      const { rating, comment } = req.body;

      const newReview = {
        userId: req.user._id,
        userName: req.user.username,
        rating: parseInt(rating),
        comment,
        date: Date.now(),
      };

      place.reviews.push(newReview);
      await place.save();
      await place.populate("uploaderId", "username email");

      res.status(201).json(place);
    } catch (error) {
      console.error("Add review error:", error);
      if (error instanceof Error && error.name === "CastError") {
        res.status(404).json({ message: "Place not found" });
        return;
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

// @route   DELETE /api/places/:placeId/reviews/:reviewId
// @desc    Delete a review
// @access  Private (Review author only)
router.delete(
  "/:placeId/reviews/:reviewId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const place = await Place.findById(req.params.placeId);
      if (!place) {
        res.status(404).json({ message: "Place not found" });
        return;
      }

      const reviewIndex = place.reviews.findIndex(
        (review) => review._id.toString() === req.params.reviewId
      );

      if (reviewIndex === -1) {
        res.status(404).json({ message: "Review not found" });
        return;
      }

      const review = place.reviews[reviewIndex];

      // Only the review author can delete
      if (!req.user || review.userId.toString() !== req.user._id.toString()) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      place.reviews.splice(reviewIndex, 1);
      await place.save();
      await place.populate("uploaderId", "username email");

      res.json(place);
    } catch (error) {
      console.error("Delete review error:", error);
      if (error instanceof Error && error.name === "CastError") {
        res.status(404).json({ message: "Place or review not found" });
        return;
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
);

export default router;

