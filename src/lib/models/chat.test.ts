import { describe, expect, it } from "bun:test";
import { imagePrompt, parseChatAnswer, parseGeneratedImage } from "./chat";

const evidence = [
  { id: "E1", label: "Portfolio snapshot", locator: "portfolio.allocation[0]" },
];
const chart = {
  type: "chart" as const,
  title: "Allocation",
  unit: "%",
  sourceIds: ["E1"],
  points: [
    { label: "Equities", value: 0 },
    { label: "Change", value: -4 },
  ],
};
const response = (component: unknown) => ({
  text: "Grounded answer",
  model: "provider-model",
  source: "provider",
  evidence,
  components: [component],
});

describe("chat response boundary", () => {
  it("keeps grounded chart values, including zero and negative values", () => {
    expect(parseChatAnswer(response(chart)).components[0]).toEqual(chart);
  });
  it("accepts text-only responses without fabricating components", () => {
    expect(
      parseChatAnswer({ text: "Source unavailable", model: "model" })
        .components,
    ).toEqual([]);
  });
  it("accepts the complete provider and covenant envelope at contract limits", () => {
    const fullEvidence = Array.from({ length: 80 }, (_, index) => ({
      id: `E${index + 1}`,
      label: "Snapshot",
      locator: "/allocation",
    }));
    const fullChart = {
      ...chart,
      unit: "u".repeat(80),
      sourceIds: fullEvidence.map((item) => item.id),
      points: [{ label: "a".repeat(160), value: 1e20 }],
    };
    const answer = parseChatAnswer({
      ...response(fullChart),
      evidence: fullEvidence,
      sourceIds: ["E1"],
      warnings: [],
      orchestrator: "openclaw",
      outcome: {
        id: "r",
        status: "accepted",
        agentIds: [],
        skillIds: [],
        verification: { status: "passed", checks: [], humanReviewed: false },
        warnings: [],
      },
    });
    expect(answer.components[0].type).toBe("chart");
    expect(answer.outcome?.verification.humanReviewed).toBe(false);
  });
  it("preserves blank cells and optional empty unit strings from valid provider tables", () => {
    expect(
      parseChatAnswer(
        response({
          type: "table",
          title: "Coverage",
          columns: ["Source", "Detail"],
          rows: [["Snapshot", ""]],
          sourceIds: ["E1"],
        }),
      ).components[0].type,
    ).toBe("table");
    expect(
      parseChatAnswer(response({ ...chart, unit: "" })).components[0].type,
    ).toBe("chart");
  });
  it("rejects arbitrary component types and unexpected executable fields", () => {
    for (const component of [
      { type: "html", html: "<script>bad()</script>" },
      { ...chart, style: "position:fixed" },
      { ...chart, points: [{ label: "x", value: Number.POSITIVE_INFINITY }] },
    ])
      expect(() => parseChatAnswer(response(component))).toThrow();
  });
  it("rejects fabricated source references and missing numeric evidence", () => {
    expect(() =>
      parseChatAnswer(response({ ...chart, sourceIds: ["E404"] })),
    ).toThrow();
    expect(() =>
      parseChatAnswer(response({ ...chart, sourceIds: [] })),
    ).toThrow();
  });
  it("rejects duplicate source IDs, oversized tables and inconsistent row widths", () => {
    expect(() =>
      parseChatAnswer({
        ...response(chart),
        evidence: [...evidence, ...evidence],
      }),
    ).toThrow();
    const table = {
      type: "table",
      title: "Values",
      columns: ["Asset", "Value"],
      rows: [["Cash"]],
      sourceIds: ["E1"],
    };
    expect(() => parseChatAnswer(response(table))).toThrow();
    expect(() =>
      parseChatAnswer(
        response({ ...table, rows: Array(51).fill(["Cash", "0"]) }),
      ),
    ).toThrow();
  });
  it("requires projection assumptions and validates graph edge endpoints", () => {
    const projection = {
      type: "projection",
      title: "Scenario",
      unit: null,
      assumptions: ["Illustrative constant values"],
      points: chart.points,
      sourceIds: [],
    };
    expect(parseChatAnswer(response(projection)).components[0].type).toBe(
      "projection",
    );
    expect(() =>
      parseChatAnswer(response({ ...projection, assumptions: [] })),
    ).toThrow();
    expect(() =>
      parseChatAnswer(
        response({
          type: "diagram",
          title: "Relationships",
          nodes: [{ id: "a", label: "A" }],
          edges: [{ from: "a", to: "missing" }],
          sourceIds: [],
        }),
      ),
    ).toThrow();
  });
  it("accepts explicit nullable contract fields and bounded verification outcomes", () => {
    const result = parseChatAnswer({
      ...response({
        type: "metric",
        label: "Value",
        value: "CHF 0",
        detail: null,
        sourceIds: ["E1"],
      }),
      outcome: {
        id: "run-1",
        status: "needs_review",
        agentIds: ["verifier"],
        skillIds: ["portfolio-review"],
        verification: {
          status: "needs_review",
          checks: ["Review underlying data"],
        },
        warnings: ["Historical snapshot"],
      },
    });
    expect(result.outcome?.warnings).toEqual(["Historical snapshot"]);
  });
});

describe("same-conversation image capability", () => {
  it("routes explicit requests in all four languages", () => {
    for (const prompt of [
      "Generate an image of a river",
      "Can you please generate an image of a river?",
      "Could you create a picture of a river?",
      "Puedes crear una imagen de un río",
      "Peux-tu créer une image de rivière",
      "Crea una imagen de un río",
      "Erstelle ein Bild von einem Fluss",
      "Génère une image de rivière",
    ])
      expect(imagePrompt(prompt)).toBe(prompt);
    expect(imagePrompt("/image a landscape")).toBe("a landscape");
    expect(imagePrompt("/image")).toBe("");
    expect(imagePrompt("/IMAGE a landscape")).toBe("a landscape");
  });
  it("does not route mentions, negations, diagrams or portfolio questions to image generation", () => {
    for (const prompt of [
      "Do not generate an image",
      "Can you explain this image?",
      "Show allocation as a chart",
      "Draw a conceptual diagram",
      "Do we need to create an image?",
      "/imagery something",
    ])
      expect(imagePrompt(prompt)).toBeNull();
  });
  it("accepts only bounded raster data and never remote or SVG image URLs", () => {
    expect(
      parseGeneratedImage({
        mimeType: "image/png",
        image: "iVBORw==",
        model: "image-model",
      }).src,
    ).toBe("data:image/png;base64,iVBORw==");
    expect(() =>
      parseGeneratedImage({
        mimeType: "image/svg+xml",
        image: "PHN2Zz4=",
        model: "image-model",
      }),
    ).toThrow();
    expect(() =>
      parseGeneratedImage({
        mimeType: "image/png",
        image: "https://example.org/tracker",
        model: "image-model",
      }),
    ).toThrow();
  });
});
