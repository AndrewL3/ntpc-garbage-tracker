import { describe, it, expect } from "@jest/globals";
import {
  TaipeiGarbageCsvRowSchema,
  parseTaipeiGarbageCsv,
} from "../taipei-garbage.js";

describe("TaipeiGarbageCsvRowSchema", () => {
  it("parses a valid CSV row object", () => {
    const row = {
      district: "士林區",
      village: "天壽里",
      squad: "天母分隊",
      bureauId: "103-074",
      vehicleNumber: "821-BT",
      route: "天母-1",
      trip: "第1車",
      arrivalTime: "1630",
      departureTime: "1640",
      address: "臺北市士林區天母西路48號",
      lon: 121.525,
      lat: 25.11836,
    };
    const parsed = TaipeiGarbageCsvRowSchema.parse(row);
    expect(parsed.district).toBe("士林區");
    expect(parsed.route).toBe("天母-1");
    expect(parsed.trip).toBe("第1車");
    expect(parsed.lon).toBe(121.525);
    expect(parsed.lat).toBe(25.11836);
  });

  it("coerces string numbers to numbers", () => {
    const row = {
      district: "士林區",
      village: "天壽里",
      squad: "天母分隊",
      bureauId: "103-074",
      vehicleNumber: "821-BT",
      route: "天母-1",
      trip: "第1車",
      arrivalTime: "1630",
      departureTime: "1640",
      address: "臺北市士林區天母西路48號",
      lon: "121.525",
      lat: "25.11836",
    };
    const parsed = TaipeiGarbageCsvRowSchema.parse(row);
    expect(typeof parsed.lon).toBe("number");
    expect(typeof parsed.lat).toBe("number");
  });

  it("rejects row with missing route", () => {
    const row = {
      district: "士林區",
      village: "天壽里",
      squad: "天母分隊",
      bureauId: "103-074",
      vehicleNumber: "821-BT",
      trip: "第1車",
      arrivalTime: "1630",
      departureTime: "1640",
      address: "test",
      lon: 121.0,
      lat: 25.0,
    };
    expect(() => TaipeiGarbageCsvRowSchema.parse(row)).toThrow();
  });
});

describe("parseTaipeiGarbageCsv", () => {
  const csvHeader =
    "行政區,里別,分隊,局編,車號,路線,車次,抵達時間,離開時間,地點,經度,緯度";

  it("parses CSV text into TaipeiGarbageStop array", () => {
    const csv = [
      csvHeader,
      "士林區,天壽里,天母分隊,103-074,821-BT,天母-1,第1車,1630,1640,臺北市士林區天母西路48號,121.525,25.11836",
      "士林區,天壽里,天母分隊,103-074,821-BT,天母-1,第1車,1641,1651,臺北市士林區天母西路20號,121.52724,25.1184",
    ].join("\n");

    const stops = parseTaipeiGarbageCsv(csv);
    expect(stops).toHaveLength(2);
    expect(stops[0].id).toBe("tpe-天母-1-第1車-1");
    expect(stops[0].routeId).toBe("tpe-天母-1-第1車");
    expect(stops[0].routeName).toBe("天母-1");
    expect(stops[0].trip).toBe("第1車");
    expect(stops[0].rank).toBe(1);
    expect(stops[0].arrivalTime).toBe("16:30");
    expect(stops[0].departureTime).toBe("16:40");
    expect(stops[0].district).toBe("士林區");
    expect(stops[0].village).toBe("天壽里");
    expect(stops[0].address).toBe("臺北市士林區天母西路48號");
    expect(stops[0].lat).toBe(25.11836);
    expect(stops[0].lon).toBe(121.525);
    expect(stops[1].rank).toBe(2);
  });

  it("assigns rank per route+trip group", () => {
    const csv = [
      csvHeader,
      "士林區,天壽里,天母分隊,103-074,821-BT,天母-1,第1車,1630,1640,地址A,121.525,25.118",
      "士林區,天壽里,天母分隊,103-074,821-BT,天母-1,第1車,1641,1651,地址B,121.527,25.118",
      "士林區,天山里,天母分隊,103-074,821-BT,天母-1,第2車,1900,1905,地址C,121.530,25.119",
    ].join("\n");

    const stops = parseTaipeiGarbageCsv(csv);
    expect(stops).toHaveLength(3);
    expect(stops[0].routeId).toBe("tpe-天母-1-第1車");
    expect(stops[0].rank).toBe(1);
    expect(stops[1].rank).toBe(2);
    expect(stops[2].routeId).toBe("tpe-天母-1-第2車");
    expect(stops[2].rank).toBe(1);
  });

  it("handles BOM prefix in CSV", () => {
    const csv =
      "\uFEFF" +
      [
        csvHeader,
        "士林區,天壽里,天母分隊,103-074,821-BT,天母-1,第1車,1630,1640,地址,121.5,25.1",
      ].join("\n");
    const stops = parseTaipeiGarbageCsv(csv);
    expect(stops).toHaveLength(1);
  });

  it("skips empty lines", () => {
    const csv = [
      csvHeader,
      "",
      "士林區,天壽里,天母分隊,103-074,821-BT,天母-1,第1車,1630,1640,地址,121.5,25.1",
      "",
    ].join("\n");
    const stops = parseTaipeiGarbageCsv(csv);
    expect(stops).toHaveLength(1);
  });

  it("handles address containing commas", () => {
    const csv = [
      csvHeader,
      "大安區,龍生里,大安分隊,104-001,123-AB,大安-1,第1車,1800,1810,臺北市大安區復興南路一段2號,3號,121.543,25.026",
    ].join("\n");
    const stops = parseTaipeiGarbageCsv(csv);
    expect(stops).toHaveLength(1);
    expect(stops[0].address).toBe("臺北市大安區復興南路一段2號,3號");
    expect(stops[0].lon).toBe(121.543);
    expect(stops[0].lat).toBe(25.026);
  });
});
