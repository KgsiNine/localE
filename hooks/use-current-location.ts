import { useState, useEffect } from "react"

interface Coords {
  lat: number
  lng: number
}

interface LocationState {
  coords: Coords | null
  error: string | null
  loading: boolean
}

// Default center (used while location is loading or if access is denied)
const defaultCenter = {
  lat: 34.0522, // Example: Los Angeles (or any fallback location)
  lng: -118.2437,
}

export const useCurrentLocation = (fallbackCenter: Coords = defaultCenter): LocationState => {
  const [locationState, setLocationState] = useState<LocationState>({
    coords: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    // Check if the browser supports geolocation
    if (!("geolocation" in navigator)) {
      setLocationState({
        coords: fallbackCenter,
        error: "Geolocation is not supported by your browser.",
        loading: false,
      })
      return
    }

    // Success handler
    const successHandler: PositionCallback = (position) => {
      setLocationState({
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
        loading: false,
      })
    }

    // Error handler
    const errorHandler: PositionErrorCallback = (error) => {
      let message = ""
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "Location access denied by user. Using fallback center."
          break
        case error.POSITION_UNAVAILABLE:
          message = "Location information is unavailable. Using fallback center."
          break
        case error.TIMEOUT:
          message = "The request to get user location timed out. Using fallback center."
          break
        default:
          message = "An unknown error occurred while getting location. Using fallback center."
          break
      }
      
      setLocationState({
        coords: fallbackCenter,
        error: message,
        loading: false,
      })
    }

    // Request the current position
    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }, [fallbackCenter])

  return locationState
}