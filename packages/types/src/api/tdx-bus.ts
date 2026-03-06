import { z } from "zod";

export type CityKey = "Taipei" | "NewTaipei";

// Shared TDX name object (zh_tw + en)
const TdxNameSchema = z.object({
  Zh_tw: z.string(),
  En: z.string().optional().default(""),
});

// --- Stops (per-route, from /v2/Bus/Stop/City/{city}) ---

export const TdxBusStopRawSchema = z.object({
  StopUID: z.string(),
  StopName: TdxNameSchema,
  StopPosition: z.object({
    PositionLat: z.number(),
    PositionLon: z.number(),
  }),
  StationID: z.string().optional(),
  RouteUID: z.string(),
  RouteName: TdxNameSchema,
  Direction: z.number(),
  StopSequence: z.number(),
  City: z.string().optional(),
  CityCode: z.string().optional(),
});
export type TdxBusStopRaw = z.infer<typeof TdxBusStopRawSchema>;
export const TdxBusStopRawArraySchema = z.array(TdxBusStopRawSchema);

// --- Estimated Time of Arrival (from /v2/Bus/EstimatedTimeOfArrival/City/{city}) ---

export const TdxBusEtaRawSchema = z.object({
  StopUID: z.string(),
  StopName: TdxNameSchema,
  RouteUID: z.string(),
  RouteName: TdxNameSchema,
  Direction: z.number(),
  EstimateTime: z.number().optional(), // seconds, absent = no estimate
  StopStatus: z.number(), // 0=normal, 1=not departed, 2=no bus, 3=last bus left, 4=not operating
  NextBusTime: z.string().optional(),
});
export type TdxBusEtaRaw = z.infer<typeof TdxBusEtaRawSchema>;
export const TdxBusEtaRawArraySchema = z.array(TdxBusEtaRawSchema);

// --- Real-time bus positions (from /v2/Bus/RealTimeByFrequency/City/{city}) ---

export const TdxBusPositionRawSchema = z.object({
  PlateNumb: z.string(),
  RouteUID: z.string(),
  RouteName: TdxNameSchema,
  Direction: z.number(),
  BusPosition: z.object({
    PositionLat: z.number(),
    PositionLon: z.number(),
  }),
  Speed: z.number().optional(),
  DutyStatus: z.number().optional(), // 0=normal, 1=start, 2=end
  BusStatus: z.number().optional(),
});
export type TdxBusPositionRaw = z.infer<typeof TdxBusPositionRawSchema>;
export const TdxBusPositionRawArraySchema = z.array(TdxBusPositionRawSchema);

// --- Routes (from /v2/Bus/Route/City/{city}) ---

export const TdxBusRouteRawSchema = z.object({
  RouteUID: z.string(),
  RouteID: z.string(),
  RouteName: TdxNameSchema,
  DepartureStopNameZh: z.string().optional(),
  DepartureStopNameEn: z.string().optional(),
  DestinationStopNameZh: z.string().optional(),
  DestinationStopNameEn: z.string().optional(),
  City: z.string().optional(),
  CityCode: z.string().optional(),
});
export type TdxBusRouteRaw = z.infer<typeof TdxBusRouteRawSchema>;
export const TdxBusRouteRawArraySchema = z.array(TdxBusRouteRawSchema);

// --- Transformed types (what the API returns to frontend) ---

export interface BusStation {
  stationId: string;
  name: string;
  nameEn: string;
  lat: number;
  lon: number;
  city: string;
  routes: { routeId: string; routeName: string; routeNameEn: string }[];
}

export interface BusArrival {
  routeId: string;
  routeName: string;
  routeNameEn: string;
  destination: string;
  direction: number;
  estimateMinutes: number | null;
  stopStatus: number;
  nextBusTime: string | null;
}

export interface BusRouteDetail {
  routeId: string;
  routeName: string;
  routeNameEn: string;
  departure: string;
  destination: string;
  city: string;
}

export interface BusRouteStop {
  stopId: string;
  name: string;
  nameEn: string;
  lat: number;
  lon: number;
  sequence: number;
  estimateMinutes: number | null;
  stopStatus: number;
}

export interface BusVehicle {
  plateNumb: string;
  lat: number;
  lon: number;
  speed: number;
  nearStopSequence: number | null;
}

// --- Transform functions ---

/**
 * Groups per-route stops into physical stations for map display.
 * TDX returns one stop entry per (route, direction, stop). We group by
 * StationID (or by StopName + proximity if StationID is missing) to get
 * unique physical locations.
 */
export function groupStopsIntoStations(
  stops: TdxBusStopRaw[],
  cityCode: string,
): BusStation[] {
  const stationMap = new Map<
    string,
    {
      name: string;
      nameEn: string;
      lat: number;
      lon: number;
      routes: Map<
        string,
        { routeId: string; routeName: string; routeNameEn: string }
      >;
    }
  >();

  for (const stop of stops) {
    const key =
      stop.StationID ??
      `${stop.StopName.Zh_tw}_${stop.StopPosition.PositionLat.toFixed(4)}_${stop.StopPosition.PositionLon.toFixed(4)}`;

    let station = stationMap.get(key);
    if (!station) {
      station = {
        name: stop.StopName.Zh_tw,
        nameEn: stop.StopName.En ?? "",
        lat: stop.StopPosition.PositionLat,
        lon: stop.StopPosition.PositionLon,
        routes: new Map(),
      };
      stationMap.set(key, station);
    }

    if (!station.routes.has(stop.RouteUID)) {
      station.routes.set(stop.RouteUID, {
        routeId: stop.RouteUID,
        routeName: stop.RouteName.Zh_tw,
        routeNameEn: stop.RouteName.En ?? "",
      });
    }
  }

  return Array.from(stationMap.entries()).map(([stationId, s]) => ({
    stationId,
    name: s.name,
    nameEn: s.nameEn,
    lat: s.lat,
    lon: s.lon,
    city: cityCode,
    routes: Array.from(s.routes.values()),
  }));
}

/**
 * Transforms raw TDX ETA entries into BusArrival objects for a given set of StopUIDs.
 */
export function transformArrivals(
  etas: TdxBusEtaRaw[],
  stopUids: Set<string>,
): BusArrival[] {
  return etas
    .filter((e) => stopUids.has(e.StopUID))
    .map((e) => ({
      routeId: e.RouteUID,
      routeName: e.RouteName.Zh_tw,
      routeNameEn: e.RouteName.En ?? "",
      destination: "",
      direction: e.Direction,
      estimateMinutes:
        e.EstimateTime != null ? Math.round(e.EstimateTime / 60) : null,
      stopStatus: e.StopStatus,
      nextBusTime: e.NextBusTime ?? null,
    }))
    .sort((a, b) => {
      if (a.estimateMinutes == null && b.estimateMinutes == null) return 0;
      if (a.estimateMinutes == null) return 1;
      if (b.estimateMinutes == null) return -1;
      return a.estimateMinutes - b.estimateMinutes;
    });
}
