"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { PlaceList } from "@/components/features/places/place-list"
import { MapComponent } from "@/components/features/map/map-component"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPlaces, initializeStorage } from "@/lib/storage"
import type { Place } from "@/lib/types"
import { Search } from "lucide-react"

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  useEffect(() => {
    initializeStorage()
    setPlaces(getPlaces())
  }, [])

  const filteredPlaces = places.filter((place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || place.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Discover Amazing Places</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore local restaurants, parks, museums, and more. Share your experiences with the community.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
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
                  <SelectItem value="Park">Park</SelectItem>
                  <SelectItem value="Museum">Museum</SelectItem>
                  <SelectItem value="Cafe">Cafe</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredPlaces.length} of {places.length} places
          </div>
        </div>

        {/* Map and Places Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div>
            <PlaceList places={filteredPlaces} />
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-8 h-[600px]">
              <MapComponent places={filteredPlaces} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
