import { Marker, Tooltip } from "react-leaflet";
import { useTranslation } from "react-i18next";
import type { LeafletMouseEvent } from "leaflet";
import { createModuleIcon } from "@/core/map/createModuleIcon";
import type { BusStation } from "../api/types";

interface BusStopMarkerProps {
  station: BusStation;
  selected: boolean;
  onSelect: (station: BusStation) => void;
}

export default function BusStopMarker({
  station,
  selected,
  onSelect,
}: BusStopMarkerProps) {
  const { t } = useTranslation();
  const state = selected ? "selected" : "default";

  return (
    <Marker
      position={[station.lat, station.lon]}
      icon={createModuleIcon("transit", state)}
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
        {station.routes.length} {t("transit.routesServed")}
      </Tooltip>
    </Marker>
  );
}
