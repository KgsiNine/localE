"use client";

import { useState } from "react";
import Link from "next/link";
import type { Place, User } from "@/lib/types";
import { PlaceList } from "@/components/features/places/place-list";
import { SectionTitle } from "@/components/features/places/section-title";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Calendar, TrendingUp } from "lucide-react";

interface PromoterViewProps {
  currentUser: User;
  allPlaces: Place[];
  onPlacesChange?: () => void; // Callback to refresh places
}

export function PromoterView({
  currentUser,
  allPlaces,
  onPlacesChange,
}: PromoterViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const myPlaces = allPlaces.filter((place) => {
    const uploaderId =
      typeof place.uploaderId === "object" &&
      place.uploaderId !== null &&
      "_id" in place.uploaderId
        ? (place.uploaderId as any)._id.toString()
        : place.uploaderId.toString();
    return uploaderId === currentUser.id;
  });

  const filteredPlaces = myPlaces.filter((place) => {
    const matchesSearch = place.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || place.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Manage Your Places
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Create and manage restaurants, hotels, cafes, mountains, and visitable
          places. Share great locations with the community.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/add">
            <Plus className="h-5 w-5" />
            Create New Place
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      {myPlaces.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Places
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myPlaces.length}</div>
              <p className="text-xs text-muted-foreground">
                Places you've created
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(myPlaces.map((p) => p.category)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Different categories
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reviews
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myPlaces.reduce((sum, place) => sum + place.reviews.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all your places
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <SectionTitle
          title="My Places"
          subtitle={`You have uploaded ${myPlaces.length} place${
            myPlaces.length !== 1 ? "s" : ""
          }`}
        />
        {myPlaces.length > 0 && (
          <Button asChild variant="outline" className="gap-2">
            <Link href="/add">
              <Plus className="h-4 w-4" />
              Add Place
            </Link>
          </Button>
        )}
      </div>

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
                <SelectItem value="Hotel">Hotel</SelectItem>
                <SelectItem value="Cafe">Cafe</SelectItem>
                <SelectItem value="Mountain">Mountain</SelectItem>
                <SelectItem value="Visitable Place">Visitable Place</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredPlaces.length} of {myPlaces.length} places
        </div>
      </div>

      {filteredPlaces.length > 0 ? (
        <PlaceList places={filteredPlaces} onPlaceDeleted={onPlacesChange} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            {myPlaces.length === 0
              ? "No places uploaded yet"
              : "No places match your search"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {myPlaces.length === 0
              ? "Start by adding your first place!"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      )}
    </main>
  );
}
