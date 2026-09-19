import assert from "node:assert/strict";
import { expect } from "@playwright/test";
import { verifyMarketSourcesUi } from "./browser-market-fixture.mjs";
import { verifyVoiceUi } from "./browser-voice-fixture.mjs";

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
  await verifyMarketSourcesUi(page, check);
  const requests = [];
  await page.route("**/api/v1/chat", (route) => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({ json: fixture });
  });
  const selected = await page.evaluate(() => ({
    client: document.querySelector("#client-select option:checked").textContent,
    portfolio: document.querySelector("#portfolio-select option:checked")
      .textContent,
  }));
  await expect(page.getByLabel("Selected context")).toContainText(
    selected.client,
  );
  await expect(page.getByLabel("Selected context")).toContainText(
    selected.portfolio,
  );
  const sessionId = await page
    .getByRole("button", { name: "Copy conversation ID", exact: true })
    .locator("code")
    .textContent();
  assert.match(sessionId, /^[0-9a-f-]{36}$/);
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
  assert.equal(requests[0].chatSessionId, sessionId);
  assert.deepEqual(requests[0].history, []);
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
  await page.mouse.move(0, 0);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await imageAction.focus();
  await page
    .getByRole("tooltip")
    .filter({ hasText: "Generate an illustration" })
    .waitFor();
  await imageAction.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(imageAction).toBeFocused();
  await expect(imageAction).not.toHaveAttribute("aria-describedby", /.+/);
  await imageAction.click();
  assert.equal(await composer.inputValue(), "/image ");
  let imagePrompt;
  let imageContext;
  await page.route("**/api/v1/images", (route) => {
    imageContext = route.request().postDataJSON();
    imagePrompt = imageContext.prompt;
    return route.fulfill({
      json: {
        mimeType: "image/png",
        image:
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=",
        model: "browser-image-fixture",
        briefing: {
          title: "Illustrative portfolio briefing",
          selectedClient: selected.client,
          selectedPortfolio: selected.portfolio,
          asOf: "2026-09-03",
          facts: [{ label: "AUM", value: "100", unit: "CHF", source: "/aum" }],
          warnings: [
            "Illustrative image; accompanying values come from the snapshot.",
          ],
        },
      },
    });
  });
  await composer.fill("Generate an image of a green landscape");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page
    .getByAltText("AI-generated illustration", { exact: true })
    .waitFor();
  assert.equal(imagePrompt, "Generate an image of a green landscape");
  assert.equal(imageContext.chatSessionId, sessionId);
  assert.equal(imageContext.history.length, 2);
  const inline = page.getByAltText("AI-generated illustration", {
    exact: true,
  });
  assert.ok((await inline.boundingBox()).height <= 320);
  await page
    .getByRole("button", { name: "Open image preview", exact: true })
    .click();
  const preview = page.getByRole("dialog", {
    name: "AI-generated illustration",
    exact: true,
  });
  await expect(preview).toBeVisible();
  await expect(
    preview.getByRole("link", { name: "Download image", exact: true }),
  ).toHaveAttribute("download", /\.png$/);
  await shot("chat-image-preview");
  await preview.press("Escape");
  await expect(preview).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Open image preview", exact: true }),
  ).toBeFocused();
  assert.equal(await page.locator("article").count(), 4);
  assert.equal(await page.locator('[data-component-type="chart"]').count(), 1);
  check(
    "fixture image requested in same chat keeps previous answer; tooltip focus and Escape",
  );

  await verifyVoiceUi(page, check, shot);
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page
    .getByRole("button", { name: "AI companion", exact: false })
    .first()
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Copy conversation ID", exact: true })
      .locator("code")
      .textContent(),
    sessionId,
  );
  check(
    "fixture conversation context and ID survive tab navigation; image preview and download are bounded",
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
  for (const [index, { prompt, expectedTypes }] of [
    {
      prompt:
        "Show the portfolio allocation as a chart and explain the largest concentration using only the supplied snapshot. Cite sources.",
      expectedTypes: ["chart"],
    },
    {
      prompt:
        "Show the total portfolio value as a metric card and compare allocation categories in a table. Preserve source units and cite the snapshot.",
      expectedTypes: ["metric", "table"],
    },
    {
      prompt:
        "Show a clearly conceptual diagram of how portfolio evidence informs an advisor review, plus an evidence card citing the supplied snapshot. Do not imply trades or actions occurred.",
      expectedTypes: ["diagram", "evidence"],
    },
    {
      prompt:
        "For a purely hypothetical scenario unrelated to actual portfolio returns, start with CHF 1000 and apply 5 percent annual compound growth for 3 years, with no contributions, taxes or fees. Show years 0 through 3 in a projection chart and state these assumptions. This is not a forecast.",
      expectedTypes: ["projection"],
    },
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
    const componentTypes = answer.components.map((component) => component.type);
    for (const type of expectedTypes) {
      assert.ok(
        componentTypes.includes(type),
        `Provider response ${index + 1} missing requested ${type} component (received: ${componentTypes.join(", ")})`,
      );
      await page
        .locator("article")
        .nth(before + 1)
        .locator(`[data-component-type="${type}"]`)
        .first()
        .waitFor();
    }
    await shot(`workspace-chat-provider-${index + 1}`);
    check(
      `real provider structured chat ${index + 1}: ${answer.components.map((component) => component.type).join(", ")}`,
    );
  }
}
