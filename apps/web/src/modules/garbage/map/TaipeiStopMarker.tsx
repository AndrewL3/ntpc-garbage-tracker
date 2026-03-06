import { CircleMarker, Tooltip } from "react-leaflet";
import type L from "leaflet";
import { getRouteColor } from "@/lib/routeColor";
import type { TaipeiGarbageStop } from "../api/taipei-client";

interface TaipeiStopMarkerProps {
  stop: TaipeiGarbageStop;
  selected: boolean;
  onSelect: (stop: TaipeiGarbageStop) => void;
  faded: boolean;
}

export default function TaipeiStopMarker({
  stop,
  selected,
  onSelect,
  faded,
}: TaipeiStopMarkerProps) {
  const routeColor = getRouteColor(stop.routeId);

  const handleClick = (e: L.LeafletMouseEvent) => {
    const me = e as unknown as { originalEvent?: Event };
    me.originalEvent?.stopPropagation();
    onSelect(stop);
  };

  return (
    <CircleMarker
      center={[stop.lat, stop.lon]}
      radius={selected ? 12 : 7}
      bubblingMouseEvents={false}
      pathOptions={{
        color: routeColor,
        fillColor: routeColor,
        fillOpacity: faded ? 0.15 : 0.7,
        weight: selected ? 3 : 1.5,
        opacity: faded ? 0.2 : 1,
        dashArray: "4 3",
      }}
      eventHandlers={{ click: handleClick }}
    >
      {!faded && (
        <Tooltip direction="top" offset={[0, -8]}>
          {stop.address} ({stop.arrivalTime})
        </Tooltip>
      )}
    </CircleMarker>
  );
}
