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
});
