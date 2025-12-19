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
import { Calendar, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { bookingsAPI } from "@/lib/api";
import type { Place, User } from "@/lib/types";

interface HotelBookingFormProps {
  place: Place;
  user: User;
  onBookingComplete: () => void;
}

export function HotelBookingForm({
  place,
  user,
  onBookingComplete,
}: HotelBookingFormProps) {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
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

  const handleBooking = async () => {
    setError("");

    if (!checkInDate) {
      setError("Please select a check-in date");
      return;
    }

    if (!checkOutDate) {
      setError("Please select a check-out date");
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setError("Check-in date must be in the future");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in date");
      return;
    }

    if (selectedRoomIds.length === 0) {
      setError("Please select at least one room");
      return;
    }

    // Calculate duration in minutes (nights * 24 * 60)
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    const duration = nights * 24 * 60;

    setIsBooking(true);

    try {
      await bookingsAPI.createBooking({
        placeId: place.id,
        price: 0, // Direct bookings don't have a fixed price from packages
        duration,
        scheduledDate: checkInDate,
        checkInDate,
        checkOutDate,
        selectedRoomIds,
      });

      setSuccess(true);
      setIsBooking(false);
      setTimeout(() => {
        onBookingComplete();
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create booking"
      );
      setIsBooking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Room</CardTitle>
        <CardDescription>Reserve your stay at {place.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!success ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hotel-checkin-date">Check-in Date *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hotel-checkin-date"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      if (checkOutDate && e.target.value >= checkOutDate) {
                        setCheckOutDate("");
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel-checkout-date">Check-out Date *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hotel-checkout-date"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Rooms *</Label>
              {place.rooms && place.rooms.length > 0 ? (
                <>
                  <div className="space-y-2 border border-border rounded-lg p-4">
                    {place.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`room-${room.id}`}
                          checked={selectedRoomIds.includes(room.id)}
                          disabled={!room.isAvailable}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRoomIds([...selectedRoomIds, room.id]);
                            } else {
                              setSelectedRoomIds(
                                selectedRoomIds.filter((id) => id !== room.id)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`room-${room.id}`}
                          className={`text-sm font-normal cursor-pointer ${
                            !room.isAvailable
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          {room.name}
                          {!room.isAvailable && " (Unavailable)"}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select the room(s) you want to book
                  </p>
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No rooms available for booking. Please contact the hotel
                    directly.
                  </AlertDescription>
                </Alert>
              )}
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
              {isBooking ? "Booking..." : "Book Now"}
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
