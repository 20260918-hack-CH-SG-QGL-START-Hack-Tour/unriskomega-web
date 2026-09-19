import assert from "node:assert/strict";

const sourceIds = ["E1"];
const points = [
  { label: "Equities", value: 65 },
  { label: "Cash", value: 0 },
  { label: "Change", value: -5 },
];
const components = [
  {
    type: "metric",
    label: "Snapshot value",
    value: "CHF 100",
    detail: null,
    sourceIds,
  },
  {
    type: "table",
    title: "Snapshot table",
    columns: ["Asset", "Value"],
    rows: [["Equities", "65"]],
    sourceIds,
  },
  { type: "chart", title: "Snapshot chart", unit: "%", points, sourceIds },
  {
    type: "evidence",
    title: "Snapshot evidence",
    items: [
      {
        label: "Source record",
        detail: "<script>window.injected=true</script>",
        source: "E1",
      },
    ],
    sourceIds,
  },
  {
    type: "diagram",
    title: "Conceptual review flow",
    nodes: [
      { id: "holdings", label: "Holdings" },
      { id: "review", label: "Advisor review" },
    ],
    edges: [{ from: "holdings", to: "review", label: "informs" }],
    sourceIds: [],
  },
  {
    type: "projection",
    title: "Illustrative scenario",
    unit: "CHF",
    points,
    assumptions: ["A test illustration, not portfolio performance"],
    sourceIds: [],
  },
];
const fixture = {
  text: "**Browser fixture:** portfolio explanation with six structured components.",
  model: "browser-fixture",
  source: "provider",
  orchestrator: "openclaw",
  components,
  evidence: [
    { id: "E1", label: "Fixture source", locator: "/portfolio/allocation/0" },
  ],
  sourceIds,
  warnings: [],
  outcome: {
    id: "fixture-run",
    status: "accepted",
    agentIds: ["verifier"],
    skillIds: ["portfolio-analysis"],
    verification: {
      status: "passed",
      checks: ["component-schema", "run-local-source-membership"],
      humanReviewed: false,
    },
    warnings: [],
  },
};

/** UI-only fixtures; provider checks remain a separate real-network phase. */
export async function verifyGenerativeChat(page, check, shot) {
  await page.route("**/api/v1/chat", (route) =>
    route.fulfill({ json: fixture }),
  );
  const composer = page.getByLabel("Ask about this portfolio", { exact: true });
  await page
    .getByRole("button", { name: "Allocation chart", exact: true })
    .click();
  assert.match(await composer.inputValue(), /allocation as a chart/);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.locator('[data-component-type="projection"]').waitFor();
  for (const type of [
    "metric",
    "table",
    "chart",
    "evidence",
    "diagram",
    "projection",
  ])
    assert.equal(
      await page.locator(`[data-component-type="${type}"]`).count(),
      1,
    );
  assert.equal(await page.evaluate(() => window.injected), undefined);
  assert.equal(await page.locator("article script").count(), 0);
  await page
    .getByText("Illustrative scenario · not a forecast", { exact: true })
    .waitFor();
  await page.locator('[data-component-type="chart"] summary').click();
  await page
    .locator('[data-component-type="chart"]')
    .getByText("/portfolio/allocation/0", { exact: true })
    .waitFor();
  await shot("chat-six-components-light");
  check(
    "fixture structured metrics, table, chart, evidence, diagram and scenario; inert untrusted text",
  );

  const imageAction = page.getByRole("button", {
    name: "Create image",
    exact: true,
  });
  await imageAction.focus();
  await page
    .getByRole("tooltip")
    .filter({ hasText: "Generate an illustration" })
    .waitFor();
  await imageAction.press("Escape");
  assert.equal(await page.getByRole("tooltip").count(), 0);
  await imageAction.click();
  assert.equal(await composer.inputValue(), "/image ");
  let imagePrompt;
  await page.route("**/api/v1/images", (route) => {
    imagePrompt = route.request().postDataJSON().prompt;
    return route.fulfill({
      json: {
        mimeType: "image/png",
        image:
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=",
        model: "browser-image-fixture",
      },
    });
  });
  await composer.fill("Generate an image of a green landscape");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page
    .getByAltText("AI-generated illustration", { exact: true })
    .waitFor();
  assert.equal(imagePrompt, "Generate an image of a green landscape");
  assert.equal(await page.locator("article").count(), 4);
  assert.equal(await page.locator('[data-component-type="chart"]').count(), 1);
  check(
    "fixture image requested in same chat keeps previous answer; tooltip focus and Escape",
  );

  await page.getByRole("button", { name: "Dark mode", exact: true }).click();
  await shot("chat-six-components-dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot("chat-six-components-mobile");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Light mode", exact: true }).click();
  check("fixture chat reflows on mobile and preserves both themes");

  for (const [locale, label] of [
    ["es", "Crear imagen"],
    ["de", "Bild erstellen"],
    ["fr", "Créer une image"],
    ["en", "Create image"],
  ]) {
    await page.locator("header select").selectOption(locale);
    await page.getByRole("button", { name: label, exact: true }).waitFor();
  }
  check("fixture chat controls support all four locales");
  await page.unroute("**/api/v1/chat");
  await page.unroute("**/api/v1/images");
}

export async function verifyLiveStructuredChat(page, check, shot) {
  for (const [index, prompt] of [
    "Show the portfolio allocation as a chart and explain the largest concentration using only the supplied snapshot. Cite sources.",
    "Show the total portfolio value as a metric card and compare allocation categories in a table. Preserve source units and cite the snapshot.",
  ].entries()) {
    const before = await page.locator("article").count();
    await page
      .getByLabel("Ask about this portfolio", { exact: true })
      .fill(prompt);
    const pending = page.waitForResponse(
      (response) =>
        response.url().endsWith("/chat") &&
        response.request().method() === "POST",
      { timeout: 120000 },
    );
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    const response = await pending;
    assert.equal(response.status(), 200);
    const answer = await response.json();
    assert.equal(answer.source, "provider");
    assert.ok(answer.model);
    assert.equal(answer.outcome.status, "accepted");
    assert.equal(answer.outcome.verification.status, "passed");
    assert.ok(answer.components.length > 0);
    await page
      .locator("article")
      .nth(before + 1)
      .locator("[data-component-type]")
      .first()
      .waitFor();
    await shot(`workspace-chat-provider-${index + 1}`);
    check(
      `real provider structured chat ${index + 1}: ${answer.components.map((component) => component.type).join(", ")}`,
    );
  }
}
