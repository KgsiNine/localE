"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { RestaurantBookingForm } from "@/components/features/booking/restaurant-booking-form";
import { MountainBookingForm } from "@/components/features/booking/mountain-booking-form";
import { HotelBookingForm } from "@/components/features/booking/hotel-booking-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { placesAPI } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { RouteGuard } from "@/components/auth/route-guard";
import type { Place } from "@/lib/types";
import { MapPin, Star, ArrowLeft, Info, Calendar } from "lucide-react";
import Image from "next/image";

function BookingPageContent() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const placeId = params.placeId as string;

  useEffect(() => {
    const loadPlace = async () => {
      try {
        const foundPlace = await placesAPI.getPlaceById(placeId);
        setPlace(foundPlace);
      } catch (error) {
        console.error("Failed to load place:", error);
        setPlace(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlace();
  }, [placeId]);

  const handleBookingComplete = () => {
    // Redirect to bookings page after successful booking
    setTimeout(() => {
      router.push("/bookings");
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Place not found
            </h1>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const averageRating =
    place.reviews.length > 0
      ? place.reviews.reduce((acc, review) => acc + review.rating, 0) /
        place.reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/place/${place.id}`} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Place Details
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] max-w-6xl mx-auto">
          {/* Place Information */}
          <div className="space-y-6">
            <Card>
              {place.image && (
                <div className="relative w-full h-64 overflow-hidden">
                  {place.image.startsWith("data:") ? (
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={place.image}
                      alt={place.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      unoptimized
                    />
                  )}
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl mb-2">
                      {place.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{place.address}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {place.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  {place.description}
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-lg font-semibold">
                      {averageRating > 0
                        ? averageRating.toFixed(1)
                        : "No ratings"}
                    </span>
                  </div>
                  {place.reviews.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      Based on {place.reviews.length}{" "}
                      {place.reviews.length === 1 ? "review" : "reviews"}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Make a Booking
              </h2>
              <p className="text-muted-foreground">
                Complete your booking details below
              </p>
            </div>

            {/* Visitable Place - Cannot be booked */}
            {place.category === "Visitable Place" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">
                      This is a visitable place and cannot be booked.
                    </p>
                    <p className="text-sm">
                      You can visit it directly without making a reservation.
                    </p>
                    <Button asChild variant="outline" className="mt-2">
                      <Link href={`/place/${place.id}`}>
                        View Place Details
                      </Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Restaurant Booking */}
            {place.category === "Restaurant" && (
              <RestaurantBookingForm
                place={place}
                user={currentUser!}
                onBookingComplete={handleBookingComplete}
              />
            )}

            {/* Mountain Booking */}
            {place.category === "Mountain" && (
              <MountainBookingForm
                place={place}
                user={currentUser!}
                onBookingComplete={handleBookingComplete}
              />
            )}

            {/* Hotel Booking */}
            {place.category === "Hotel" && (
              <HotelBookingForm
                place={place}
                user={currentUser!}
                onBookingComplete={handleBookingComplete}
              />
            )}

            {/* Cafe - Cannot be booked */}
            {place.category === "Cafe" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Cafes cannot be booked. You can visit them directly without
                  making a reservation.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <RouteGuard requireAuth={true} requireRole="visitor">
      <BookingPageContent />
    </RouteGuard>
  );
}
