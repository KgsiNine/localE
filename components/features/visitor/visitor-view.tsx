"use client"

import { useState } from "react"
import type { Place } from "@/lib/types"
import { PlaceList } from "@/components/features/places/place-list"
import { SectionTitle } from "@/components/features/places/section-title"
import { CategorySection } from "./category-section"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface VisitorViewProps {
  allPlaces: Place[]
}

function calculateAverageRating(place: Place): number {
  if (place.reviews.length === 0) return 0
  const sum = place.reviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / place.reviews.length
}

export function VisitorView({ allPlaces }: VisitorViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredPlaces = allPlaces.filter((place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || place.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getPlacesByCategory = (category: string) => {
    return allPlaces.filter((p) => p.category === category)
  }

  const getLatestPlaces = () => {
    return [...allPlaces]
      .sort((a, b) => {
        const aDate = Math.max(...[a?.uploadedAt || 0, ...a.reviews.map((r) => r.date || 0)])
        const bDate = Math.max(...[b?.uploadedAt || 0, ...b.reviews.map((r) => r.date || 0)])
        return bDate - aDate
      })
      .slice(0, 6)
  }

  const getRecommendedPlaces = () => {
    return allPlaces.filter((p) => p.reviews.length > 0 && calculateAverageRating(p) >= 4).slice(0, 6)
  }

  const getTopPlaces = () => {
    return allPlaces.sort((a, b) => calculateAverageRating(b) - calculateAverageRating(a)).slice(0, 6)
  }

  const categories = ["Restaurant", "Hotel", "Cafe", "Mountain", "Visitable Place"]

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Discover Amazing Places</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore local restaurants, hotels, cafes, mountains, and visitable places. Book your next adventure or visit.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-12 space-y-4">
        <div className="grid gap-4 md:grid-cols-[1fr_250px]">
          <div className="space-y-2">
            <Label htmlFor="search">Search Places</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Restaurant">Restaurant</SelectItem>
                <SelectItem value="Hotel">Hotel</SelectItem>
                <SelectItem value="Cafe">Cafe</SelectItem>
                <SelectItem value="Mountain">Mountain</SelectItem>
                <SelectItem value="Visitable Place">Visitable Place</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {categoryFilter === "all" && searchQuery === "" ? null : (
          <div className="text-sm text-muted-foreground">
            Showing {filteredPlaces.length} of {allPlaces.length} places
          </div>
        )}
      </div>

      {/* Filtered Search Results */}
      {(categoryFilter !== "all" || searchQuery !== "") && (
        <div className="mb-12">
          <SectionTitle
            title="Search Results"
            subtitle={`Found ${filteredPlaces.length} place${filteredPlaces.length !== 1 ? "s" : ""}`}
          />
          {filteredPlaces.length > 0 ? (
            <PlaceList places={filteredPlaces} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-muted-foreground">No places found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Top Places Section */}
      {searchQuery === "" && categoryFilter === "all" && getTopPlaces().length > 0 && (
        <div className="mb-12">
          <SectionTitle title="⭐ Top Rated Places" subtitle="Highest rated by the community" />
          <PlaceList places={getTopPlaces()} />
        </div>
      )}

      {/* Latest Places Section */}
      {searchQuery === "" && categoryFilter === "all" && getLatestPlaces().length > 0 && (
        <div className="mb-12">
          <SectionTitle title="🆕 Latest Additions" subtitle="Recently added or reviewed" />
          <PlaceList places={getLatestPlaces()} />
        </div>
      )}

      {/* Recommended Places Section */}
      {searchQuery === "" && categoryFilter === "all" && getRecommendedPlaces().length > 0 && (
        <div className="mb-12">
          <SectionTitle title="✨ Recommended for You" subtitle="Highly rated places in the community" />
          <PlaceList places={getRecommendedPlaces()} />
        </div>
      )}

      {/* Places by Category Sections */}
      {searchQuery === "" && categoryFilter === "all" && (
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryPlaces = getPlacesByCategory(category)
            return categoryPlaces.length > 0 ? (
              <CategorySection key={category} category={category} places={categoryPlaces} />
            ) : null
          })}
        </div>
      )}
    </main>
  )
}
