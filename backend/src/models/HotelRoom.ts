import { Schema } from "mongoose";
import { IHotelRoom } from "../types";

const hotelRoomSchema = new Schema<IHotelRoom>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

export default hotelRoomSchema;

