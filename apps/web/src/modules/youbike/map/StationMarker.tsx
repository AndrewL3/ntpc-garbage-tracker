import { Marker, Tooltip } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import { createModuleIcon } from "@/core/map/createModuleIcon";
import type { YouBikeStation } from "../api/client";

interface StationMarkerProps {
  station: YouBikeStation;
  selected: boolean;
  onSelect: (station: YouBikeStation) => void;
}

export default function StationMarker({
  station,
  selected,
  onSelect,
}: StationMarkerProps) {
  const state = selected ? "selected" : "default";

  return (
    <Marker
      position={[station.lat, station.lon]}
      icon={createModuleIcon("youbike", state)}
      bubblingMouseEvents={false}
      eventHandlers={{
        click: (e: LeafletMouseEvent) => {
          e.originalEvent.stopPropagation();
          onSelect(station);
        },
      }}
    >
      <Tooltip direction="top">
        {station.name}
        {" — "}
        {station.availableBikes}/{station.totalDocks}
      </Tooltip>
    </Marker>
  );
}
