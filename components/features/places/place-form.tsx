"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, X, Image as ImageIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { addPlace } from "@/lib/storage";
import type { Place, HotelRoom } from "@/lib/types";

interface PlaceFormProps {
  userId: string;
}

export function PlaceForm({ userId }: PlaceFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Restaurant" as Place["category"],
    address: "",
    latitude: "",
    longitude: "",
    image: "",
  });
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.name ||
      !formData.description ||
      !formData.address ||
      !formData.latitude ||
      !formData.longitude
    ) {
      setError("Please fill in all fields");
      return;
    }

    const lat = Number.parseFloat(formData.latitude);
    const lng = Number.parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Latitude and longitude must be valid numbers");
      return;
    }

    if (lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      setError("Longitude must be between -180 and 180");
      return;
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
      image: formData.image || undefined,
      reviews: [],
      uploadedAt: Date.now(),
      ...(formData.category === "Hotel" && rooms.length > 0 ? { rooms } : {}),
    };

    addPlace(newPlace);
    router.push("/");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a New Place</CardTitle>
        <CardDescription>
          Share a great location with the community
        </CardDescription>
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                const newCategory = value as Place["category"];
                setFormData({ ...formData, category: newCategory });
                // Reset rooms when category changes
                if (newCategory !== "Hotel") {
                  setRooms([]);
                }
              }}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Restaurant">Restaurant</SelectItem>
                <SelectItem value="Hotel">Hotel</SelectItem>
                <SelectItem value="Cafe">Cafe</SelectItem>
                <SelectItem value="Mountain">Mountain</SelectItem>
                <SelectItem value="Visitable Place">Visitable Place</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Place Image (Optional)</Label>
            <div className="space-y-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview("");
                      setFormData({ ...formData, image: "" });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!imagePreview && (
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No image selected</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe this place..."
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              type="text"
              placeholder="e.g., 123 Main Street, Downtown"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
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
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="text"
                placeholder="e.g., -74.0060"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
              />
            </div>
          </div>

          {/* Rooms management for Hotel category */}
          {formData.category === "Hotel" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Hotel Rooms *</Label>
                  <p className="text-sm text-muted-foreground">
                    Add and manage rooms for your hotel
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Room A"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newRoomName.trim()) {
                        const newRoom: HotelRoom = {
                          id: `room_${Date.now()}`,
                          name: newRoomName.trim(),
                          isAvailable: true,
                        };
                        setRooms([...rooms, newRoom]);
                        setNewRoomName("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newRoomName.trim()) {
                      const newRoom: HotelRoom = {
                        id: `room_${Date.now()}`,
                        name: newRoomName.trim(),
                        isAvailable: true,
                      };
                      setRooms([...rooms, newRoom]);
                      setNewRoomName("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Button>
              </div>

              {rooms.length > 0 && (
                <div className="space-y-2 border border-border rounded-lg p-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`room-${room.id}`}
                          checked={room.isAvailable}
                          onCheckedChange={(checked) => {
                            setRooms(
                              rooms.map((r) =>
                                r.id === room.id
                                  ? { ...r, isAvailable: checked === true }
                                  : r
                              )
                            );
                          }}
                        />
                        <Label
                          htmlFor={`room-${room.id}`}
                          className={`text-sm font-normal cursor-pointer ${
                            !room.isAvailable
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          {room.name}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRooms(rooms.filter((r) => r.id !== room.id));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Add Place
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
