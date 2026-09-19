import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { chatMessages } from "@/lib/i18n/chat";
import type { ChatComponent } from "@/lib/models/chatComponents";
import { AnswerBlocks } from "./AnswerBlocks";

it("renders all six component types with sources and scenario disclosures", () => {
  const sourceIds = ["E1"];
  const points = [
    { label: "Now", value: 0 },
    { label: "Scenario", value: -5 },
  ];
  const components: ChatComponent[] = [
    { type: "metric", label: "Value", value: "CHF 0", sourceIds },
    {
      type: "table",
      title: "Holdings",
      columns: ["Asset", "Value"],
      rows: [["Cash", "0"]],
      sourceIds,
    },
    { type: "chart", title: "Allocation", unit: "%", points, sourceIds },
    {
      type: "evidence",
      title: "Proof",
      items: [{ label: "Snapshot", detail: "<img src=x onerror=bad()>" }],
      sourceIds,
    },
    {
      type: "diagram",
      title: "Review",
      nodes: [
        { id: "a", label: "Holdings" },
        { id: "b", label: "Advisor" },
      ],
      edges: [{ from: "a", to: "b", label: "informs" }],
      sourceIds: [],
    },
    {
      type: "projection",
      title: "Scenario",
      points,
      assumptions: ["Fixed change, illustration only"],
      sourceIds: [],
    },
  ];
  const html = renderToStaticMarkup(
    <AnswerBlocks
      components={components}
      evidence={[{ id: "E1", label: "Snapshot", locator: "javascript:bad()" }]}
      locale="en"
      copy={chatMessages.en}
    />,
  );
  for (const component of components)
    expect(html).toContain(`data-component-type="${component.type}"`);
  expect(html).toContain("not a forecast");
  expect(html).toContain("Fixed change, illustration only");
  expect(html).toContain('scope="col"');
  expect(html).toContain("-5 %");
  expect(html).toContain("&lt;img");
  expect(html).not.toContain("href=");
  expect(html).not.toContain("<img");
});
