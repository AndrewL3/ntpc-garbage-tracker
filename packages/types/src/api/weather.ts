import { z } from "zod";

// --- CWA Forecast Response schema (PascalCase, Chinese element names) ---

const CwaTimeSchema = z.object({
  DataTime: z.string().optional(),
  StartTime: z.string().optional(),
  EndTime: z.string().optional(),
  ElementValue: z.array(z.record(z.string())),
});

const CwaWeatherElementSchema = z.object({
  ElementName: z.string(),
  Time: z.array(CwaTimeSchema),
});

const CwaLocationSchema = z.object({
  LocationName: z.string(),
  Geocode: z.string(),
  Latitude: z.string(),
  Longitude: z.string(),
  WeatherElement: z.array(CwaWeatherElementSchema),
});

const CwaLocationsSchema = z.object({
  LocationsName: z.string(),
  Location: z.array(CwaLocationSchema),
});

export const CwaForecastResponseSchema = z.object({
  success: z.string(),
  records: z.object({
    Locations: z.array(CwaLocationsSchema),
  }),
});

export type CwaForecastResponse = z.infer<typeof CwaForecastResponseSchema>;

// --- Transformed types (unchanged — UI contract stays the same) ---

export interface ForecastPeriod {
  startTime: string;
  endTime: string;
  wx: string;
  pop: number;
  temperature: number;
  minT: number;
  maxT: number;
  ci: string;
}

export interface WeatherForecast {
  township: string;
  city: string;
  forecast: ForecastPeriod[];
}

// --- Transform function ---

type CwaWeatherElementType = z.infer<typeof CwaWeatherElementSchema>;

function findElement(
  elements: CwaWeatherElementType[],
  name: string,
): CwaWeatherElementType | undefined {
  return elements.find((e) => e.ElementName === name);
}

export function transformCwaForecast(
  response: CwaForecastResponse,
  townshipName: string,
): WeatherForecast | null {
  const locationsGroup = response.records.Locations[0];
  if (!locationsGroup) return null;

  const location = locationsGroup.Location.find(
    (loc) => loc.LocationName === townshipName,
  );
  if (!location) return null;

  const wxElement = findElement(location.WeatherElement, "天氣現象");
  const popElement = findElement(location.WeatherElement, "3小時降雨機率");
  const tempElement = findElement(location.WeatherElement, "溫度");
  const ciElement = findElement(location.WeatherElement, "舒適度指數");

  if (!wxElement) return null;

  // Build temp lookup: DataTime → temperature (hourly point-in-time)
  const tempByTime = new Map<string, number>();
  for (const t of tempElement?.Time ?? []) {
    if (t.DataTime) {
      tempByTime.set(
        t.DataTime,
        parseInt(t.ElementValue[0]?.Temperature ?? "0", 10),
      );
    }
  }

  // Build CI lookup: DataTime → comfort description
  const ciByTime = new Map<string, string>();
  for (const t of ciElement?.Time ?? []) {
    if (t.DataTime) {
      ciByTime.set(
        t.DataTime,
        t.ElementValue[0]?.ComfortIndexDescription ?? "",
      );
    }
  }

  // Use weather periods (3h ranges) as the base
  const forecast: ForecastPeriod[] = wxElement.Time.map((wxTime, i) => {
    const startTime = wxTime.StartTime ?? "";
    const endTime = wxTime.EndTime ?? "";

    // Collect hourly temps within this 3h period for min/max
    const periodTemps: number[] = [];
    for (const [dt, temp] of tempByTime) {
      if (dt >= startTime && dt < endTime) {
        periodTemps.push(temp);
      }
    }
    const currentTemp =
      periodTemps[0] ?? tempByTime.get(startTime) ?? 0;
    const minT =
      periodTemps.length > 0 ? Math.min(...periodTemps) : currentTemp;
    const maxT =
      periodTemps.length > 0 ? Math.max(...periodTemps) : currentTemp;

    return {
      startTime,
      endTime,
      wx: wxTime.ElementValue[0]?.Weather ?? "",
      pop: parseInt(
        popElement?.Time[i]?.ElementValue[0]?.ProbabilityOfPrecipitation ??
          "0",
        10,
      ),
      temperature: currentTemp,
      minT,
      maxT,
      ci: ciByTime.get(startTime) ?? "",
    };
  });

  return {
    township: townshipName,
    city: locationsGroup.LocationsName,
    forecast,
  };
}
