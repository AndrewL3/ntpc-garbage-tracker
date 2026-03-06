import { describe, it, expect } from "@jest/globals";
import {
  NtcYouBikeRawSchema,
  TpeYouBikeRawSchema,
  transformNtcStation,
  transformTpeStation,
} from "../youbike.js";

describe("NtcYouBikeRawSchema", () => {
  const raw = {
    sno: "500201001",
    sna: "YouBike2.0_下庄市場",
    sarea: "八里區",
    ar: "舊城路21號(前)",
    snaen: "YouBike2.0_Shia Juang Market",
    sareaen: "Bali Dist",
    aren: "No.21, Jiucheng Rd., Bali Dist",
    lat: "25.14678",
    lng: "121.3999",
    tot_quantity: "20",
    sbi_quantity: "10",
    bemp: "10",
    act: "1",
    mday: "20260305T211002",
  };

  it("parses a raw NTC YouBike record with string-to-number coercion", () => {
    const parsed = NtcYouBikeRawSchema.parse(raw);
    expect(parsed.sno).toBe("500201001");
    expect(parsed.lat).toBe(25.14678);
    expect(parsed.lng).toBe(121.3999);
    expect(parsed.tot_quantity).toBe(20);
    expect(parsed.sbi_quantity).toBe(10);
    expect(parsed.bemp).toBe(10);
    expect(typeof parsed.lat).toBe("number");
  });

  it("rejects record with missing sno", () => {
    const { sno: _sno, ...incomplete } = raw;
    expect(() => NtcYouBikeRawSchema.parse(incomplete)).toThrow();
  });
});

describe("TpeYouBikeRawSchema", () => {
  const raw = {
    sno: "500101001",
    sna: "YouBike2.0_捷運科技大樓站",
    sarea: "大安區",
    ar: "復興南路二段235號前",
    snaen: "YouBike2.0_MRT Technology Bldg. Sta.",
    sareaen: "Daan Dist.",
    aren: "No.235, Sec. 2, Fuxing S. Rd.",
    latitude: 25.02605,
    longitude: 121.5436,
    Quantity: 28,
    available_rent_bikes: 4,
    available_return_bikes: 24,
    act: "1",
    mday: "2026-03-05 22:10:03",
  };

  it("parses a raw Taipei YouBike record", () => {
    const parsed = TpeYouBikeRawSchema.parse(raw);
    expect(parsed.sno).toBe("500101001");
    expect(parsed.latitude).toBe(25.02605);
    expect(parsed.longitude).toBe(121.5436);
    expect(parsed.Quantity).toBe(28);
    expect(parsed.available_rent_bikes).toBe(4);
  });
});

describe("transformNtcStation", () => {
  it("transforms NTC raw record to unified YouBikeStation", () => {
    const raw = NtcYouBikeRawSchema.parse({
      sno: "500201001",
      sna: "YouBike2.0_下庄市場",
      sarea: "八里區",
      ar: "舊城路21號(前)",
      snaen: "YouBike2.0_Shia Juang Market",
      sareaen: "Bali Dist",
      aren: "No.21, Jiucheng Rd., Bali Dist",
      lat: "25.14678",
      lng: "121.3999",
      tot_quantity: "20",
      sbi_quantity: "10",
      bemp: "10",
      act: "1",
      mday: "20260305T211002",
    });

    const station = transformNtcStation(raw);
    expect(station.id).toBe("ntc-500201001");
    expect(station.name).toBe("下庄市場");
    expect(station.nameEn).toBe("Shia Juang Market");
    expect(station.district).toBe("八里區");
    expect(station.lat).toBe(25.14678);
    expect(station.lon).toBe(121.3999);
    expect(station.totalDocks).toBe(20);
    expect(station.availableBikes).toBe(10);
    expect(station.emptyDocks).toBe(10);
    expect(station.status).toBe("active");
    expect(station.city).toBe("ntc");
  });

  it("maps act=0 to inactive status", () => {
    const raw = NtcYouBikeRawSchema.parse({
      sno: "500201001",
      sna: "YouBike2.0_test",
      sarea: "test",
      ar: "test",
      snaen: "YouBike2.0_test",
      sareaen: "test",
      aren: "test",
      lat: "25.0",
      lng: "121.0",
      tot_quantity: "10",
      sbi_quantity: "0",
      bemp: "10",
      act: "0",
      mday: "20260305T000000",
    });
    expect(transformNtcStation(raw).status).toBe("inactive");
  });
});

describe("transformTpeStation", () => {
  it("transforms Taipei raw record to unified YouBikeStation", () => {
    const raw = TpeYouBikeRawSchema.parse({
      sno: "500101001",
      sna: "YouBike2.0_捷運科技大樓站",
      sarea: "大安區",
      ar: "復興南路二段235號前",
      snaen: "YouBike2.0_MRT Technology Bldg. Sta.",
      sareaen: "Daan Dist.",
      aren: "No.235, Sec. 2, Fuxing S. Rd.",
      latitude: 25.02605,
      longitude: 121.5436,
      Quantity: 28,
      available_rent_bikes: 4,
      available_return_bikes: 24,
      act: "1",
      mday: "2026-03-05 22:10:03",
    });

    const station = transformTpeStation(raw);
    expect(station.id).toBe("tpe-500101001");
    expect(station.name).toBe("捷運科技大樓站");
    expect(station.nameEn).toBe("MRT Technology Bldg. Sta.");
    expect(station.lat).toBe(25.02605);
    expect(station.lon).toBe(121.5436);
    expect(station.totalDocks).toBe(28);
    expect(station.availableBikes).toBe(4);
    expect(station.emptyDocks).toBe(24);
    expect(station.status).toBe("active");
    expect(station.city).toBe("tpe");
  });
});
