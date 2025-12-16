"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Users, DollarSign, Calendar, AlertCircle } from "lucide-react"
import { addBooking, updatePlace } from "@/lib/storage"
import type { BookingPackage, Place, User, Booking } from "@/lib/types"

interface BookingCardProps {
  pkg: BookingPackage
  place: Place
  user: User
  onBookingComplete: () => void
}

export function BookingCard({ pkg, place, user, onBookingComplete }: BookingCardProps) {
  const [scheduledDate, setScheduledDate] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleBooking = () => {
    setError("")

    if (!scheduledDate) {
      setError("Please select a date for your booking")
      return
    }

    const selectedDate = new Date(scheduledDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setError("Please select a future date")
      return
    }

    if (pkg.availableSlots <= 0) {
      setError("No slots available for this package")
      return
    }

    setIsBooking(true)

    const booking: Booking = {
      id: `book_${Date.now()}`,
      packageId: pkg.id,
      packageName: pkg.name,
      placeId: place.id,
      placeName: place.name,
      visitorId: user.id,
      visitorName: user.username,
      promoterId: place.uploaderId,
      price: pkg.price,
      duration: pkg.duration,
      bookingDate: Date.now(),
      scheduledDate,
      status: "pending",
    }

    addBooking(booking)

    // Update available slots
    const updatedPlace = { ...place }
    const packageIndex = updatedPlace.packages.findIndex((p) => p.id === pkg.id)
    if (packageIndex !== -1) {
      updatedPlace.packages[packageIndex].availableSlots -= 1
      updatePlace(updatedPlace)
    }

    setSuccess(true)
    setIsBooking(false)
    setTimeout(() => {
      onBookingComplete()
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{pkg.name}</CardTitle>
        {pkg.description && <CardDescription>{pkg.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-lg">${pkg.price}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{pkg.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{pkg.availableSlots} slots available</span>
          </div>
        </div>

        {!success && pkg.availableSlots > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor={`date-${pkg.id}`}>Select Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id={`date-${pkg.id}`}
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleBooking} disabled={isBooking} className="w-full">
              {isBooking ? "Booking..." : "Book Now"}
            </Button>
          </div>
        )}

        {success && (
          <Alert className="bg-green-500/10 border-green-500/50">
            <AlertDescription className="text-green-600 dark:text-green-400">
              Booking successful! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {pkg.availableSlots === 0 && !success && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>This package is fully booked</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
