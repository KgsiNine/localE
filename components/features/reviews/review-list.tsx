import type { Review } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Star, User } from "lucide-react"

interface ReviewListProps {
  reviews: Review[]
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  // Sort reviews by date (newest first)
  const sortedReviews = [...reviews].sort((a, b) => b.date - a.date)

  return (
    <div className="space-y-4">
      {sortedReviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{review.userName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
