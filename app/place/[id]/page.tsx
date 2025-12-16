"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { ReviewSection } from "@/components/features/reviews/review-section"
import { BookingCard } from "@/components/features/booking/booking-card" 
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPlaceById } from "@/lib/storage"
import { useAuth } from "@/hooks/use-auth"
import type { Place } from "@/lib/types"
import { MapPin, Star, ArrowLeft } from "lucide-react"

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
            {place?.packages?.length > 0 && currentUser?.role === "visitor" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Available Packages</h3>
                {place.packages.map((pkg) => (
                  <BookingCard key={pkg.id} pkg={pkg} place={place} user={currentUser} onBookingComplete={loadPlace} />
                ))}
              </div>
            )}

            {place?.packages?.length > 0 && currentUser?.role === "promoter" && (
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
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
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
