import { describe, expect, it } from "bun:test";
import { deckContent } from "@/features/deck/content";
import { dictionaries, formatNumber, isLocale, locales } from "./index";

describe("four-language content", () => {
  it("ships complete translations and ten slides for every locale", () => {
    const keys = Object.keys(dictionaries.en).sort();
    for (const locale of locales) {
      expect(Object.keys(dictionaries[locale]).sort()).toEqual(keys);
      expect(
        Object.values(dictionaries[locale]).every(
          (value) => value.trim().length > 0,
        ),
      ).toBe(true);
      expect(deckContent[locale]).toHaveLength(10);
    }
  });
  it("preserves zero and displays unavailable values", () => {
    expect(formatNumber(0, "en")).toBe("0");
    expect(formatNumber(null, "de")).toBe(dictionaries.de.unavailable);
  });
  it("rejects unsupported locale input", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("EN")).toBe(false);
    expect(isLocale("<script>")).toBe(false);
  });
});
