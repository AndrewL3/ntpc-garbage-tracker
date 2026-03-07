import { CircleMarker, Tooltip } from "react-leaflet";
import type L from "leaflet";
import type { YouBikeStation } from "../api/client";
import { getAvailabilityColor } from "../utils/availability";

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
  const color = getAvailabilityColor(station);

  const handleClick = (e: L.LeafletMouseEvent) => {
    const me = e as unknown as { originalEvent?: Event };
    me.originalEvent?.stopPropagation();
    onSelect(station);
  };

  return (
    <CircleMarker
      center={[station.lat, station.lon]}
      radius={selected ? 10 : 6}
      bubblingMouseEvents={false}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: selected ? 3 : 1,
      }}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        {station.name}
        {" — "}
        {station.availableBikes}/{station.totalDocks}
      </Tooltip>
    </CircleMarker>
  );
}
