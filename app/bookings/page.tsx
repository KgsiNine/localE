"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { getBookingsByVisitor, getBookingsByPromoter, updateBooking } from "@/lib/storage"
import type { Booking } from "@/lib/types"
import { Calendar, Clock, DollarSign, MapPin, User, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function BookingsPage() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    const loadBookings = () => {
      const userBookings =
        currentUser.role === "visitor" ? getBookingsByVisitor(currentUser.id) : getBookingsByPromoter(currentUser.id)

      setBookings(userBookings.sort((a, b) => b.bookingDate - a.bookingDate))
      setIsLoading(false)
    }

    loadBookings()
  }, [currentUser, router])

  const handleStatusChange = (booking: Booking, newStatus: Booking["status"]) => {
    const updatedBooking = { ...booking, status: newStatus }
    updateBooking(updatedBooking)
    setBookings(bookings.map((b) => (b.id === booking.id ? updatedBooking : b)))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-500/50"
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/50"
      default:
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/50"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {currentUser?.role === "visitor" ? "My Bookings" : "Booking Requests"}
          </h1>
          <p className="text-muted-foreground">
            {currentUser?.role === "visitor"
              ? "View and manage your place bookings"
              : "Manage booking requests from visitors"}
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                {currentUser?.role === "visitor"
                  ? "Start exploring places and make your first booking"
                  : "Bookings from visitors will appear here"}
              </p>
              {currentUser?.role === "visitor" && (
                <Button asChild>
                  <Link href="/">Browse Places</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="mb-1">{booking.placeName}</CardTitle>
                      <CardDescription>{booking.packageName}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 text-sm">
                      {currentUser?.role === "promoter" && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Visitor: {booking.visitorName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Scheduled: {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Duration: {booking.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Price: ${booking.price}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-muted-foreground">
                        Booked: {new Date(booking.bookingDate).toLocaleString()}
                      </p>

                      {currentUser?.role === "promoter" && booking.status === "pending" && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => handleStatusChange(booking, "confirmed")} className="flex-1">
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(booking, "cancelled")}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {currentUser?.role === "visitor" && (
                        <Button size="sm" variant="outline" asChild className="mt-2 bg-transparent">
                          <Link href={`/place/${booking.placeId}`}>
                            <MapPin className="h-4 w-4 mr-2" />
                            View Place
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
