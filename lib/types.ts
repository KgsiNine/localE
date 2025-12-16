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
}

export interface Place {
  id: string
  name: string
  description: string
  category: "Restaurant" | "Park" | "Museum" | "Cafe" | "Other"
  address: string
  latitude: number
  longitude: number
  uploaderId: string
  reviews: Review[]
  packages: BookingPackage[]
}

export interface Booking {
  id: string
  packageId: string
  packageName: string
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
}

export interface User {
  id: string
  email: string
  username: string
  password: string
  role: "promoter" | "visitor"
}
