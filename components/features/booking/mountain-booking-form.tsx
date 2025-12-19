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
import { Calendar, Hash, AlertCircle } from "lucide-react";
import { bookingsAPI } from "@/lib/api";
import type { Place, User } from "@/lib/types";

interface MountainBookingFormProps {
  place: Place;
  user: User;
  onBookingComplete: () => void;
}

export function MountainBookingForm({
  place,
  user,
  onBookingComplete,
}: MountainBookingFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numberOfSlots, setNumberOfSlots] = useState("");
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

    if (!startDate) {
      setError("Please select a start date");
      return;
    }

    if (!endDate) {
      setError("Please select an end date");
      return;
    }

    if (
      !numberOfSlots ||
      numberOfSlots.trim() === "" ||
      Number.parseInt(numberOfSlots) <= 0
    ) {
      setError("Please enter a valid number of slots");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError("Start date must be in the future");
      return;
    }

    if (end <= start) {
      setError("End date must be after start date");
      return;
    }

    const slots = Number.parseInt(numberOfSlots);
    if (isNaN(slots) || slots <= 0) {
      setError("Number of slots must be a positive number");
      return;
    }

    // Calculate duration in minutes (days * 24 * 60)
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const duration = days * 24 * 60;

    setIsBooking(true);

    try {
      await bookingsAPI.createBooking({
        placeId: place.id,
        price: 0, // Direct bookings don't have a fixed price from packages
        duration,
        scheduledDate: startDate,
        startDate,
        endDate,
        numberOfSlots: slots,
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
        <CardTitle>Book a Stay</CardTitle>
        <CardDescription>Reserve your stay at {place.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!success ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mountain-start-date">Start Date *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mountain-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value >= endDate) {
                        setEndDate("");
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mountain-end-date">End Date *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mountain-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mountain-slots">Number of Slots *</Label>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="mountain-slots"
                  type="number"
                  min="1"
                  value={numberOfSlots}
                  onChange={(e) => setNumberOfSlots(e.target.value)}
                  placeholder="e.g., 2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Number of slots (people) for your booking
              </p>
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
