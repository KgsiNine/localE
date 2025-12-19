const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Place = require('../models/Place');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get bookings (filtered by user role)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};

    // Visitors see their own bookings, promoters see bookings for their places
    if (req.user.role === 'visitor') {
      query.visitorId = req.user._id;
    } else if (req.user.role === 'promoter') {
      query.promoterId = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('placeId', 'name category address')
      .populate('visitorId', 'username email')
      .populate('promoterId', 'username email')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get a single booking by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('placeId', 'name category address')
      .populate('visitorId', 'username email')
      .populate('promoterId', 'username email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check access: visitor can see their own, promoter can see bookings for their places
    if (req.user.role === 'visitor') {
      if (booking.visitorId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'promoter') {
      if (booking.promoterId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (Visitors only)
router.post(
  '/',
  authMiddleware,
  [
    body('placeId').notEmpty().withMessage('Place ID is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('scheduledDate').notEmpty().withMessage('Scheduled date is required'),
  ],
  async (req, res) => {
    try {
      // Only visitors can create bookings
      if (req.user.role !== 'visitor') {
        return res
          .status(403)
          .json({ message: 'Only visitors can create bookings' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const place = await Place.findById(req.body.placeId);
      if (!place) {
        return res.status(404).json({ message: 'Place not found' });
      }

      // Get promoter info
      const promoter = await User.findById(place.uploaderId);
      if (!promoter) {
        return res.status(404).json({ message: 'Promoter not found' });
      }

      // Validate hotel room availability
      if (place.category === 'Hotel' && req.body.selectedRoomIds) {
        const selectedRooms = place.rooms.filter((room) =>
          req.body.selectedRoomIds.includes(room.id)
        );
        const unavailableRooms = selectedRooms.filter(
          (room) => !room.isAvailable
        );
        if (unavailableRooms.length > 0) {
          return res.status(400).json({
            message: 'Some selected rooms are not available',
            unavailableRooms: unavailableRooms.map((r) => r.name),
          });
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
        status: 'pending',
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

      await booking.populate('placeId', 'name category address');
      await booking.populate('visitorId', 'username email');
      await booking.populate('promoterId', 'username email');

      res.status(201).json(booking);
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   POST /api/bookings/:placeId
// @desc    Create a booking for a specific place (alternative endpoint)
// @access  Private (Visitors only)
router.post(
  '/:placeId',
  authMiddleware,
  [
    body('price').isNumeric().withMessage('Price must be a number'),
    body('scheduledDate').notEmpty().withMessage('Scheduled date is required'),
  ],
  async (req, res) => {
    try {
      // Only visitors can create bookings
      if (req.user.role !== 'visitor') {
        return res
          .status(403)
          .json({ message: 'Only visitors can create bookings' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const place = await Place.findById(req.params.placeId);
      if (!place) {
        return res.status(404).json({ message: 'Place not found' });
      }

      // Get promoter info
      const promoter = await User.findById(place.uploaderId);
      if (!promoter) {
        return res.status(404).json({ message: 'Promoter not found' });
      }

      // Validate hotel room availability
      if (place.category === 'Hotel' && req.body.selectedRoomIds) {
        const selectedRooms = place.rooms.filter((room) =>
          req.body.selectedRoomIds.includes(room.id)
        );
        const unavailableRooms = selectedRooms.filter(
          (room) => !room.isAvailable
        );
        if (unavailableRooms.length > 0) {
          return res.status(400).json({
            message: 'Some selected rooms are not available',
            unavailableRooms: unavailableRooms.map((r) => r.name),
          });
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
        status: 'pending',
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

      await booking.populate('placeId', 'name category address');
      await booking.populate('visitorId', 'username email');
      await booking.populate('promoterId', 'username email');

      res.status(201).json(booking);
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   PUT /api/bookings/:id
// @desc    Update a booking (mainly status updates by promoter)
// @access  Private
router.put(
  '/:id',
  authMiddleware,
  [
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check access
      if (req.user.role === 'visitor') {
        if (booking.visitorId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } else if (req.user.role === 'promoter') {
        if (booking.promoterId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Update allowed fields
      const allowedUpdates = [
        'status',
        'checkInTime',
        'tableNumber',
        'startDate',
        'endDate',
        'numberOfSlots',
        'checkInDate',
        'checkOutDate',
        'selectedRoomIds',
        'price',
        'duration',
      ];
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
      }

      Object.assign(booking, req.body);
      await booking.save();

      await booking.populate('placeId', 'name category address');
      await booking.populate('visitorId', 'username email');
      await booking.populate('promoterId', 'username email');

      res.json(booking);
    } catch (error) {
      console.error('Update booking error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Booking not found' });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking
// @access  Private (Visitor can delete their own, promoter can delete bookings for their places)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check access
    if (req.user.role === 'visitor') {
      if (booking.visitorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'promoter') {
      if (booking.promoterId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

