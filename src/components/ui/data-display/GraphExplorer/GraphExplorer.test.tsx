import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { GraphExplorer } from "./GraphExplorer";
import type { GraphCopy } from "./types";

const copy: GraphCopy = {
  search: "Search",
  focus: "Focus",
  all: "All",
  local: "Local",
  depth: "Depth",
  groups: "Groups",
  labels: "Labels",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  reset: "Reset",
  instructions: "Keyboard controls",
  inspector: "Inspector",
  choose: "Choose a node",
  connections: "connections",
  nodes: "nodes",
  edges: "edges",
  empty: "Empty",
  list: "Keyboard list",
  fit: "Fit",
  spread: "Spacing",
  overview: "Graph",
  relationship: "Relation",
};
test("graph provides an equivalent native node selector and escapes source labels", () => {
  const html = renderToStaticMarkup(
    <GraphExplorer
      nodes={[
        { id: "a", label: "<script>unsafe</script>", group: "one" },
        { id: "b", label: "Portfolio", group: "one" },
      ]}
      edges={[{ source: "a", target: "b", label: "owns" }]}
      groups={[{ id: "one", label: "Clients" }]}
      copy={copy}
    />,
  );
  expect(html).toContain('role="application"');
  expect(html).toContain("aria-describedby=");
  expect(html).toContain('data-node-id="a"');
  expect(html).toContain("<select");
  expect(html).toContain('value="a"');
  expect(html).toContain("&lt;script&gt;unsafe&lt;/script&gt;");
  expect(html).not.toContain("<script>unsafe</script>");
});
