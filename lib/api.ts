import type { User, Place, Booking, Review } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

// Helper function to set auth token
function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
}

// Helper function to get current user from token
function getCurrentUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("current_user");
  return data ? JSON.parse(data) : null;
}

// Helper function to set current user
function setCurrentUserInStorage(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("current_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("current_user");
  }
}

// Helper to normalize MongoDB ObjectId fields
function normalizeIds(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(normalizeIds);
  }

  if (data && typeof data === "object" && data.constructor === Object) {
    const normalized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip __v and other MongoDB internal fields
      if (key === "__v") {
        continue;
      }

      // Convert _id to id
      if (key === "_id") {
        normalized.id = value?.toString() || value;
        continue;
      }

      // Handle populated fields (objects with _id) - convert to just the ID string
      if (
        value &&
        typeof value === "object" &&
        "_id" in value &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        // If it's a populated field (like uploaderId), extract just the _id
        if (
          key.endsWith("Id") ||
          key === "uploaderId" ||
          key === "visitorId" ||
          key === "promoterId"
        ) {
          normalized[key] = value._id?.toString() || value.toString();
        } else {
          normalized[key] = normalizeIds(value);
        }
      } else {
        normalized[key] = normalizeIds(value);
      }
    }
    return normalized;
  }
  return data;
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { message: `HTTP error! status: ${response.status}` };
    }
    // Don't log 401 errors for /auth/me as they're expected when not logged in
    if (!(response.status === 401 && endpoint === "/auth/me")) {
      console.error(
        "API Error:",
        error,
        "Endpoint:",
        endpoint,
        "Status:",
        response.status
      );
    }
    throw new Error(error.message || "API request failed");
  }

  const data = await response.json();
  const normalized = normalizeIds(data);
  return normalized as T;
}

// Auth API
export const authAPI = {
  async signup(
    email: string,
    password: string,
    username: string,
    role: "promoter" | "visitor" = "visitor"
  ): Promise<{ token: string; user: User }> {
    const data = await apiFetch<{ token: string; user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, username, role }),
    });
    setAuthToken(data.token);
    setCurrentUserInStorage(data.user);
    return data;
  },

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    const data = await apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    setCurrentUserInStorage(data.user);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (error) {
      // Ignore errors on logout
    }
    setAuthToken(null);
    setCurrentUserInStorage(null);
  },

  async getCurrentUser(): Promise<User> {
    const data = await apiFetch<{ user: User }>("/auth/me");
    setCurrentUserInStorage(data.user);
    return data.user;
  },

  getStoredUser(): User | null {
    return getCurrentUserFromStorage();
  },
};

// Places API
export const placesAPI = {
  async getAllPlaces(params?: {
    category?: string;
    search?: string;
  }): Promise<Place[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const endpoint = `/places${queryString ? `?${queryString}` : ""}`;
    return apiFetch<Place[]>(endpoint);
  },

  async getPlaceById(id: string): Promise<Place> {
    return apiFetch<Place>(`/places/${id}`);
  },

  async createPlace(place: {
    name: string;
    description: string;
    category: Place["category"];
    address: string;
    latitude?: number;
    longitude?: number;
    uploaderId: string;
    image?: string | null;
    rooms?: Array<{ id: string; name: string; isAvailable: boolean }>;
  }): Promise<Place> {
    return apiFetch<Place>("/places", {
      method: "POST",
      body: JSON.stringify({
        name: place.name,
        description: place.description,
        category: place.category,
        address: place.address,
        latitude: place.latitude || 0,
        longitude: place.longitude || 0,
        image: place.image || null,
        rooms: place.rooms || [],
      }),
    });
  },

  async updatePlace(id: string, updates: Partial<Place>): Promise<Place> {
    return apiFetch<Place>(`/places/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deletePlace(id: string): Promise<void> {
    await apiFetch(`/places/${id}`, { method: "DELETE" });
  },
};

// Reviews API
export const reviewsAPI = {
  async addReview(
    placeId: string,
    review: { rating: number; comment: string }
  ): Promise<Place> {
    return apiFetch<Place>(`/places/${placeId}/reviews`, {
      method: "POST",
      body: JSON.stringify(review),
    });
  },

  async deleteReview(placeId: string, reviewId: string): Promise<Place> {
    return apiFetch<Place>(`/places/${placeId}/reviews/${reviewId}`, {
      method: "DELETE",
    });
  },
};

// Bookings API
export const bookingsAPI = {
  async getAllBookings(): Promise<Booking[]> {
    return apiFetch<Booking[]>("/bookings");
  },

  async getBookingById(id: string): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}`);
  },

  async createBooking(booking: {
    placeId: string;
    price: number;
    duration?: number;
    scheduledDate: string;
    checkInTime?: string | null;
    tableNumber?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    numberOfSlots?: number | null;
    checkInDate?: string | null;
    checkOutDate?: string | null;
    selectedRoomIds?: string[];
  }): Promise<Booking> {
    return apiFetch<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify({
        placeId: booking.placeId,
        price: booking.price,
        duration: booking.duration || 0,
        scheduledDate: booking.scheduledDate,
        checkInTime: booking.checkInTime,
        tableNumber: booking.tableNumber,
        startDate: booking.startDate,
        endDate: booking.endDate,
        numberOfSlots: booking.numberOfSlots,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        selectedRoomIds: booking.selectedRoomIds || [],
      }),
    });
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteBooking(id: string): Promise<void> {
    await apiFetch(`/bookings/${id}`, { method: "DELETE" });
  },
};
