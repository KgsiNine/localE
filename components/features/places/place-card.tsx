"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Star, MapPin, Image as ImageIcon, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { placesAPI } from "@/lib/api";

interface PlaceCardProps {
  place: Place;
  onDelete?: () => void; // Callback to refresh the list after deletion
}

function calculateAverageRating(place: Place): number {
  if (place.reviews.length === 0) return 0;
  const sum = place.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / place.reviews.length;
}

export function PlaceCard({ place, onDelete }: PlaceCardProps) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const averageRating = calculateAverageRating(place);

  // Ensure we have a valid ID (normalized from _id)
  const placeId =
    place.id || (place as any)._id?.toString() || (place as any)._id;

  // Check if current user owns this place
  const uploaderId =
    typeof place.uploaderId === "object" &&
    place.uploaderId !== null &&
    "_id" in place.uploaderId
      ? (place.uploaderId as any)._id.toString()
      : place.uploaderId.toString();
  const isOwner =
    currentUser?.role === "promoter" && currentUser.id === uploaderId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await placesAPI.deletePlace(placeId);
      // Call the callback to refresh the list
      if (onDelete) {
        onDelete();
      } else {
        // Fallback: reload the page
        router.refresh();
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to delete place:", error);
      alert("Failed to delete place. Please try again.");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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

          <div className="flex gap-2 flex-wrap">
            {isOwner && (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/edit/${placeId}`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
            {["Hotel", "Mountain", "Restaurant"].includes(place.category) &&
              currentUser?.role === "visitor" && (
                <Button asChild size="sm">
                  <Link href={`/book/${placeId}`}>Book Now</Link>
                </Button>
              )}
            <Button asChild size="sm" variant="outline">
              <Link href={`/place/${placeId}`}>Details</Link>
            </Button>
          </div>

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{place.name}". This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
