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
import { AlertCircle, Plus, X } from "lucide-react"
import { addPlace } from "@/lib/storage"
import type { Place, BookingPackage } from "@/lib/types"

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
  const [packages, setPackages] = useState<BookingPackage[]>([])
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    availableSlots: "",
  })
  const [error, setError] = useState("")

  const handleAddPackage = () => {
    if (!packageForm.name || !packageForm.price || !packageForm.duration || !packageForm.availableSlots) {
      setError("Please fill in all package fields")
      return
    }

    const price = Number.parseFloat(packageForm.price)
    const duration = Number.parseInt(packageForm.duration)
    const slots = Number.parseInt(packageForm.availableSlots)

    if (isNaN(price) || price <= 0) {
      setError("Price must be a positive number")
      return
    }

    if (isNaN(duration) || duration <= 0) {
      setError("Duration must be a positive number")
      return
    }

    if (isNaN(slots) || slots <= 0) {
      setError("Available slots must be a positive number")
      return
    }

    const newPackage: BookingPackage = {
      id: `pkg_${Date.now()}`,
      name: packageForm.name,
      description: packageForm.description,
      price,
      duration,
      availableSlots: slots,
    }

    setPackages([...packages, newPackage])
    setPackageForm({ name: "", description: "", price: "", duration: "", availableSlots: "" })
    setShowPackageForm(false)
    setError("")
  }

  const handleRemovePackage = (packageId: string) => {
    setPackages(packages.filter((pkg) => pkg.id !== packageId))
  }

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
      packages,
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

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label>Booking Packages (Optional)</Label>
                <p className="text-sm text-muted-foreground">Add packages visitors can book</p>
              </div>
              {!showPackageForm && (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPackageForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Package
                </Button>
              )}
            </div>

            {showPackageForm && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pkg-name">Package Name *</Label>
                    <Input
                      id="pkg-name"
                      placeholder="e.g., Dinner for Two"
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pkg-desc">Description</Label>
                    <Textarea
                      id="pkg-desc"
                      placeholder="Describe this package..."
                      rows={2}
                      value={packageForm.description}
                      onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="pkg-price">Price ($) *</Label>
                      <Input
                        id="pkg-price"
                        type="number"
                        placeholder="50"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pkg-duration">Duration (min) *</Label>
                      <Input
                        id="pkg-duration"
                        type="number"
                        placeholder="90"
                        value={packageForm.duration}
                        onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pkg-slots">Available Slots *</Label>
                      <Input
                        id="pkg-slots"
                        type="number"
                        placeholder="10"
                        value={packageForm.availableSlots}
                        onChange={(e) => setPackageForm({ ...packageForm, availableSlots: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAddPackage} size="sm">
                      Add Package
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowPackageForm(false)
                        setPackageForm({ name: "", description: "", price: "", duration: "", availableSlots: "" })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {packages?.length > 0 && (
              <div className="space-y-2">
                {packages.map((pkg) => (
                  <Card key={pkg.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <h4 className="font-medium">{pkg.name}</h4>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>${pkg.price}</span>
                          <span>{pkg.duration} min</span>
                          <span>{pkg.availableSlots} slots</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePackage(pkg.id)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
