import { CircleMarker, Tooltip } from "react-leaflet";
import type { NearbyStop } from "@/api/client";

type StopStatus = "passed" | "active" | "upcoming" | "default";

interface StopMarkerProps {
  stop: NearbyStop;
  selected: boolean;
  onSelect: (stop: NearbyStop) => void;
  status?: StopStatus;
}

const STATUS_COLORS: Record<StopStatus, { fill: string; border: string }> = {
  passed: { fill: "#22c55e", border: "#16a34a" },
  active: { fill: "#0d9488", border: "#0f766e" },
  upcoming: { fill: "#9ca3af", border: "#6b7280" },
  default: { fill: "#eab308", border: "#ca8a04" },
};

export default function StopMarker({
  stop,
  selected,
  onSelect,
  status = "default",
}: StopMarkerProps) {
  const colors = STATUS_COLORS[status];

  return (
    <CircleMarker
      center={[stop.latitude, stop.longitude]}
      radius={selected ? 10 : status === "active" ? 8 : 6}
      bubblingMouseEvents={false}
      pathOptions={{
        color: selected ? colors.border : colors.fill,
        fillColor: colors.fill,
        fillOpacity: selected ? 1 : status === "upcoming" ? 0.5 : 0.8,
        weight: selected ? 3 : status === "active" ? 2 : 1,
      }}
      eventHandlers={{
        click: () => onSelect(stop),
      }}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        {stop.name}
      </Tooltip>
    </CircleMarker>
  );
}
