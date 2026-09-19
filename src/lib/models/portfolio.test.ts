import { describe, expect, it } from "bun:test";
import { parseBriefing, parseClients, parsePortfolio } from "./portfolio";

const source = {
  id: "source-1",
  title: "Challenge snapshot",
  url: "https://example.org/data",
  asOf: "2026-09-18",
};
const snapshot = {
  id: "portfolio-a",
  name: "Balanced portfolio",
  currency: "EUR",
  reportingCurrency: "CHF",
  aum: "250000",
  asOf: "2026-09-18",
  sourceRef: "snapshot-a",
  sources: [source],
  holdings: [
    {
      id: "a",
      name: "Holding A",
      assetClass: "Equity",
      currency: "EUR",
      value: "25000",
      weight: "0.125",
    },
    {
      id: "b",
      name: "Unknown holding",
      assetClass: null,
      currency: "EUR",
      value: null,
      weight: null,
    },
  ],
  allocation: [
    {
      category: "Equity",
      weight: "0.125",
      target: "0.2",
      min: "0.1",
      max: "0.3",
    },
  ],
  violations: [
    {
      code: "ALLOCATION_BELOW_TARGET",
      severity: "warning",
      sourceRef: "rule-1",
    },
  ],
  dataGaps: ["Historical returns unavailable"],
};
describe("portfolio boundary", () => {
  it("converts source fractions into display percentages without changing values", () => {
    const result = parsePortfolio(snapshot);
    expect(result.holdings[0].weight).toBe(12.5);
    expect(result.allocation[0].target).toBe(20);
    expect(result.allocation[0].min).toBe(10);
    expect(result.totalValue).toBe(250000);
    expect(result.reportingCurrency).toBe("CHF");
    expect(result.currency).toBe("EUR");
  });
  it("preserves unavailable values instead of inventing zero", () => {
    const result = parsePortfolio(snapshot);
    expect(result.holdings[1].marketValue).toBeNull();
    expect(result.holdings[1].weight).toBeNull();
  });
  it("renders imported sponsor findings when their source date or optional locator is unavailable", () => {
    const result = parsePortfolio({
      ...snapshot,
      sources: [{ ...source, asOf: null }],
      violations: [{ code: "Sponsor warning", severity: "Warning" }],
    });
    expect(result.sources[0].asOf).toBe("");
    expect(result.findings[0].source).toBe("");
    expect(result.findings[0].message).toBe("Sponsor warning");
    expect(result.holdings[0].marketValue).toBe(25000);
  });
  it("rejects malformed portfolio values", () => {
    expect(() => parsePortfolio({ ...snapshot, aum: "NaN" })).toThrow();
    expect(() =>
      parsePortfolio({ ...snapshot, holdings: "invalid" }),
    ).toThrow();
  });
  it("preserves zero holdings and empty source facts", () => {
    const result = parsePortfolio({ ...snapshot, holdings: [], aum: "0" });
    expect(result.totalValue).toBe(0);
    expect(result.holdings).toEqual([]);
  });
  it("requires authenticated client list shape", () => {
    expect(() => parseClients({ clients: [{ id: 1 }] })).toThrow();
  });
  it("keeps unsafe source text inert as plain strings", () => {
    const result = parseBriefing({
      mode: "deterministic-fallback",
      generatedAt: "2026-09-19",
      sections: [{ key: "health", text: "<script>alert(1)</script>" }],
      sources: [source],
    });
    expect(result.sections[0].text).toBe("<script>alert(1)</script>");
  });
});

it("renders a validated synthesized briefing response while preserving source fallback data", () => {
  const value = {
    mode: "provider",
    generatedAt: "2026-09-19",
    sections: [{ key: "health", text: "Deterministic fallback" }],
    sources: [source],
    assistantResponse: {
      text: "Synthesized story",
      model: "provider",
      evidence: [{ id: "E1", label: "Snapshot", locator: "portfolio.aum" }],
      components: [
        {
          type: "metric",
          label: "Value",
          value: "250000",
          detail: "CHF",
          sourceIds: ["E1"],
        },
      ],
    },
  };
  expect(parseBriefing(value).assistantResponse?.components[0].type).toBe(
    "metric",
  );
  const rejected = parseBriefing({
    ...value,
    assistantResponse: {
      ...value.assistantResponse,
      components: [{ type: "html", html: "<script>bad()</script>" }],
    },
  });
  expect(rejected.assistantResponse).toBeUndefined();
  expect(rejected.sections[0].text).toBe("Deterministic fallback");
});
