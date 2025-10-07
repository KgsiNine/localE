import type { User, Place } from "./types"

const USERS_KEY = "local_explorer_users"
const PLACES_KEY = "local_explorer_places"
const CURRENT_USER_KEY = "local_explorer_current_user"

// Initial seed data
const initialUsers: User[] = [
  {
    id: "1",
    email: "demo@example.com",
    username: "DemoUser",
    password: "demo123",
  },
]

const initialPlaces: Place[] = [
  {
    id: "1",
    name: "The Golden Fork",
    description:
      "A cozy restaurant serving authentic Italian cuisine with a modern twist. Perfect for romantic dinners and family gatherings.",
    category: "Restaurant",
    address: "123 Main Street, Downtown",
    latitude: 40.7128,
    longitude: -74.006,
    uploaderId: "1",
    reviews: [
      {
        id: "r1",
        userId: "1",
        userName: "DemoUser",
        rating: 5,
        comment: "Amazing pasta and excellent service! Highly recommend the carbonara.",
        date: Date.now() - 86400000,
      },
    ],
  },
  {
    id: "2",
    name: "Central Park",
    description:
      "Beautiful urban park with walking trails, playgrounds, and scenic views. Great for picnics and outdoor activities.",
    category: "Park",
    address: "456 Park Avenue",
    latitude: 40.7829,
    longitude: -73.9654,
    uploaderId: "1",
    reviews: [
      {
        id: "r2",
        userId: "1",
        userName: "DemoUser",
        rating: 4,
        comment: "Lovely place for a morning jog. Very well maintained.",
        date: Date.now() - 172800000,
      },
    ],
  },
  {
    id: "3",
    name: "Modern Art Museum",
    description: "Contemporary art museum featuring rotating exhibitions from local and international artists.",
    category: "Museum",
    address: "789 Culture Boulevard",
    latitude: 40.7614,
    longitude: -73.9776,
    uploaderId: "1",
    reviews: [],
  },
  {
    id: "4",
    name: "Brew & Bean Cafe",
    description: "Artisan coffee shop with freshly baked pastries and a cozy atmosphere. Perfect for remote work.",
    category: "Cafe",
    address: "321 Coffee Lane",
    latitude: 40.7489,
    longitude: -73.968,
    uploaderId: "1",
    reviews: [
      {
        id: "r3",
        userId: "1",
        userName: "DemoUser",
        rating: 5,
        comment: "Best latte in town! The ambiance is perfect for working.",
        date: Date.now() - 259200000,
      },
    ],
  },
]

// Initialize localStorage with seed data if empty
export function initializeStorage() {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers))
  }

  if (!localStorage.getItem(PLACES_KEY)) {
    localStorage.setItem(PLACES_KEY, JSON.stringify(initialPlaces))
  }
}

// Users
export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveUsers(users: User[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function addUser(user: User) {
  const users = getUsers()
  users.push(user)
  saveUsers(users)
}

// Places
export function getPlaces(): Place[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(PLACES_KEY)
  return data ? JSON.parse(data) : []
}

export function savePlaces(places: Place[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(PLACES_KEY, JSON.stringify(places))
}

export function addPlace(place: Place) {
  const places = getPlaces()
  places.push(place)
  savePlaces(places)
}

export function getPlaceById(id: string): Place | undefined {
  const places = getPlaces()
  return places.find((place) => place.id === id)
}

export function updatePlace(updatedPlace: Place) {
  const places = getPlaces()
  const index = places.findIndex((place) => place.id === updatedPlace.id)
  if (index !== -1) {
    places[index] = updatedPlace
    savePlaces(places)
  }
}

// Current User
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(CURRENT_USER_KEY)
  return data ? JSON.parse(data) : null
}

export function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}
