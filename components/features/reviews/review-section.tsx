"use client"

import { useState } from "react"
import Link from "next/link"
import { ReviewForm } from "./review-form"
import { ReviewList } from "./review-list"
import { useAuth } from "@/hooks/use-auth"
import { reviewsAPI } from "@/lib/api"
import type { Place, Review } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ReviewSectionProps {
  place: Place
  onReviewAdded: (updatedPlace: Place) => void
}

export function ReviewSection({ place, onReviewAdded }: ReviewSectionProps) {
  const { currentUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReviewSubmit = async (reviewData: Omit<Review, "id" | "date">) => {
    setIsSubmitting(true)

    try {
      const updatedPlace = await reviewsAPI.addReview(place.id, {
        rating: reviewData.rating,
        comment: reviewData.comment,
      })
      onReviewAdded(updatedPlace)
    } catch (error) {
      console.error("Failed to add review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Reviews</h2>
        <ReviewList reviews={place.reviews} />
      </div>

      <div>
        {currentUser ? (
          currentUser.role === "promoter" ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Promoters cannot write reviews. Only visitors can review places.
              </AlertDescription>
            </Alert>
          ) : (
            <ReviewForm
              userId={currentUser.id}
              userName={currentUser.username}
              onSubmit={handleReviewSubmit}
              isSubmitting={isSubmitting}
            />
          )
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Please login to write a review</span>
              <Button asChild size="sm" variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
