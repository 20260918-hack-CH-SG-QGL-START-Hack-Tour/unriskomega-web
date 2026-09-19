import { describe, expect, it } from "bun:test";
import { parseAdminCatalog, parseOutcomes, parseRuntime } from "./admin";

const catalog = {
  access: "demo-readonly",
  checkedAt: "2026-09-19T10:00:00Z",
  counts: {
    clients: 1,
    portfolios: 0,
    holdings: 0,
    violations: 0,
    missingPerformanceYtd: 0,
  },
  valuationRange: { from: null, to: null },
  source: {
    generatedAt: "2026-09-19T10:00:00Z",
    sources: [],
    datasets: [],
    documents: [],
  },
  graph: {
    nodes: [{ id: "c1", label: "CASE-001", kind: "client", count: 0 }],
    edges: [],
    scope: "loaded-portfolio-snapshot",
  },
  ontology: [],
};
describe("admin response boundary", () => {
  it("preserves empty data and unknown source dates", () => {
    const parsed = parseAdminCatalog(catalog);
    expect(parsed.counts.portfolios).toBe(0);
    expect(parsed.valuationRange.from).toBeNull();
  });
  it("rejects privilege changes and dangling graph relationships", () => {
    expect(() =>
      parseAdminCatalog({ ...catalog, access: "administrator" }),
    ).toThrow();
    expect(() =>
      parseAdminCatalog({
        ...catalog,
        graph: {
          ...catalog.graph,
          edges: [{ from: "c1", to: "missing", relation: "owns" }],
        },
      }),
    ).toThrow();
  });
  it("rejects malformed metrics and runtime capabilities", () => {
    expect(() =>
      parseAdminCatalog({
        ...catalog,
        counts: { ...catalog.counts, clients: "NaN" },
      }),
    ).toThrow();
    expect(() =>
      parseRuntime({
        version: "1.0",
        profile: { id: "demo", name: "demo", tools: [], deniedActions: [] },
        agents: [],
        skills: [],
        workflow: { id: "demo", mode: "bounded-sequential", steps: [] },
        capabilities: { trading: "true" },
      }),
    ).toThrow();
  });
  it("keeps source labels inert without turning them into markup", () => {
    const parsed = parseAdminCatalog({
      ...catalog,
      graph: {
        ...catalog.graph,
        nodes: [
          { ...catalog.graph.nodes[0], label: "<script>alert(1)</script>" },
        ],
      },
    });
    expect(parsed.graph.nodes[0].label).toBe("<script>alert(1)</script>");
  });
  it("requires outcomes to contain verification evidence", () => {
    expect(() =>
      parseOutcomes({ outcomes: [{ id: "one", status: "accepted" }] }),
    ).toThrow();
    expect(parseOutcomes({ outcomes: [] })).toEqual([]);
  });
});
