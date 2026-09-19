import { describe, expect, test } from "bun:test";
import { degrees, forceLayout, neighborhood } from "./graph-layout";

const nodes = ["a", "b", "c", "orphan"].map((id) => ({
  id,
  label: id,
  group: "one",
}));
const edges = [
  { source: "a", target: "b", label: "owns" },
  { source: "b", target: "c", label: "uses" },
];
describe("graph exploration", () => {
  test("local depth follows only real edges without crossing disconnected nodes", () => {
    expect([...neighborhood("a", edges, 1)]).toEqual(["a", "b"]);
    expect([...neighborhood("a", edges, 2)]).toEqual(["a", "b", "c"]);
    expect(neighborhood("a", edges, 3).has("orphan")).toBe(false);
  });
  test("force layout is deterministic, finite and keeps each supplied node", () => {
    const positions = forceLayout(nodes, edges);
    expect(positions).toEqual(forceLayout(nodes, edges));
    expect(Object.keys(positions)).toHaveLength(4);
    for (const p of Object.values(positions)) {
      expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
      expect(Math.abs(p.x)).toBeLessThanOrEqual(430);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(265);
    }
    expect(positions.a).not.toEqual(positions.b);
  });
  test("degrees count supplied relationships and preserve orphans", () => {
    expect(degrees(nodes, edges).get("b")).toBe(2);
    expect(degrees(nodes, edges).get("orphan")).toBe(0);
    expect(forceLayout([], [])).toEqual({});
  });
});
