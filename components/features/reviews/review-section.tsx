"use client"

import { useState } from "react"
import Link from "next/link"
import { ReviewForm } from "./review-form"
import { ReviewList } from "./review-list"
import { useAuth } from "@/hooks/use-auth"
import { updatePlace } from "@/lib/storage"
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

  const handleReviewSubmit = (reviewData: Omit<Review, "id" | "date">) => {
    setIsSubmitting(true)

    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      date: Date.now(),
    }

    const updatedPlace: Place = {
      ...place,
      reviews: [...place.reviews, newReview],
    }

    updatePlace(updatedPlace)
    onReviewAdded(updatedPlace)
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Reviews</h2>
        <ReviewList reviews={place.reviews} />
      </div>

      <div>
        {currentUser ? (
          <ReviewForm
            userId={currentUser.id}
            userName={currentUser.username}
            onSubmit={handleReviewSubmit}
            isSubmitting={isSubmitting}
          />
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
