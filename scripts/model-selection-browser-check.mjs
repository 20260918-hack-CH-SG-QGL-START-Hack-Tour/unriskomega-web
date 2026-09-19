import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const base = process.env.QA_BASE_URL;
if (!base) throw new Error("QA_BASE_URL is required");
const phases = (process.env.QA_MODEL_PHASES ?? "fixture").split(",");
assert.ok(phases.every((phase) => ["fixture", "live"].includes(phase)));
const output = process.env.QA_OUTPUT_DIR ?? "/tmp/unriskomega-model-browser";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.QA_CHROMIUM_PATH,
  headless: true,
});
const checks = [],
  requests = [],
  errors = [];
let completed = false,
  failure;
const check = (message) => {
  checks.push(message);
  console.log(`PASS ${message}`);
};
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function isPost(request, path) {
  return (
    new URL(request.url()).pathname === `/api/v1/${path}` &&
    request.method() === "POST"
  );
}
async function login(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/login`);
  await page
    .getByRole("button", { name: "Demo advisor account", exact: true })
    .click();
  await page.waitForURL("**/workspace");
  await page.getByText("Portfolio value", { exact: true }).waitFor();
}
async function openChat(page) {
  await page
    .getByRole("button", { name: "AI companion", exact: false })
    .first()
    .click();
  await page.locator("#chat-analysis-model").waitFor();
}
async function send(page, text) {
  const pending = page.waitForResponse(
    (response) => isPost(response.request(), "chat"),
    { timeout: 130000 },
  );
  await page.locator("#companion-message").fill(text);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  const response = await pending;
  const body = await response.json();
  assert.equal(response.status(), 200, JSON.stringify(body));
  return { request: response.request().postDataJSON(), body };
}
async function mobile(page, name) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  await page.locator("#chat-analysis-model").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/${name}-selector.png` });
}
async function locales(page) {
  for (const [locale, label] of [
    ["es", "Modelo de análisis"],
    ["de", "Analysemodell"],
    ["fr", "Modèle d’analyse"],
    ["en", "Analysis model"],
  ]) {
    await page.locator("header select").selectOption(locale);
    await expect(page.locator('label[for="chat-analysis-model"]')).toHaveText(
      label,
    );
  }
}

async function fixture() {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const firstGate = deferred(),
    briefGate = deferred();
  const modelA = "qa-analysis-a",
    modelB = "qa-analysis-b";
  const marker = "MODEL_CONTEXT_ATTACHMENT_472";
  let document,
    firstBody,
    briefingBody,
    alias = "",
    chatCount = 0;
  const answer = (model, text) => ({
    model,
    text,
    evidence: [
      { id: "E1", label: "Supplied portfolio", locator: "portfolio.aum" },
    ],
    components: [
      {
        type: "metric",
        label: "Fixture context retained",
        value: "1",
        sourceIds: ["E1"],
      },
    ],
    warnings: [],
  });
  await context.route("**/api/v1/ai/models", (route) =>
    route.fulfill({
      json: {
        defaultModel: modelA,
        models: [
          { id: modelA, label: "Fixture A" },
          { id: modelB, label: "Fixture B" },
        ],
      },
    }),
  );
  await context.route("**/api/v1/documents**", async (route) => {
    const request = route.request();
    if (request.method() === "POST") {
      const body = request.postDataJSON();
      document = {
        id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        filename: body.filename,
        kind: "reference",
        status: "ready",
        clientId: body.clientId,
        portfolioId: body.portfolioId,
        chatSessionId: body.chatSessionId,
        createdAt: Date.now(),
        virtualPortfolioId: "",
        extractionComplete: true,
        holdingCount: 0,
        extraction: {
          title: "Conversation attachment",
          summary: marker,
          asOf: null,
          currency: null,
          totalValue: null,
          holdings: [],
          warnings: [],
          extractedText: marker,
        },
      };
      return route.fulfill({
        json: {
          id: document.id,
          status: "ready",
          extraction: document.extraction,
        },
      });
    }
    return route.fulfill({
      json:
        new URL(request.url()).pathname === "/api/v1/documents"
          ? { documents: document ? [document] : [] }
          : document,
    });
  });
  await context.route("**/api/v1/chat", async (route) => {
    const body = route.request().postDataJSON();
    requests.push({
      phase: "fixture",
      endpoint: "chat",
      model: body.model,
      session: body.chatSessionId,
    });
    chatCount++;
    if (chatCount === 1) {
      firstBody = body;
      await firstGate.promise;
    }
    if (body.message === "Check selected model rejection")
      return route.fulfill({
        status: 400,
        json: {
          code: "MODEL_NOT_ALLOWED",
          detail: "Choose a model from the available model list.",
        },
      });
    return route.fulfill({
      json: answer(
        body.model,
        `${alias}: ${body.message}. Source attachment ${marker}.`,
      ),
    });
  });
  await context.route("**/api/v1/briefings", async (route) => {
    briefingBody = route.request().postDataJSON();
    requests.push({
      phase: "fixture",
      endpoint: "briefings",
      model: briefingBody.model,
      session: briefingBody.chatSessionId,
    });
    await briefGate.promise;
    return route.fulfill({
      json: {
        id: "fixture-briefing-472",
        mode: "provider-grounded",
        model: briefingBody.model,
        sections: [],
        sources: [],
        generatedAt: "2026-09-19T12:00:00Z",
        assistantResponse: answer(
          briefingBody.model,
          `${alias}: BRIEFING_ACTION_472 confirm the liquidity requirement before reviewing the allocation gap.`,
        ),
      },
    });
  });
  try {
    await login(page);
    await expect(page.locator("#workspace-analysis-model")).toHaveValue(modelA);
    const portfolioId = await page.locator("#portfolio-select").inputValue();
    const clientId = await page.locator("#client-select").inputValue();
    alias = await page.locator("#client-select option:checked").innerText();
    await openChat(page);
    await page
      .getByRole("button", { name: "Attach files", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Document library",
      exact: true,
    });
    await dialog.locator('input[type="file"]').setInputFiles({
      name: "model-context.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(marker),
    });
    await expect(
      dialog.getByRole("button", { name: "Add files", exact: true }),
    ).toBeEnabled({ timeout: 30000 });
    await expect(
      dialog
        .locator('[class*="fileGrid"] button')
        .filter({ hasText: "model-context.txt" }),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    const observed = page.waitForRequest((request) => isPost(request, "chat"));
    await page
      .locator("#companion-message")
      .fill("Remember the source allocation");
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    await observed;
    await expect(page.locator("#chat-analysis-model")).toBeEnabled();
    await page.locator("#chat-analysis-model").selectOption(modelB);
    await expect(page.locator("#workspace-analysis-model")).toHaveValue(modelB);
    assert.equal(firstBody.model, modelA);
    assert.equal(firstBody.chatSessionId, document.chatSessionId);
    const firstResponse = page.waitForResponse((response) =>
      isPost(response.request(), "chat"),
    );
    firstGate.resolve();
    assert.equal((await firstResponse).status(), 200);
    await expect(
      page
        .locator('article[class*="assistantMessage"]')
        .last()
        .getByText(modelA, { exact: true }),
    ).toBeVisible();
    await expect(page.locator("#portfolio-select")).toHaveValue(portfolioId);
    await expect(page.locator("#client-select")).toHaveValue(clientId);
    check(
      "fixture: switching while a response is pending preserves its captured model, session, portfolio and result",
    );
    const second = await send(page, "Continue using that source allocation");
    assert.equal(second.request.model, modelB);
    assert.equal(second.request.chatSessionId, firstBody.chatSessionId);
    assert.ok(
      second.request.history.some((turn) =>
        turn.content.includes("Remember the source allocation"),
      ),
    );
    await page
      .getByRole("button", { name: "Attach files", exact: true })
      .click();
    await expect(
      dialog
        .locator('[class*="fileGrid"] button')
        .filter({ hasText: "model-context.txt" }),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    check(
      "fixture: the next model receives prior conversation while the same chat attachment remains available",
    );
    const rejected = page.waitForResponse((response) =>
      isPost(response.request(), "chat"),
    );
    await page
      .locator("#companion-message")
      .fill("Check selected model rejection");
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    assert.equal((await rejected).status(), 400);
    await expect(
      page.getByRole("alert").filter({ hasText: "This model is unavailable" }),
    ).toBeVisible();
    assert.equal(chatCount, 3);
    await expect(page.locator("#chat-analysis-model")).toHaveValue(modelB);
    check(
      "fixture: a rejected selected model produces an explicit error without default-model retry or context reset",
    );
    const briefObserved = page.waitForRequest((request) =>
      isPost(request, "briefings"),
    );
    await page
      .getByRole("button", { name: "Generate briefing", exact: true })
      .first()
      .click();
    const capturedBrief = (await briefObserved).postDataJSON();
    assert.equal(capturedBrief.model, modelB);
    assert.equal(capturedBrief.chatSessionId, firstBody.chatSessionId);
    assert.ok(
      capturedBrief.history.some((turn) =>
        turn.content.includes("Remember the source allocation"),
      ),
    );
    await page.locator("#briefing-analysis-model").selectOption(modelA);
    const briefResponse = page.waitForResponse((response) =>
      isPost(response.request(), "briefings"),
    );
    briefGate.resolve();
    assert.equal((await briefResponse).status(), 200);
    await expect(page.getByText(/BRIEFING_ACTION_472/).first()).toBeVisible();
    await openChat(page);
    const followup = await send(page, "Explain the action from the briefing");
    assert.equal(followup.request.model, modelA);
    assert.equal(followup.request.chatSessionId, firstBody.chatSessionId);
    assert.equal(
      followup.request.history.filter((turn) =>
        turn.content.includes("BRIEFING_ACTION_472"),
      ).length,
      1,
    );
    check(
      "fixture: briefing captures the selected model and conversation, then its structured action survives the next model switch exactly once",
    );
    await locales(page);
    await mobile(page, "fixture-mobile-models");
    check(
      "fixture: model controls support EN, ES, DE, FR and fit mobile width",
    );
  } catch (error) {
    await page.screenshot({
      path: `${output}/fixture-failure.png`,
      fullPage: true,
    });
    throw error;
  } finally {
    firstGate.resolve();
    briefGate.resolve();
    await context.close();
  }
}

async function live() {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  try {
    await login(page);
    const response = await context.request.get(`${base}/api/v1/ai/models`);
    assert.equal(response.status(), 200);
    const catalogue = await response.json();
    const modelA = process.env.QA_MODEL_A ?? catalogue.defaultModel;
    const modelB =
      process.env.QA_MODEL_B ??
      catalogue.models.find((model) => model.id !== modelA)?.id;
    assert.ok(
      modelB &&
        catalogue.models.some((model) => model.id === modelA) &&
        catalogue.models.some((model) => model.id === modelB),
      "Two configured models are required",
    );
    await openChat(page);
    const alias = await page
      .locator("#client-select option:checked")
      .innerText();
    const portfolioId = await page.locator("#portfolio-select").inputValue();
    await page.locator("#chat-analysis-model").selectOption(modelA);
    let started = Date.now();
    const first = await send(
      page,
      "Give a compact overview of the selected client and portfolio. Include their on-screen names and the source portfolio value.",
    );
    requests.push({
      phase: "live",
      endpoint: "chat",
      model: first.body.model,
      durationMs: Date.now() - started,
    });
    assert.equal(first.body.model, modelA);
    assert.ok(JSON.stringify(first.body).includes(alias));
    await page.locator("#chat-analysis-model").selectOption(modelB);
    started = Date.now();
    const second = await send(
      page,
      "Continue our conversation: briefly compare the current allocation with its mandate. Keep the selected client and portfolio names.",
    );
    requests.push({
      phase: "live",
      endpoint: "chat",
      model: second.body.model,
      durationMs: Date.now() - started,
    });
    assert.equal(second.body.model, modelB);
    assert.equal(second.request.chatSessionId, first.request.chatSessionId);
    assert.equal(second.request.portfolioId, portfolioId);
    assert.ok(
      second.request.history.some((turn) =>
        turn.content.includes("compact overview"),
      ),
    );
    assert.ok(JSON.stringify(second.body).includes(alias));
    await expect(
      page
        .locator('article[class*="assistantMessage"]')
        .last()
        .getByText(modelB, { exact: true }),
    ).toBeVisible();
    check(
      "live: two configured models answer in the same conversation with the selected client, portfolio, prior history and actual model metadata",
    );
    const pending = page.waitForResponse(
      (response) => isPost(response.request(), "briefings"),
      { timeout: 130000 },
    );
    started = Date.now();
    await page
      .getByRole("button", { name: "Generate briefing", exact: true })
      .first()
      .click();
    const briefResponse = await pending;
    const brief = await briefResponse.json();
    assert.equal(briefResponse.status(), 200, JSON.stringify(brief));
    assert.equal(brief.assistantResponse?.model ?? brief.model, modelB);
    assert.equal(
      briefResponse.request().postDataJSON().chatSessionId,
      first.request.chatSessionId,
    );
    requests.push({
      phase: "live",
      endpoint: "briefings",
      model: brief.assistantResponse?.model ?? brief.model,
      durationMs: Date.now() - started,
    });
    await openChat(page);
    await expect(
      page.locator('article[class*="assistantMessage"]'),
    ).toHaveCount(3);
    await page.locator("#chat-analysis-model").selectOption(modelA);
    started = Date.now();
    const followup = await send(
      page,
      "Explain one action from the briefing we just generated, using the same client and portfolio context.",
    );
    requests.push({
      phase: "live",
      endpoint: "chat",
      model: followup.body.model,
      durationMs: Date.now() - started,
    });
    assert.equal(followup.body.model, modelA);
    assert.equal(followup.request.chatSessionId, first.request.chatSessionId);
    assert.ok(
      followup.request.history.some((turn) =>
        turn.content.includes(brief.assistantResponse.text.slice(0, 120)),
      ),
    );
    assert.ok(JSON.stringify(followup.body).includes(alias));
    check(
      "live: generated briefing uses the shared choice and its actions remain in the next model's conversation context",
    );
    await locales(page);
    await mobile(page, "live-mobile-models");
    check("live: model selection supports EN, ES, DE, FR and mobile layout");
  } catch (error) {
    await page.screenshot({
      path: `${output}/live-failure.png`,
      fullPage: true,
    });
    throw error;
  } finally {
    await context.close();
  }
}

try {
  if (phases.includes("fixture")) await fixture();
  if (phases.includes("live")) await live();
  assert.deepEqual(errors, []);
  check("no browser errors");
  completed = true;
} catch (error) {
  failure = error.stack;
  throw error;
} finally {
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ completed, failure, checks, errors, requests }, null, 2),
  );
  await browser.close();
}
