import { Schema } from "mongoose";
import { IReview } from "../types";

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Number,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

export default reviewSchema;
