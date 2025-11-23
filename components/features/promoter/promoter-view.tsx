"use client"

import { useState } from "react"
import type { Place, User } from "@/lib/types"
import { PlaceList } from "@/components/features/places/place-list"
import { SectionTitle } from "@/components/features/places/section-title"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface PromoterViewProps {
  currentUser: User
  allPlaces: Place[]
}

export function PromoterView({ currentUser, allPlaces }: PromoterViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const myPlaces = allPlaces.filter((place) => place.uploaderId === currentUser.id)

  const filteredPlaces = myPlaces.filter((place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || place.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <SectionTitle
        title="My Places"
        subtitle={`You have uploaded ${myPlaces.length} place${myPlaces.length !== 1 ? "s" : ""}`}
      />

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="grid gap-4 md:grid-cols-[1fr_250px]">
          <div className="space-y-2">
            <Label htmlFor="search">Search Your Places</Label>
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
                <SelectItem value="Park">Park</SelectItem>
                <SelectItem value="Museum">Museum</SelectItem>
                <SelectItem value="Cafe">Cafe</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredPlaces.length} of {myPlaces.length} places
        </div>
      </div>

      {filteredPlaces.length > 0 ? (
        <PlaceList places={filteredPlaces} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            {myPlaces.length === 0 ? "No places uploaded yet" : "No places match your search"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {myPlaces.length === 0 ? "Start by adding your first place!" : "Try adjusting your search or filters"}
          </p>
        </div>
      )}
    </main>
  )
}
