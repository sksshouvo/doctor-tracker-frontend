import { describe, expect, it } from "vitest";
import { DATE_PRESETS, describeRange } from "@/lib/date-presets";
import { formatDate, formatNumber, initials, safeNext, toYmd, truncate } from "@/lib/format";
import { toQuery } from "@/lib/query-string";

describe("format helpers", () => {
  it("formats dates as d MMM yyyy and handles empty", () => {
    expect(formatDate("2026-03-05T10:00:00Z")).toMatch(/^\d{1,2} Mar 2026$/);
    expect(formatDate(null)).toBe("—");
  });
  it("formats numbers with grouping", () => expect(formatNumber(1234567)).toBe("1,234,567"));
  it("builds initials and skips the Dr. prefix", () => {
    expect(initials("Dr. Ayesha Rahman")).toBe("AR");
    expect(initials("Karim")).toBe("K");
  });
  it("truncates long text", () => expect(truncate("abcdefghij", 5)).toBe("abcd…"));
  it("only accepts same-origin relative `next` values", () => {
    expect(safeNext("/patients?x=1")).toBe("/patients?x=1");
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext(null)).toBe("/dashboard");
  });
  it("toYmd is zero padded", () => expect(toYmd(new Date(2026, 0, 5))).toBe("2026-01-05"));
});

describe("toQuery", () => {
  it("drops empty values and joins arrays as CSV", () => {
    expect(
      toQuery({
        q: "",
        page: 2,
        specialization: ["A", "B"],
        hospital: [],
        from: null,
        sort: "-name",
      }),
    ).toEqual({
      page: 2,
      specialization: "A,B",
      sort: "-name",
    });
  });
});

describe("date presets", () => {
  it("every preset returns an ordered YYYY-MM-DD range", () => {
    for (const p of DATE_PRESETS) {
      const { from, to } = p.range();
      expect(from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(from <= to).toBe(true);
    }
  });
  it("today is a single day, 7d spans 7 days", () => {
    const today = DATE_PRESETS.find((p) => p.id === "today")!.range();
    expect(today.from).toBe(today.to);
    const w = DATE_PRESETS.find((p) => p.id === "7d")!.range();
    const days = (new Date(w.to).getTime() - new Date(w.from).getTime()) / 86_400_000;
    expect(days).toBe(6);
  });
  it("describes ranges", () => {
    expect(describeRange(null, null)).toBeNull();
    expect(describeRange("2026-01-01", null)).toBe("2026-01-01 → …");
  });
});
