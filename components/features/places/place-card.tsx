"use client";

import Link from "next/link";
import type { Place } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

interface PlaceCardProps {
  place: Place;
}

function calculateAverageRating(place: Place): number {
  if (place.reviews.length === 0) return 0;
  const sum = place.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / place.reviews.length;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const { currentUser } = useAuth();
  const averageRating = calculateAverageRating(place);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
      {place.image && (
        <div className="relative w-full h-48 overflow-hidden">
          {place.image.startsWith("data:") ? (
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={place.image}
              alt={place.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          )}
        </div>
      )}
      {!place.image && (
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{place.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{place.address}</span>
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {place.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {place.description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {averageRating > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-medium">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({place.reviews.length}{" "}
                  {place.reviews.length === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                No reviews yet
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {["Hotel", "Mountain", "Restaurant"].includes(place.category) &&
              currentUser?.role === "visitor" && (
                <Button asChild size="sm">
                  <Link href={`/book/${place.id}`}>Book Now</Link>
                </Button>
              )}
            <Button asChild size="sm" variant="outline">
              <Link href={`/place/${place.id}`}>Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
