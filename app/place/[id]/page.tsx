"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ReviewSection } from "@/components/features/reviews/review-section";
import { RestaurantBookingForm } from "@/components/features/booking/restaurant-booking-form";
import { MountainBookingForm } from "@/components/features/booking/mountain-booking-form";
import { HotelBookingForm } from "@/components/features/booking/hotel-booking-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { placesAPI } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Place } from "@/lib/types";
import { MapPin, Star, ArrowLeft, Info } from "lucide-react";
import Image from "next/image";

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlace = async () => {
    try {
      const id = params.id as string;
      console.log("Loading place with ID:", id, "Current user:", currentUser);
      if (!id) {
        console.error("No ID provided");
        setPlace(null);
        setIsLoading(false);
        return;
      }
      const foundPlace = await placesAPI.getPlaceById(id);
      console.log("Found place:", foundPlace);
      if (foundPlace) {
        // Ensure the place has an id field (normalized from _id)
        if (!foundPlace.id && (foundPlace as any)._id) {
          (foundPlace as any).id = (foundPlace as any)._id.toString();
        }
        setPlace(foundPlace);
      } else {
        console.error("Place not found or missing id field");
        setPlace(null);
      }
    } catch (error: any) {
      console.error("Failed to load place:", error);
      // Check if it's a 403 (access denied) or 404 (not found)
      if (
        error.message?.includes("Access denied") ||
        error.message?.includes("403")
      ) {
        // For promoters, redirect to home if they don't own the place
        if (currentUser?.role === "promoter") {
          router.push("/");
          return;
        }
      }
      setPlace(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadPlace();
    }
  }, [params.id, currentUser]);

  // Prevent promoters from viewing places they didn't create
  useEffect(() => {
    if (place && currentUser?.role === "promoter") {
      const uploaderId =
        typeof place.uploaderId === "object" &&
        place.uploaderId !== null &&
        "_id" in place.uploaderId
          ? (place.uploaderId as any)._id.toString()
          : place.uploaderId.toString();

      if (currentUser.id !== uploaderId) {
        router.push("/");
      }
    }
  }, [place, currentUser, router]);

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

  // Show access denied for promoters viewing places they didn't create
  const uploaderId =
    typeof place.uploaderId === "object" &&
    place.uploaderId !== null &&
    "_id" in place.uploaderId
      ? (place.uploaderId as any)._id.toString()
      : place.uploaderId.toString();

  if (currentUser?.role === "promoter" && currentUser.id !== uploaderId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Access Denied
            </h1>
            <p className="text-muted-foreground mb-4">
              You can only view places that you have created.
            </p>
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
          <Link href="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Places
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              {place.image && (
                <div className="relative w-full h-64 md:h-96 overflow-hidden">
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      unoptimized
                    />
                  )}
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-3xl mb-2">
                      {place.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{place.address}</span>
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

            <ReviewSection place={place} onReviewAdded={setPlace} />
          </div>

          <div className="space-y-6">
            {/* Booking Section - Only visitors can book */}
            {currentUser?.role === "visitor" && (
              <>
                {place.category === "Visitable Place" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This is a visitable place and cannot be booked. You can
                      visit it directly!
                    </AlertDescription>
                  </Alert>
                )}

                {place.category === "Mountain" && (
                  <MountainBookingForm
                    place={place}
                    user={currentUser}
                    onBookingComplete={() => window.location.reload()}
                  />
                )}

                {place.category === "Hotel" && (
                  <HotelBookingForm
                    place={place}
                    user={currentUser}
                    onBookingComplete={() => window.location.reload()}
                  />
                )}

                {place.category === "Restaurant" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ready to Book?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full" size="lg">
                        <Link href={`/book/${place.id}`}>Book Now</Link>
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        Complete your booking on our dedicated booking page
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Quick preview of booking options */}
                {place.category === "Restaurant" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Restaurant bookings require check-in time. Click
                      &quot;Book Now&quot; to proceed.
                    </AlertDescription>
                  </Alert>
                )}

                {place.category === "Cafe" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Cafes cannot be booked. You can visit them directly
                      without making a reservation.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Promoter view */}
            {currentUser?.role === "promoter" &&
              currentUser.id === uploaderId && (
                <>
                  {place.category === "Restaurant" && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Restaurant bookings are made directly by visitors with
                        check-in time.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

            {!currentUser && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Please log in to make a booking.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
