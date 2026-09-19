import { describe, expect, test } from "bun:test";
import { inFolder, type LibraryDocument, reconciliation } from "./model";

describe("document scope and custody arithmetic", () => {
  test("client, portfolio and chat folders stay distinct", () => {
    const doc = { portfolioId: "p1", chatSessionId: "s1" } as LibraryDocument;
    expect(inFolder(doc, "chat", "p1", "s1")).toBe(true);
    expect(inFolder(doc, "chat", "p1", "s2")).toBe(false);
    expect(inFolder(doc, "portfolio", "p1", "s1")).toBe(false);
    expect(inFolder(doc, "client", "p1", "s1")).toBe(false);
  });
  test("missing positions and invalid amounts block reconciliation", () => {
    expect(reconciliation([], "100").valid).toBe(false);
    expect(reconciliation([{ marketValue: "NaN" }] as never, "100").valid).toBe(
      false,
    );
    expect(reconciliation([{ marketValue: "90" }] as never, "100").valid).toBe(
      false,
    );
    expect(
      reconciliation(
        [{ marketValue: "60" }, { marketValue: "40" }] as never,
        "100",
      ).valid,
    ).toBe(true);
  });
  test("whole-unit source rounding is visible without silently reconciling the holdings", () => {
    const result = reconciliation(
      [{ marketValue: "60" }, { marketValue: "39" }] as never,
      "100",
    );
    expect(result).toMatchObject({
      valid: false,
      roundingEligible: true,
      difference: 1,
      sum: 99,
    });
    expect(
      reconciliation(
        [{ marketValue: "60.2" }, { marketValue: "39" }] as never,
        "100",
      ).roundingEligible,
    ).toBe(false);
    expect(
      reconciliation(
        [{ marketValue: "60" }, { marketValue: "30" }] as never,
        "100",
      ).roundingEligible,
    ).toBe(false);
  });
});
