import { describe, expect, it } from "@jest/globals";
import { CwaForecastResponseSchema, transformCwaForecast } from "../weather.js";

describe("CwaForecastResponseSchema", () => {
  const validResponse = {
    success: "true",
    records: {
      Locations: [
        {
          LocationsName: "臺北市",
          Location: [
            {
              LocationName: "中正區",
              Geocode: "6300500",
              Latitude: "25.0324",
              Longitude: "121.5183",
              WeatherElement: [
                {
                  ElementName: "天氣現象",
                  Time: [
                    {
                      StartTime: "2026-03-08T06:00:00+08:00",
                      EndTime: "2026-03-08T09:00:00+08:00",
                      ElementValue: [
                        { Weather: "多雲時晴", WeatherCode: "02" },
                      ],
                    },
                  ],
                },
                {
                  ElementName: "溫度",
                  Time: [
                    {
                      DataTime: "2026-03-08T06:00:00+08:00",
                      ElementValue: [{ Temperature: "22" }],
                    },
                    {
                      DataTime: "2026-03-08T07:00:00+08:00",
                      ElementValue: [{ Temperature: "20" }],
                    },
                    {
                      DataTime: "2026-03-08T08:00:00+08:00",
                      ElementValue: [{ Temperature: "24" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };

  it("parses a valid CWA forecast response", () => {
    const result = CwaForecastResponseSchema.parse(validResponse);
    expect(result.records.Locations[0].Location[0].LocationName).toBe("中正區");
  });

  it("extracts weather elements by name", () => {
    const result = CwaForecastResponseSchema.parse(validResponse);
    const wx = result.records.Locations[0].Location[0].WeatherElement.find(
      (e) => e.ElementName === "天氣現象",
    );
    expect(wx?.Time[0].ElementValue[0]?.Weather).toBe("多雲時晴");
  });
});

describe("transformCwaForecast", () => {
  const makeResponse = (locationName: string) => ({
    success: "true",
    records: {
      Locations: [
        {
          LocationsName: "臺北市",
          Location: [
            {
              LocationName: locationName,
              Geocode: "6300500",
              Latitude: "25.0324",
              Longitude: "121.5183",
              WeatherElement: [
                {
                  ElementName: "天氣現象",
                  Time: [
                    {
                      StartTime: "2026-03-08T06:00:00+08:00",
                      EndTime: "2026-03-08T09:00:00+08:00",
                      ElementValue: [
                        { Weather: "多雲時晴", WeatherCode: "02" },
                      ],
                    },
                  ],
                },
                {
                  ElementName: "3小時降雨機率",
                  Time: [
                    {
                      StartTime: "2026-03-08T06:00:00+08:00",
                      EndTime: "2026-03-08T09:00:00+08:00",
                      ElementValue: [
                        { ProbabilityOfPrecipitation: "20" },
                      ],
                    },
                  ],
                },
                {
                  ElementName: "溫度",
                  Time: [
                    {
                      DataTime: "2026-03-08T06:00:00+08:00",
                      ElementValue: [{ Temperature: "22" }],
                    },
                    {
                      DataTime: "2026-03-08T07:00:00+08:00",
                      ElementValue: [{ Temperature: "18" }],
                    },
                    {
                      DataTime: "2026-03-08T08:00:00+08:00",
                      ElementValue: [{ Temperature: "25" }],
                    },
                  ],
                },
                {
                  ElementName: "舒適度指數",
                  Time: [
                    {
                      DataTime: "2026-03-08T06:00:00+08:00",
                      ElementValue: [
                        {
                          ComfortIndex: "22",
                          ComfortIndexDescription: "舒適",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  });

  it("transforms CWA response into WeatherForecast for a township", () => {
    const response = CwaForecastResponseSchema.parse(makeResponse("中正區"));
    const forecast = transformCwaForecast(response, "中正區");
    expect(forecast).not.toBeNull();
    expect(forecast!.township).toBe("中正區");
    expect(forecast!.city).toBe("臺北市");
    expect(forecast!.forecast).toHaveLength(1);
    expect(forecast!.forecast[0].wx).toBe("多雲時晴");
    expect(forecast!.forecast[0].pop).toBe(20);
    expect(forecast!.forecast[0].temperature).toBe(22);
    expect(forecast!.forecast[0].minT).toBe(18);
    expect(forecast!.forecast[0].maxT).toBe(25);
    expect(forecast!.forecast[0].ci).toBe("舒適");
  });

  it("returns null when township not found", () => {
    const response = CwaForecastResponseSchema.parse(makeResponse("中正區"));
    const forecast = transformCwaForecast(response, "不存在區");
    expect(forecast).toBeNull();
  });
});
