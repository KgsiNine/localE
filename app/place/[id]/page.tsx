"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { ReviewSection } from "@/components/features/reviews/review-section"
import { BookingCard } from "@/components/features/booking/booking-card"
import { RestaurantBookingForm } from "@/components/features/booking/restaurant-booking-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPlaceById } from "@/lib/storage"
import { useAuth } from "@/hooks/use-auth"
import type { Place } from "@/lib/types"
import { MapPin, Star, ArrowLeft, Info } from "lucide-react"
import Image from "next/image"

export default function PlaceDetailPage() {
  const params = useParams()
  const { currentUser } = useAuth()
  const [place, setPlace] = useState<Place | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadPlace = () => {
    const id = params.id as string
    const foundPlace = getPlaceById(id)
    setPlace(foundPlace || null)
  }

  useEffect(() => {
    loadPlace()
    setIsLoading(false)
  }, [params.id])

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
    )
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Place not found</h1>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const averageRating =
    place.reviews.length > 0 ? place.reviews.reduce((acc, review) => acc + review.rating, 0) / place.reviews.length : 0

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
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
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
                    <CardTitle className="text-3xl mb-2">{place.name}</CardTitle>
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
                <p className="text-foreground leading-relaxed">{place.description}</p>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-lg font-semibold">
                      {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
                    </span>
                  </div>
                  {place.reviews.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      Based on {place.reviews.length} {place.reviews.length === 1 ? "review" : "reviews"}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <ReviewSection place={place} onReviewAdded={setPlace} />
          </div>

          <div className="space-y-6">
            {/* Booking Section - Different based on category and user role */}
            {currentUser?.role === "visitor" && (
              <>
                {place.category === "Visitable Place" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This is a visitable place and cannot be booked. You can visit it directly!
                    </AlertDescription>
                  </Alert>
                )}

                {place.category !== "Visitable Place" && (
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
                      Restaurant bookings require check-in time and table number. Click &quot;Book Now&quot; to proceed.
                    </AlertDescription>
                  </Alert>
                )}

                {place.category === "Mountain" && place?.packages?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Available Packages</h3>
                    {place.packages.slice(0, 2).map((pkg) => (
                      <div key={pkg.id} className="p-3 border border-border rounded-lg text-sm">
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-muted-foreground">
                          ${pkg.price} · {pkg.duration} min · {pkg.availableSlots} slots
                        </div>
                      </div>
                    ))}
                    {place.packages.length > 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{place.packages.length - 2} more package{place.packages.length - 2 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}

                {(place.category === "Hotel" || place.category === "Cafe") && place?.packages?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Available Packages</h3>
                    {place.packages.slice(0, 2).map((pkg) => (
                      <div key={pkg.id} className="p-3 border border-border rounded-lg text-sm">
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-muted-foreground">
                          ${pkg.price} · {pkg.duration} min · {pkg.availableSlots} slots
                        </div>
                      </div>
                    ))}
                    {place.packages.length > 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{place.packages.length - 2} more package{place.packages.length - 2 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Promoter view of packages */}
            {currentUser?.role === "promoter" && place?.packages?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Packages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {place.packages.map((pkg) => (
                    <div key={pkg.id} className="p-3 border border-border rounded-lg space-y-1">
                      <h4 className="font-medium">{pkg.name}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          ${pkg.price} · {pkg.duration} min
                        </p>
                        <p>{pkg.availableSlots} slots available</p>
                        {pkg.joinDate && <p>Join Date: {new Date(pkg.joinDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {currentUser?.role === "promoter" && place.category === "Restaurant" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Restaurant bookings are made directly by visitors with check-in time and table number.
                </AlertDescription>
              </Alert>
            )}

            {currentUser?.role === "promoter" && place.category === "Visitable Place" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Visitable places cannot be booked. Visitors can visit them directly.
                </AlertDescription>
              </Alert>
            )}

            {!currentUser && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>Please log in to make a booking.</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Latitude:</span>
                  <span className="ml-2 font-mono">{place.latitude}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitude:</span>
                  <span className="ml-2 font-mono">{place.longitude}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
