import { describe, expect, it } from "@jest/globals";
import { parseCsv } from "../src/data-sources/aed.js";

describe("parseCsv", () => {
  it("parses CSV with BOM and quoted fields", () => {
    const csv = [
      '\uFEFF"場所ID","場所名稱","地點LAT","地點LNG"',
      '"100","台大醫院","25.04","121.52"',
    ].join("\n");

    const rows = parseCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]["場所ID"]).toBe("100");
    expect(rows[0]["場所名稱"]).toBe("台大醫院");
    expect(rows[0]["地點LAT"]).toBe("25.04");
    expect(rows[0]["地點LNG"]).toBe("121.52");
  });

  it("handles escaped double quotes in fields", () => {
    const csv = ['"A","B"', '"hello ""world""","test"'].join("\n");

    const rows = parseCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]["A"]).toBe('hello "world"');
  });

  it("handles commas inside quoted fields", () => {
    const csv = ['"Name","Address"', '"Hospital","No. 1, Main St"'].join("\n");

    const rows = parseCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]["Address"]).toBe("No. 1, Main St");
  });

  it("skips rows with wrong number of columns", () => {
    const csv = ['"A","B","C"', '"1","2","3"', '"only","two"'].join("\n");

    const rows = parseCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]["A"]).toBe("1");
  });

  it("returns empty array for empty input", () => {
    expect(parseCsv("")).toEqual([]);
  });

  it("handles unquoted fields", () => {
    const csv = ["A,B", "hello,world"].join("\n");

    const rows = parseCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]["A"]).toBe("hello");
    expect(rows[0]["B"]).toBe("world");
  });
});
