import type { Place } from "@/lib/types"
import { PlaceCard } from "./place-card"

interface PlaceListProps {
  places: Place[]
}

export function PlaceList({ places }: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">No places found</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  )
}
