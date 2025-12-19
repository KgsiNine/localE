"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PromoterView } from "@/components/features/promoter/promoter-view";
import { VisitorView } from "@/components/features/visitor/visitor-view";
import { placesAPI } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Place } from "@/lib/types";

export default function HomePage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { currentUser, isLoading: authLoading } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const loadPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      // Read category from URL params
      const categoryParam = searchParams.get("category");
      const category =
        categoryParam && categoryParam !== "all" ? categoryParam : undefined;

      const loadedPlaces = await placesAPI.getAllPlaces({ category });
      console.log("Loaded places from API:", loadedPlaces.length);
      setPlaces(loadedPlaces);

      if (categoryParam) {
        setCategoryFilter(categoryParam);
      }
    } catch (error) {
      console.error("Failed to load places:", error);
      // Set empty array on error to prevent showing stale data
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading) {
      loadPlaces();
    }
  }, [authLoading, loadPlaces]);

  // Refresh places when navigating back to home page
  useEffect(() => {
    if (pathname === "/" && !authLoading) {
      loadPlaces();
    }
  }, [pathname, authLoading, loadPlaces]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {currentUser?.role === "promoter" ? (
        <PromoterView
          currentUser={currentUser}
          allPlaces={places}
          onPlacesChange={loadPlaces}
        />
      ) : (
        <VisitorView
          allPlaces={places}
          initialCategoryFilter={categoryFilter}
        />
      )}
    </div>
  );
}
