import { describe, expect, it } from "@jest/globals";
import {
  NcdrFeedEntrySchema,
  NcdrFeedEntryArraySchema,
  filterAlertsByArea,
  type ActiveAlert,
} from "../ncdr-alerts.js";

describe("NcdrFeedEntrySchema", () => {
  const validEntry = {
    id: "CWA-Weather_strong-wind_202603091640001",
    title: "強風",
    updated: "2026-03-09T16:40:44+08:00",
    author: { name: "中央氣象署" },
    link: {
      "@rel": "alternate",
      "@href": "https://alerts.ncdr.nat.gov.tw/Capstorage/CWA/2026/test.cap",
    },
    summary: { "@type": "html", "#text": "東北風影響，新北市沿海地區有強風" },
    category: { "@term": "強風" },
    status: "Actual",
    msgType: "Update",
    effective: "2026/3/9 下午 03:40:00",
    expires: "2026/3/10 上午 12:00:00",
  };

  it("parses a valid feed entry", () => {
    const result = NcdrFeedEntrySchema.parse(validEntry);
    expect(result.id).toBe("CWA-Weather_strong-wind_202603091640001");
    expect(result.link["@href"]).toContain(".cap");
    expect(result.status).toBe("Actual");
  });

  it("parses an array of entries", () => {
    const result = NcdrFeedEntryArraySchema.parse([validEntry, validEntry]);
    expect(result).toHaveLength(2);
  });

  it("rejects missing required fields", () => {
    expect(() => NcdrFeedEntrySchema.parse({ id: "test" })).toThrow();
  });
});

describe("filterAlertsByArea", () => {
  const TAIPEI_PREFIXES = ["63", "65"];

  const makeAlert = (
    areas: { areaDesc: string; geocode: string }[],
  ): ActiveAlert => ({
    id: "test-alert-1",
    headline: "Test Alert",
    description: "Test description",
    instruction: "Take shelter",
    severity: "Moderate",
    urgency: "Expected",
    category: "Met",
    event: "強風",
    senderName: "中央氣象署",
    effective: "2026-03-09T16:00:00+08:00",
    expires: "2026-03-10T00:00:00+08:00",
    alertColor: "255,255,0",
    areas: areas.map((a) => a.areaDesc),
    geocodes: areas.map((a) => a.geocode),
    web: undefined,
  });

  it("keeps alerts with Taipei City geocode (prefix 63)", () => {
    const alerts = [
      makeAlert([{ areaDesc: "台北市松山區", geocode: "6300100" }]),
    ];
    const filtered = filterAlertsByArea(alerts, TAIPEI_PREFIXES);
    expect(filtered).toHaveLength(1);
  });

  it("keeps alerts with New Taipei geocode (prefix 65)", () => {
    const alerts = [
      makeAlert([{ areaDesc: "新北市板橋區", geocode: "6500100" }]),
    ];
    const filtered = filterAlertsByArea(alerts, TAIPEI_PREFIXES);
    expect(filtered).toHaveLength(1);
  });

  it("filters out alerts for other areas", () => {
    const alerts = [
      makeAlert([{ areaDesc: "台中市中區", geocode: "6600100" }]),
    ];
    const filtered = filterAlertsByArea(alerts, TAIPEI_PREFIXES);
    expect(filtered).toHaveLength(0);
  });

  it("keeps alert if ANY area matches (multi-area alert)", () => {
    const alerts = [
      makeAlert([
        { areaDesc: "台中市中區", geocode: "6600100" },
        { areaDesc: "新北市中和區", geocode: "6501200" },
      ]),
    ];
    const filtered = filterAlertsByArea(alerts, TAIPEI_PREFIXES);
    expect(filtered).toHaveLength(1);
  });

  it("returns empty array for empty input", () => {
    expect(filterAlertsByArea([], TAIPEI_PREFIXES)).toEqual([]);
  });
});
