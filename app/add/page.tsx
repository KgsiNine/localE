"use client"

import { Header } from "@/components/layout/header"
import { PlaceForm } from "@/components/features/places/place-form"
import { useAuth } from "@/hooks/use-auth"
import { RouteGuard } from "@/components/auth/route-guard"

function AddPlacePageContent() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <PlaceForm userId={currentUser?.id} />
        </div>
      </div>
    </div>
  )
}

export default function AddPlacePage() {
  return (
    <RouteGuard requireAuth={true} requireRole="promoter">
      <AddPlacePageContent />
    </RouteGuard>
  )
}
