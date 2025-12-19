const express = require('express');
const { body, validationResult } = require('express-validator');
const Place = require('../models/Place');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/places/:placeId/reviews
// @desc    Add a review to a place
// @access  Private (Visitors only)
router.post(
  '/:placeId/reviews',
  authMiddleware,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ],
  async (req, res) => {
    try {
      // Only visitors can write reviews
      if (req.user.role !== 'visitor') {
        return res
          .status(403)
          .json({ message: 'Only visitors can write reviews' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const place = await Place.findById(req.params.placeId);
      if (!place) {
        return res.status(404).json({ message: 'Place not found' });
      }

      // Check if user already reviewed this place
      const existingReview = place.reviews.find(
        (review) => review.userId.toString() === req.user._id.toString()
      );
      if (existingReview) {
        return res
          .status(400)
          .json({ message: 'You have already reviewed this place' });
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
      await place.populate('uploaderId', 'username email');

      res.status(201).json(place);
    } catch (error) {
      console.error('Add review error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Place not found' });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   DELETE /api/places/:placeId/reviews/:reviewId
// @desc    Delete a review
// @access  Private (Review author only)
router.delete('/:placeId/reviews/:reviewId', authMiddleware, async (req, res) => {
  try {
    const place = await Place.findById(req.params.placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const reviewIndex = place.reviews.findIndex(
      (review) => review._id.toString() === req.params.reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = place.reviews[reviewIndex];

    // Only the review author can delete
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    place.reviews.splice(reviewIndex, 1);
    await place.save();
    await place.populate('uploaderId', 'username email');

    res.json(place);
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Place or review not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

