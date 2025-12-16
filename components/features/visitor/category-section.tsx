"use client"

import { useState } from "react"
import type { Place } from "@/lib/types"
import { PlaceList } from "@/components/features/places/place-list"
import { SectionTitle } from "@/components/features/places/section-title"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategorySectionProps {
  category: string
  places: Place[]
}

function calculateAverageRating(place: Place): number {
  if (place.reviews.length === 0) return 0
  const sum = place.reviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / place.reviews.length
}

export function CategorySection({ category, places }: CategorySectionProps) {
  const [sortBy, setSortBy] = useState<string>("recommended")

  const getSortedPlaces = () => {
    const sortedPlaces = [...places]

    switch (sortBy) {
      case "top-rating":
        sortedPlaces.sort((a, b) => calculateAverageRating(b) - calculateAverageRating(a))
        break
      case "most-recent":
        sortedPlaces.sort((a, b) => {
          const aDate = a.uploadedAt || 0
          const bDate = b.uploadedAt || 0
          return bDate - aDate
        })
        break
      case "most-reviewed":
        sortedPlaces.sort((a, b) => b.reviews.length - a.reviews.length)
        break
      case "recommended":
      default:
        // Mix of rating and review count
        sortedPlaces.sort((a, b) => {
          const aScore = calculateAverageRating(a) * 0.7 + a.reviews.length * 0.3
          const bScore = calculateAverageRating(b) * 0.7 + b.reviews.length * 0.3
          return bScore - aScore
        })
        break
    }

    return sortedPlaces
  }

  const sortedPlaces = getSortedPlaces()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <SectionTitle
          title={`📍 ${category}s`}
          subtitle={`Explore ${places.length} ${category.toLowerCase()}${places.length !== 1 ? "s" : ""}`}
        />

        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="top-rating">Top Rating</SelectItem>
              <SelectItem value="most-recent">Most Recent</SelectItem>
              <SelectItem value="most-reviewed">Most Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <PlaceList places={sortedPlaces} />
    </div>
  )
}
