import type { Place } from "@/lib/types"; // Still needs to be imported for component signature
import { MapPin } from "lucide-react";

interface MapComponentProps {
  places: Place[];
}

// NOTE: Since the provided link (https://maps.app.goo.gl/T4hGMeTV3qfLEvZq7) is a short URL and cannot be reliably used directly as an iframe source,
// we use the standard Google Maps embed URL structure pointing to a generic, recognizable location.
// The map will display a static, non-interactive map view.
const STATIC_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2476.7966717133245!2d96.15675682054369!3d16.774643790021898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30c1ec87114cc3bb%3A0x302311ef984aa61f!2sYangon%20City%20Hall!5e0!3m2!1sen!2smm!4v1759842640389!5m2!1sen!2smm";

export function MapComponent({ places }: MapComponentProps) {
  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border bg-gray-50 shadow-xl relative">
      <iframe
        src={STATIC_EMBED_URL}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Static Map Embed"
      ></iframe>

      {/* <div className="absolute top-0 left-0 w-full p-2 text-center text-xs bg-muted/90 text-muted-foreground border-b border-border flex items-center justify-center gap-2">
        <MapPin className="h-4 w-4" />
        Static Map View: Cannot plot {places.length} places or current location (No API Binding)
      </div> */}
    </div>
  );
}
