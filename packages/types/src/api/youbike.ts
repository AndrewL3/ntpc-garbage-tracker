import { z } from "zod";

// --- NTC YouBike raw API schema (all string values, coerce numbers) ---

export const NtcYouBikeRawSchema = z.object({
  sno: z.string(),
  sna: z.string(),
  sarea: z.string(),
  ar: z.string(),
  snaen: z.string(),
  sareaen: z.string(),
  aren: z.string(),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  tot_quantity: z.coerce.number(),
  sbi_quantity: z.coerce.number(),
  bemp: z.coerce.number(),
  act: z.string(),
  mday: z.string(),
});

export type NtcYouBikeRaw = z.infer<typeof NtcYouBikeRawSchema>;
export const NtcYouBikeRawArraySchema = z.array(NtcYouBikeRawSchema);

// --- Taipei YouBike raw API schema (mixed types) ---

export const TpeYouBikeRawSchema = z.object({
  sno: z.string(),
  sna: z.string(),
  sarea: z.string(),
  ar: z.string(),
  snaen: z.string(),
  sareaen: z.string(),
  aren: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  Quantity: z.number(),
  available_rent_bikes: z.number(),
  available_return_bikes: z.number(),
  act: z.string(),
  mday: z.string(),
});

export type TpeYouBikeRaw = z.infer<typeof TpeYouBikeRawSchema>;
export const TpeYouBikeRawArraySchema = z.array(TpeYouBikeRawSchema);

// --- Unified YouBikeStation ---

export interface YouBikeStation {
  id: string;
  name: string;
  nameEn: string;
  district: string;
  lat: number;
  lon: number;
  totalDocks: number;
  availableBikes: number;
  emptyDocks: number;
  status: "active" | "inactive";
  address: string;
  city: "ntc" | "tpe";
  updatedAt: string;
}

function stripYouBikePrefix(name: string): string {
  return name.replace(/^YouBike2\.0_/, "");
}

export function transformNtcStation(raw: NtcYouBikeRaw): YouBikeStation {
  return {
    id: `ntc-${raw.sno}`,
    name: stripYouBikePrefix(raw.sna),
    nameEn: stripYouBikePrefix(raw.snaen),
    district: raw.sarea,
    lat: raw.lat,
    lon: raw.lng,
    totalDocks: raw.tot_quantity,
    availableBikes: raw.sbi_quantity,
    emptyDocks: raw.bemp,
    status: raw.act === "1" ? "active" : "inactive",
    address: raw.ar,
    city: "ntc",
    updatedAt: raw.mday,
  };
}

export function transformTpeStation(raw: TpeYouBikeRaw): YouBikeStation {
  return {
    id: `tpe-${raw.sno}`,
    name: stripYouBikePrefix(raw.sna),
    nameEn: stripYouBikePrefix(raw.snaen),
    district: raw.sarea,
    lat: raw.latitude,
    lon: raw.longitude,
    totalDocks: raw.Quantity,
    availableBikes: raw.available_rent_bikes,
    emptyDocks: raw.available_return_bikes,
    status: raw.act === "1" ? "active" : "inactive",
    address: raw.ar,
    city: "tpe",
    updatedAt: raw.mday,
  };
}
