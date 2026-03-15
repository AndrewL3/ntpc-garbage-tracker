import { Marker, Tooltip } from "react-leaflet";
import { useTranslation } from "react-i18next";
import type { LeafletMouseEvent } from "leaflet";
import { createModuleIcon } from "@/core/map/createModuleIcon";
import type { ParkingRoadSegment } from "../api/types";

interface ParkingMarkerProps {
  segment: ParkingRoadSegment;
  selected: boolean;
  onSelect: (segment: ParkingRoadSegment) => void;
}

export default function ParkingMarker({
  segment,
  selected,
  onSelect,
}: ParkingMarkerProps) {
  const { t } = useTranslation();
  const state = selected ? "selected" : "default";

  return (
    <Marker
      position={[segment.latitude, segment.longitude]}
      icon={createModuleIcon("parking", state)}
      bubblingMouseEvents={false}
      eventHandlers={{
        click: (e: LeafletMouseEvent) => {
          e.originalEvent.stopPropagation();
          onSelect(segment);
        },
      }}
    >
      <Tooltip direction="top">
        {segment.roadName}
        {" — "}
        {segment.availableSpaces}/{segment.totalSpaces} {t("parking.spaces")}
      </Tooltip>
    </Marker>
  );
}
