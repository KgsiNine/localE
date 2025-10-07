export interface Review {
  id: string
  userId: string
  userName: string
  rating: number // 1 to 5
  comment: string
  date: number // timestamp
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
}

export interface User {
  id: string
  email: string
  username: string
  password: string
}
