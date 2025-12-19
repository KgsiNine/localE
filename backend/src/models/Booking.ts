import mongoose, { Schema } from "mongoose";
import { IBooking } from "../types";

const bookingSchema = new Schema<IBooking>(
  {
    placeId: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    placeName: {
      type: String,
      required: true,
    },
    visitorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitorName: {
      type: String,
      required: true,
    },
    promoterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    bookingDate: {
      type: Number,
      default: Date.now,
    },
    scheduledDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    // Restaurant-specific fields
    checkInTime: {
      type: String,
      default: null,
    },
    tableNumber: {
      type: String,
      default: null,
    },
    // Mountain-specific fields
    startDate: {
      type: String,
      default: null,
    },
    endDate: {
      type: String,
      default: null,
    },
    numberOfSlots: {
      type: Number,
      default: null,
    },
    // Hotel-specific fields
    checkInDate: {
      type: String,
      default: null,
    },
    checkOutDate: {
      type: String,
      default: null,
    },
    selectedRoomIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
bookingSchema.index({ visitorId: 1 });
bookingSchema.index({ promoterId: 1 });
bookingSchema.index({ placeId: 1 });

export default mongoose.model<IBooking>("Booking", bookingSchema);

