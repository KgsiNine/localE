export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: number; // timestamp
}

export interface HotelRoom {
  id: string;
  name: string; // e.g., "Room A", "Room B"
  isAvailable: boolean;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  category: "Restaurant" | "Hotel" | "Cafe" | "Mountain" | "Visitable Place";
  address: string;
  latitude: number;
  longitude: number;
  uploaderId: string;
  image?: string; // Optional image URL or base64 string
  reviews: Review[];
  uploadedAt?: number; // timestamp when place was uploaded
  rooms?: HotelRoom[]; // For Hotel places - list of rooms with availability
}

export interface Booking {
  id: string;
  placeId: string;
  placeName: string;
  visitorId: string;
  visitorName: string;
  promoterId: string;
  price: number;
  duration: number;
  bookingDate: number; // timestamp when booking was made
  scheduledDate: string; // date string for the scheduled visit
  status: "pending" | "confirmed" | "cancelled";
  // Restaurant-specific fields
  checkInTime?: string; // Required for restaurant bookings (e.g., "19:30")
  tableNumber?: string; // Required for restaurant bookings
  // Mountain-specific fields
  startDate?: string; // Required for mountain bookings - start date
  endDate?: string; // Required for mountain bookings - end date
  numberOfSlots?: number; // Required for mountain bookings - number of slots (people)
  // Hotel-specific fields
  checkInDate?: string; // Required for hotel bookings - date string for check-in
  checkOutDate?: string; // Required for hotel bookings - date string for check-out
  selectedRoomIds?: string[]; // Required for hotel bookings - IDs of selected rooms
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role: "promoter" | "visitor";
}
