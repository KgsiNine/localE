"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Calendar, Hash, AlertCircle } from "lucide-react";
import { addBooking } from "@/lib/storage";
import type { Place, User, Booking } from "@/lib/types";

interface RestaurantBookingFormProps {
  place: Place;
  user: User;
  onBookingComplete: () => void;
}

export function RestaurantBookingForm({
  place,
  user,
  onBookingComplete,
}: RestaurantBookingFormProps) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Prevent promoters from booking any places
  if (user.role === "promoter") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Not Available</CardTitle>
          <CardDescription>Promoters cannot make bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Promoters cannot book places. Only visitors can make bookings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleBooking = () => {
    setError("");

    if (!scheduledDate) {
      setError("Please select a date for your booking");
      return;
    }

    if (!checkInTime) {
      setError("Please select a check-in time");
      return;
    }

    if (!tableNumber || tableNumber.trim() === "") {
      setError("Please enter a table number");
      return;
    }

    const selectedDate = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Please select a future date");
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(checkInTime)) {
      setError("Please enter a valid time in HH:MM format (e.g., 19:30)");
      return;
    }

    setIsBooking(true);

    const booking: Booking = {
      id: `book_${Date.now()}`,
      placeId: place.id,
      placeName: place.name,
      visitorId: user.id,
      visitorName: user.username,
      promoterId: place.uploaderId,
      price: 0, // Restaurant bookings don't have a fixed price from packages
      duration: 120, // Default 2 hours for restaurant bookings
      bookingDate: Date.now(),
      scheduledDate,
      status: "pending",
      checkInTime,
      tableNumber: tableNumber.trim(),
    };

    addBooking(booking);

    setSuccess(true);
    setIsBooking(false);
    setTimeout(() => {
      onBookingComplete();
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Table</CardTitle>
        <CardDescription>Reserve your table at {place.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!success ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="rest-date">Select Date *</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="rest-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkin-time">Check-in Time *</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="checkin-time"
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  placeholder="19:30"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter time in 24-hour format (e.g., 19:30)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="table-number">Table Number *</Label>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="table-number"
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g., Table 5 or T-12"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleBooking}
              disabled={isBooking}
              className="w-full"
            >
              {isBooking ? "Booking..." : "Book Table"}
            </Button>
          </>
        ) : (
          <Alert className="bg-green-500/10 border-green-500/50">
            <AlertDescription className="text-green-600 dark:text-green-400">
              Booking successful! Redirecting...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
