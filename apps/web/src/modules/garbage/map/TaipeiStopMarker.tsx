import { Marker, Tooltip } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import { createModuleIcon } from "@/core/map/createModuleIcon";
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
  const state = selected ? "selected" : faded ? "faded" : "default";

  return (
    <Marker
      position={[stop.lat, stop.lon]}
      icon={createModuleIcon("garbage", state)}
      bubblingMouseEvents={false}
      eventHandlers={{
        click: (e: LeafletMouseEvent) => {
          e.originalEvent.stopPropagation();
          onSelect(stop);
        },
      }}
    >
      {!faded && (
        <Tooltip direction="top">
          {stop.address} ({stop.arrivalTime})
        </Tooltip>
      )}
    </Marker>
  );
}
