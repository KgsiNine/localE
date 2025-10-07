"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { addPlace } from "@/lib/storage"
import type { Place } from "@/lib/types"

interface PlaceFormProps {
  userId: string
}

export function PlaceForm({ userId }: PlaceFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Restaurant" as Place["category"],
    address: "",
    latitude: "",
    longitude: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.name || !formData.description || !formData.address || !formData.latitude || !formData.longitude) {
      setError("Please fill in all fields")
      return
    }

    const lat = Number.parseFloat(formData.latitude)
    const lng = Number.parseFloat(formData.longitude)

    if (isNaN(lat) || isNaN(lng)) {
      setError("Latitude and longitude must be valid numbers")
      return
    }

    if (lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90")
      return
    }

    if (lng < -180 || lng > 180) {
      setError("Longitude must be between -180 and 180")
      return
    }

    const newPlace: Place = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      address: formData.address,
      latitude: lat,
      longitude: lng,
      uploaderId: userId,
      reviews: [],
    }

    addPlace(newPlace)
    router.push("/")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a New Place</CardTitle>
        <CardDescription>Share a great location with the community</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Place Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., The Golden Fork"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as Place["category"] })}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Restaurant">Restaurant</SelectItem>
                <SelectItem value="Park">Park</SelectItem>
                <SelectItem value="Museum">Museum</SelectItem>
                <SelectItem value="Cafe">Cafe</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe this place..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              type="text"
              placeholder="e.g., 123 Main Street, Downtown"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="text"
                placeholder="e.g., 40.7128"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="text"
                placeholder="e.g., -74.0060"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Add Place
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
