"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PromoterView } from "@/components/features/promoter/promoter-view";
import { VisitorView } from "@/components/features/visitor/visitor-view";
import { getPlaces, initializeStorage, getCurrentUser } from "@/lib/storage";
import type { Place, User } from "@/lib/types";

export default function HomePage() {
  const searchParams = useSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    initializeStorage();
    setPlaces(getPlaces());
    setCurrentUser(getCurrentUser());

    // Read category from URL params
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setCategoryFilter(categoryParam);
    }

    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
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
        <PromoterView currentUser={currentUser} allPlaces={places} />
      ) : (
        <VisitorView
          allPlaces={places}
          initialCategoryFilter={categoryFilter}
        />
      )}
    </div>
  );
}
