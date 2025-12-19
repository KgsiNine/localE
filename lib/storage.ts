import type { User, Place, Booking } from "./types";

const USERS_KEY = "local_explorer_users";
const PLACES_KEY = "local_explorer_places";
const CURRENT_USER_KEY = "local_explorer_current_user";
const BOOKINGS_KEY = "local_explorer_bookings";

// Initial seed data
const initialUsers: User[] = [
  {
    id: "1",
    email: "demo@example.com",
    username: "DemoUser",
    password: "demo123",
    role: "promoter",
  },
  {
    id: "2",
    email: "visitor@example.com",
    username: "VisitorDemo",
    password: "demo123",
    role: "visitor",
  },
];

const initialPlaces: Place[] = [
  {
    id: "1",
    name: "Mario's Italian Bistro",
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
        comment:
          "Amazing pasta and excellent service! Highly recommend the carbonara.",
        date: Date.now() - 86400000,
      },
    ],
    uploadedAt: Date.now() - 86400000 * 7,
  },
  {
    id: "2",
    name: "Central Park",
    description:
      "Beautiful urban park with walking trails, playgrounds, and scenic views. Great for picnics and outdoor activities.",
    category: "Visitable Place",
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
    uploadedAt: Date.now() - 172800000 * 2,
  },
  {
    id: "3",
    name: "Modern Art Museum",
    description:
      "Contemporary art museum featuring rotating exhibitions from local and international artists.",
    category: "Visitable Place",
    address: "789 Culture Boulevard",
    latitude: 40.7614,
    longitude: -73.9776,
    uploaderId: "1",
    reviews: [],
    uploadedAt: Date.now() - 259200000,
  },
  {
    id: "4",
    name: "Brew & Bean Cafe",
    description:
      "Artisan coffee shop with freshly baked pastries and a cozy atmosphere. Perfect for remote work.",
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
    uploadedAt: Date.now() - 259200000 * 2,
  },
  {
    id: "5",
    name: "Grand Mountain Resort",
    description:
      "Experience breathtaking mountain views with guided hiking tours, camping packages, and adventure activities. Perfect for nature enthusiasts.",
    category: "Mountain",
    address: "Mountain Trail Road, Alpine Valley",
    latitude: 40.7589,
    longitude: -73.9851,
    uploaderId: "1",
    reviews: [],
    uploadedAt: Date.now() - 86400000,
  },
  {
    id: "6",
    name: "Luxury Downtown Hotel",
    description:
      "5-star hotel in the heart of the city with premium amenities, spa services, and fine dining. Perfect for business and leisure travelers.",
    category: "Hotel",
    address: "789 Luxury Boulevard, Downtown",
    latitude: 40.7505,
    longitude: -73.9934,
    uploaderId: "1",
    rooms: [
      { id: "room_a", name: "Room A", isAvailable: true },
      { id: "room_b", name: "Room B", isAvailable: true },
      { id: "room_c", name: "Room C", isAvailable: true },
      { id: "room_d", name: "Room D", isAvailable: true },
      { id: "room_e", name: "Room E", isAvailable: false },
    ],
    reviews: [
      {
        id: "r4",
        userId: "2",
        userName: "VisitorDemo",
        rating: 5,
        comment: "Exceptional service and beautiful rooms. Highly recommended!",
        date: Date.now() - 432000000,
      },
    ],
    uploadedAt: Date.now() - 432000000,
  },
  {
    id: "7",
    name: "Eagle Peak Mountain Trail",
    description:
      "Challenging mountain trail with stunning panoramic views. Features multiple difficulty levels, wildlife spotting opportunities, and professional guides. Perfect for adventure seekers and nature photographers.",
    category: "Mountain",
    address: "Eagle Peak Road, High Altitude Range",
    latitude: 41.0128,
    longitude: -74.1234,
    uploaderId: "1",
    reviews: [
      {
        id: "r5",
        userId: "2",
        userName: "VisitorDemo",
        rating: 5,
        comment:
          "Amazing experience! The views were absolutely breathtaking. The guides were knowledgeable and friendly.",
        date: Date.now() - 345600000,
      },
    ],
    uploadedAt: Date.now() - 345600000,
  },
];

// Initialize localStorage with seed data if empty
export function initializeStorage() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }

  // Initialize places - merge with existing to ensure all seed places are present
  const existingPlaces = getPlaces();
  const existingPlaceIds = new Set(existingPlaces.map((p) => p.id));

  // Add any missing seed places
  const missingPlaces = initialPlaces.filter(
    (place) => !existingPlaceIds.has(place.id)
  );

  // Update existing hotel places to include rooms if they don't have them
  const updatedExistingPlaces = existingPlaces.map((place) => {
    if (
      place.category === "Hotel" &&
      (!place.rooms || place.rooms.length === 0)
    ) {
      // Find the corresponding seed place to get its rooms
      const seedPlace = initialPlaces.find((p) => p.id === place.id);
      if (seedPlace && seedPlace.rooms) {
        return { ...place, rooms: seedPlace.rooms };
      }
    }
    return place;
  });

  if (missingPlaces.length > 0) {
    const updatedPlaces = [...updatedExistingPlaces, ...missingPlaces];
    savePlaces(updatedPlaces);
  } else if (existingPlaces.length === 0) {
    // If no places exist at all, initialize with seed data
    savePlaces(initialPlaces);
  } else {
    // Update existing places with rooms if needed
    savePlaces(updatedExistingPlaces);
  }

  if (!localStorage.getItem(BOOKINGS_KEY)) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify([]));
  }
}

// Users
export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addUser(user: User) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

// Places
export function getPlaces(): Place[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(PLACES_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePlaces(places: Place[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLACES_KEY, JSON.stringify(places));
}

export function addPlace(place: Place) {
  const places = getPlaces();
  places.push(place);
  savePlaces(places);
}

export function getPlaceById(id: string): Place | undefined {
  const places = getPlaces();
  return places.find((place) => place.id === id);
}

export function updatePlace(updatedPlace: Place) {
  const places = getPlaces();
  const index = places.findIndex((place) => place.id === updatedPlace.id);
  if (index !== -1) {
    places[index] = updatedPlace;
    savePlaces(places);
  }
}

// Current User
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Bookings
export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(BOOKINGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function addBooking(booking: Booking) {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
}

export function getBookingsByVisitor(visitorId: string): Booking[] {
  return getBookings().filter((b) => b.visitorId === visitorId);
}

export function getBookingsByPromoter(promoterId: string): Booking[] {
  return getBookings().filter((b) => b.promoterId === promoterId);
}

export function updateBooking(updatedBooking: Booking) {
  const bookings = getBookings();
  const index = bookings.findIndex((b) => b.id === updatedBooking.id);
  if (index !== -1) {
    bookings[index] = updatedBooking;
    saveBookings(bookings);
  }
}
