import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  role: "promoter" | "visitor";
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): Omit<IUser, "password">;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReview extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  date: number;
}

export interface IHotelRoom {
  id: string;
  name: string;
  isAvailable: boolean;
}

export type PlaceCategory =
  | "Restaurant"
  | "Hotel"
  | "Cafe"
  | "Mountain"
  | "Visitable Place";

export interface IPlace extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: PlaceCategory;
  address: string;
  latitude: number;
  longitude: number;
  uploaderId: Types.ObjectId;
  image?: string | null;
  reviews: IReview[];
  uploadedAt: number;
  rooms?: IHotelRoom[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface IBooking extends Document {
  _id: Types.ObjectId;
  placeId: Types.ObjectId;
  placeName: string;
  visitorId: Types.ObjectId;
  visitorName: string;
  promoterId: Types.ObjectId;
  price: number;
  duration: number;
  bookingDate: number;
  scheduledDate: string;
  status: BookingStatus;
  // Restaurant-specific fields
  checkInTime?: string | null;
  tableNumber?: string | null;
  // Mountain-specific fields
  startDate?: string | null;
  endDate?: string | null;
  numberOfSlots?: number | null;
  // Hotel-specific fields
  checkInDate?: string | null;
  checkOutDate?: string | null;
  selectedRoomIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Express Request extension
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
