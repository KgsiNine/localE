"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { PlaceForm } from "@/components/features/places/place-form"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AddPlacePage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
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
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <Alert className="p-10 border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
              <AlertCircle className="h-10 w-10 text-blue-600" />
              <AlertDescription className="flex flex-col gap-5 ml-4">
                <span className="text-2xl font-bold text-gray-900">
                  Please login to add a place
                </span>
                <div>
                  <Button asChild size="lg" className="mt-2">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  if (currentUser.role !== "promoter") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <Alert className="p-10 border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
              <AlertCircle className="h-10 w-10 text-blue-600" />
              <AlertDescription className="flex flex-col gap-5 ml-4">
                <span className="text-2xl font-bold text-gray-900">
                  Only promoters can upload places. Your account is set as a visitor.
                </span>
                <span className="text-base text-gray-700 font-medium">
                  Want to add places? Create a promoter account to get started!
                </span>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <PlaceForm userId={currentUser.id} />
        </div>
      </div>
    </div>
  )
}
