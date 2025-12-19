export interface Review {
  id: string
  userId: string
  userName: string
  rating: number // 1 to 5
  comment: string
  date: number // timestamp
}

export interface BookingPackage {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  availableSlots: number
  joinDate?: string // Required for mountain packages - date string for when the package starts
}

export interface Place {
  id: string
  name: string
  description: string
  category: "Restaurant" | "Hotel" | "Cafe" | "Mountain" | "Visitable Place"
  address: string
  latitude: number
  longitude: number
  uploaderId: string
  image?: string // Optional image URL or base64 string
  reviews: Review[]
  packages: BookingPackage[]
  uploadedAt?: number // timestamp when place was uploaded
}

export interface Booking {
  id: string
  packageId?: string // Optional - not needed for restaurant bookings
  packageName?: string // Optional - not needed for restaurant bookings
  placeId: string
  placeName: string
  visitorId: string
  visitorName: string
  promoterId: string
  price: number
  duration: number
  bookingDate: number // timestamp when booking was made
  scheduledDate: string // date string for the scheduled visit
  status: "pending" | "confirmed" | "cancelled"
  // Restaurant-specific fields
  checkInTime?: string // Required for restaurant bookings (e.g., "19:30")
  tableNumber?: string // Required for restaurant bookings
  // Mountain-specific fields
  joinDate?: string // Required for mountain bookings - date string for when joining the package
}

export interface User {
  id: string
  email: string
  username: string
  password: string
  role: "promoter" | "visitor"
}
