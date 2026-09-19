import assert from "node:assert/strict";
export async function checkGraph(page, screenshot, check) {
  const graph = page.getByRole("application", {
    name: "Interactive relationship graph",
  });
  await graph.locator("[data-node-id]").nth(100).waitFor({ state: "attached" });
  const total = await graph.locator("[data-node-id]").count();
  assert.ok(total > 100);
  assert.ok((await graph.locator("line").count()) > 100);
  await screenshot("admin-graph-global");
  await page
    .getByText("Keyboard navigation · browse all nodes", { exact: true })
    .click();
  const focus = page.getByRole("combobox", { name: "Focus node" });
  await focus.selectOption("portfolio:0");
  const inspector = page.getByRole("complementary", { name: "Node inspector" });
  await inspector.getByRole("heading", { name: "P01", exact: true }).waitFor();
  await page.getByRole("button", { name: "Neighborhood", exact: true }).click();
  const localCount = await graph.locator("[data-node-id]").count();
  assert.ok(localCount > 1 && localCount < total);
  await page
    .getByRole("combobox", { name: "Depth", exact: true })
    .selectOption("2");
  assert.ok((await graph.locator("[data-node-id]").count()) >= localCount);
  await screenshot("admin-graph-neighborhood");
  await inspector.getByRole("button").first().click();
  assert.notEqual(await focus.inputValue(), "portfolio:0");
  await page.getByRole("button", { name: "Whole graph", exact: true }).click();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByText("120%", { exact: true }).waitFor();
  await graph.focus();
  await page.keyboard.press("ArrowRight");
  assert.match(
    await graph.locator(":scope > g").getAttribute("transform"),
    /translate\(-30/,
  );
  await page.keyboard.press("0");
  await page.getByText("100%", { exact: true }).waitFor();
  const movable = graph.locator('[data-node-id="portfolio:0"]');
  const originalPosition = await movable.getAttribute("transform");
  const dot = await movable.locator("circle").last().boundingBox();
  await page.mouse.move(dot.x + dot.width / 2, dot.y + dot.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    dot.x + dot.width / 2 + 45,
    dot.y + dot.height / 2 + 25,
    { steps: 6 },
  );
  await page.mouse.up();
  assert.notEqual(await movable.getAttribute("transform"), originalPosition);
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await page.getByRole("searchbox", { name: "Find a node…" }).fill("Client 01");
  assert.equal(await graph.locator("[data-node-id]").count(), 1);
  await page
    .getByRole("searchbox", { name: "Find a node…" })
    .fill("no-such-graph-node");
  await page
    .getByText("No nodes match these filters.", { exact: true })
    .waitFor();
  await page.getByRole("searchbox", { name: "Find a node…" }).fill("");
  const assetGroup = page
    .getByRole("group", { name: "Entity groups" })
    .getByRole("button")
    .last();
  await assetGroup.click();
  assert.ok((await graph.locator("[data-node-id]").count()) < total);
  await assetGroup.click();
  await page.getByRole("checkbox", { name: "All labels" }).check();
  await screenshot("admin-graph-labels");
  check(
    "force graph renders actual edges and supports search, filters, local depth, inspector traversal and keyboard zoom/pan",
  );
}
export async function checkOntology(page, screenshot, check) {
  const graph = page.getByRole("application", {
    name: "Interactive relationship graph",
  });
  await graph.locator("[data-node-id]").nth(10).waitFor({ state: "attached" });
  assert.equal(await graph.locator("line").count(), 7);
  await graph.getByRole("button", { name: "Positions", exact: true }).click();
  const inspector = page.getByRole("complementary", { name: "Node inspector" });
  await inspector.getByText("SecurityId → Id", { exact: true }).waitFor();
  await screenshot("admin-ontology-selected");
  check(
    "ontology displays source entities, seven actual join edges and exact join-rule detail",
  );
}
