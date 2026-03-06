import { z } from "zod";

// --- Raw CSV row schema ---

export const TaipeiGarbageCsvRowSchema = z.object({
  district: z.string(),
  village: z.string(),
  squad: z.string(),
  bureauId: z.string(),
  vehicleNumber: z.string(),
  route: z.string(),
  trip: z.string(),
  arrivalTime: z.string().regex(/^\d{3,4}$/),
  departureTime: z.string().regex(/^\d{3,4}$/),
  address: z.string(),
  lon: z.coerce.number(),
  lat: z.coerce.number(),
});

export type TaipeiGarbageCsvRow = z.infer<typeof TaipeiGarbageCsvRowSchema>;

// --- Transformed stop interface ---

export interface TaipeiGarbageStop {
  id: string;
  routeId: string;
  routeName: string;
  trip: string;
  rank: number;
  district: string;
  village: string;
  address: string;
  arrivalTime: string;
  departureTime: string;
  lat: number;
  lon: number;
}

// --- Helpers ---

function formatTime(hhmm: string): string {
  const padded = hhmm.padStart(4, "0");
  return `${padded.slice(0, 2)}:${padded.slice(2)}`;
}

function parseCsvLine(line: string): TaipeiGarbageCsvRow | null {
  const fields = line.split(",");
  if (fields.length < 12) return null;

  // Address may contain commas — first 9 fields are fixed, last 2 are lon/lat,
  // everything in between is the address
  const address = fields.slice(9, fields.length - 2).join(",");
  const lon = fields[fields.length - 2];
  const lat = fields[fields.length - 1];

  const row = {
    district: fields[0],
    village: fields[1],
    squad: fields[2],
    bureauId: fields[3],
    vehicleNumber: fields[4],
    route: fields[5],
    trip: fields[6],
    arrivalTime: fields[7],
    departureTime: fields[8],
    address,
    lon,
    lat,
  };

  const result = TaipeiGarbageCsvRowSchema.safeParse(row);
  return result.success ? result.data : null;
}

// --- Main parser ---

export function parseTaipeiGarbageCsv(csvText: string): TaipeiGarbageStop[] {
  const text = csvText.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/);

  // Skip header, filter empty lines, parse each row
  const rows: TaipeiGarbageCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const row = parseCsvLine(line);
    if (row) rows.push(row);
  }

  // Group by route+trip and assign ranks
  const rankCounters = new Map<string, number>();
  const stops: TaipeiGarbageStop[] = [];

  for (const row of rows) {
    const routeId = `tpe-${row.route}-${row.trip}`;
    const currentRank = (rankCounters.get(routeId) ?? 0) + 1;
    rankCounters.set(routeId, currentRank);

    stops.push({
      id: `${routeId}-${currentRank}`,
      routeId,
      routeName: row.route,
      trip: row.trip,
      rank: currentRank,
      district: row.district,
      village: row.village,
      address: row.address,
      arrivalTime: formatTime(row.arrivalTime),
      departureTime: formatTime(row.departureTime),
      lat: row.lat,
      lon: row.lon,
    });
  }

  return stops;
}
