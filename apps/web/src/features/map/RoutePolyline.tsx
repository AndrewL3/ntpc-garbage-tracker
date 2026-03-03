import { Polyline } from "react-leaflet";
import type { AnnotatedStop } from "@/api/client";

interface RoutePolylineProps {
  stops: AnnotatedStop[];
}

export default function RoutePolyline({ stops }: RoutePolylineProps) {
  // Filter to stops with valid coordinates (API may omit them)
  const geoStops = stops.filter(
    (s): s is AnnotatedStop & { latitude: number; longitude: number } =>
      s.latitude != null && s.longitude != null,
  );
  if (geoStops.length < 2) return null;

  // Split stops into passed and upcoming segments
  const passedCoords: [number, number][] = [];
  const upcomingCoords: [number, number][] = [];

  for (const stop of geoStops) {
    const coord: [number, number] = [stop.latitude, stop.longitude];
    if (stop.passedAt !== null) {
      passedCoords.push(coord);
    } else {
      // Include the last passed stop as the start of upcoming segment
      if (upcomingCoords.length === 0 && passedCoords.length > 0) {
        upcomingCoords.push(passedCoords[passedCoords.length - 1]);
      }
      upcomingCoords.push(coord);
    }
  }

  return (
    <>
      {passedCoords.length >= 2 && (
        <Polyline
          positions={passedCoords}
          pathOptions={{ color: "#22c55e", weight: 4, opacity: 0.7 }}
        />
      )}
      {upcomingCoords.length >= 2 && (
        <Polyline
          positions={upcomingCoords}
          pathOptions={{ color: "#0d9488", weight: 3, opacity: 0.4, dashArray: "8 6" }}
        />
      )}
    </>
  );
}
