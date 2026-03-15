import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { getRouteColor } from "@/lib/routeColor";
import { createModuleIcon } from "@/core/map/createModuleIcon";
import type { NearbyStop } from "../api/client";

interface StopMarkerProps {
  stop: NearbyStop;
  selected: boolean;
  onSelect: (stop: NearbyStop) => void;
  status?: "passed" | "active" | "upcoming";
  faded: boolean;
  selectedRouteLineId: string | null;
}

function makeNumberedIcon(
  rank: number,
  color: string,
  status?: "passed" | "active" | "upcoming",
): L.DivIcon {
  const opacity = status === "passed" ? "0.5" : "1";
  const content =
    status === "passed"
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
      : `<span style="color:white;font-size:11px;font-weight:700">${rank}</span>`;

  const pulse =
    status === "active"
      ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};opacity:0.4;animation:marker-pulse 2s ease-out infinite"></div>`
      : "";

  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `
      <div style="position:relative;width:22px;height:22px">
        ${pulse}
        <div style="
          width:22px;height:22px;border-radius:50%;
          background:${color};opacity:${opacity};
          border:2px solid white;
          box-shadow:0 1px 3px rgb(0 0 0 / 0.2);
          display:flex;align-items:center;justify-content:center;
        ">${content}</div>
      </div>
    `,
  });
}

export default function StopMarker({
  stop,
  selected,
  onSelect,
  status,
  faded,
  selectedRouteLineId,
}: StopMarkerProps) {
  const routeColor = getRouteColor(stop.routeLineId);
  const isOnSelectedRoute = selectedRouteLineId === stop.routeLineId;

  const handleClick = (e: L.LeafletMouseEvent) => {
    const me = e as unknown as { originalEvent?: Event };
    me.originalEvent?.stopPropagation();
    onSelect(stop);
  };

  // Selected route's stops → numbered DivIcon markers
  if (isOnSelectedRoute && selectedRouteLineId !== null) {
    const icon = makeNumberedIcon(stop.rank, routeColor, status);
    return (
      <Marker
        position={[stop.latitude, stop.longitude]}
        icon={icon}
        bubblingMouseEvents={false}
        eventHandlers={{ click: handleClick }}
      >
        <Tooltip direction="top" offset={[0, -14]}>
          {stop.name}
        </Tooltip>
      </Marker>
    );
  }

  // Overview mode — module icon marker
  const state = selected ? "selected" : faded ? "faded" : "default";
  return (
    <Marker
      position={[stop.latitude, stop.longitude]}
      icon={createModuleIcon("garbage", state)}
      bubblingMouseEvents={false}
      eventHandlers={{
        click: (e: L.LeafletMouseEvent) => {
          e.originalEvent.stopPropagation();
          onSelect(stop);
        },
      }}
    >
      {!faded && (
        <Tooltip direction="top">
          {stop.name}
        </Tooltip>
      )}
    </Marker>
  );
}
