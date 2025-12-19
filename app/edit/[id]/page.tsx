"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PlaceForm } from "@/components/features/places/place-form";
import { useAuth } from "@/hooks/use-auth";
import { RouteGuard } from "@/components/auth/route-guard";
import { placesAPI } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Place } from "@/lib/types";

function EditPlacePageContent() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlace = async () => {
      try {
        const id = params.id as string;
        const foundPlace = await placesAPI.getPlaceById(id);
        
        // Check if user owns this place
        const uploaderId = typeof foundPlace.uploaderId === "object" && foundPlace.uploaderId !== null && "_id" in foundPlace.uploaderId
          ? (foundPlace.uploaderId as any)._id.toString()
          : foundPlace.uploaderId.toString();
        
        if (currentUser?.id !== uploaderId) {
          setError("You can only edit places you created");
          setIsLoading(false);
          return;
        }
        
        setPlace(foundPlace);
      } catch (error) {
        console.error("Failed to load place:", error);
        setError("Failed to load place");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && params.id) {
      loadPlace();
    }
  }, [params.id, currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <Alert variant="destructive" className="p-6">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="mt-4 space-y-4">
                <p className="text-lg font-semibold">
                  {error || "Place not found"}
                </p>
                <Button asChild variant="outline">
                  <Link href="/">Back to Home</Link>
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <PlaceForm place={place} userId={currentUser?.id} />
        </div>
      </div>
    </div>
  );
}

export default function EditPlacePage() {
  return (
    <RouteGuard requireAuth={true} requireRole="promoter">
      <EditPlacePageContent />
    </RouteGuard>
  );
}

