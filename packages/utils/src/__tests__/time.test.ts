import { describe, expect, it } from "@jest/globals";
import { parseNtcTimestamp, getTaipeiDayOfWeek } from "../time.js";

describe("parseNtcTimestamp", () => {
  it("parses a valid NTC timestamp string", () => {
    const date = parseNtcTimestamp("2026/02/26 14:30:00");
    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(1); // 0-indexed → February
    expect(date.getUTCDate()).toBe(26);
    // 14:30 in +08:00 → 06:30 UTC
    expect(date.getUTCHours()).toBe(6);
    expect(date.getUTCMinutes()).toBe(30);
  });

  it("throws on invalid timestamp format", () => {
    expect(() => parseNtcTimestamp("2026-02-26 14:30:00")).toThrow(
      "Invalid NTC timestamp",
    );
  });
});

describe("getTaipeiDayOfWeek", () => {
  it("returns 0 (Sunday) for 2026-03-01", () => {
    // 2026-03-01 is a Sunday
    const date = new Date("2026-03-01T00:00:00+08:00");
    expect(getTaipeiDayOfWeek(date)).toBe(0);
  });

  it("returns 4 (Thursday) for 2026-02-26", () => {
    // 2026-02-26 is a Thursday
    const date = new Date("2026-02-26T12:00:00+08:00");
    expect(getTaipeiDayOfWeek(date)).toBe(4);
  });
});
