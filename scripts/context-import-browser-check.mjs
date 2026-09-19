import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const base = process.env.QA_BASE_URL;
if (!base) throw new Error("QA_BASE_URL is required");
const sampleDir = process.env.QA_SAMPLE_DIR;
if (!sampleDir) throw new Error("QA_SAMPLE_DIR is required");
const output =
  process.env.QA_OUTPUT_DIR ?? "/tmp/unriskomega-context-import-browser";
await mkdir(output, { recursive: true });
const checks = [],
  errors = [];
const browser = await chromium.launch({
  executablePath: process.env.QA_CHROMIUM_PATH,
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
let completed = false,
  failure;
const attempts = [];
const check = (name) => {
  checks.push(name);
  console.log(`PASS ${name}`);
};
try {
  await page.goto(`${base}/login`);
  await page
    .getByRole("button", { name: "Demo advisor account", exact: true })
    .click();
  await page.waitForURL("**/workspace");
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  const initialClient = await page.locator("#client-select").inputValue();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  const library = page
    .locator("section")
    .filter({
      has: page.getByRole("heading", { name: "Document library", exact: true }),
    })
    .filter({ visible: true })
    .last();
  assert.ok(
    (await library.getAttribute("class")).split(/\s+/).length >= 2,
    "The server must serve the final composed library styles before provider tests run.",
  );
  const input = library.locator('input[type="file"]');
  assert.equal(await input.getAttribute("multiple"), "");
  const names = [
    "Quartalsreporting_Q4_2025_11_Frau_Sandra_Lehmann.pdf",
    "Quartalsreporting_Q4_2025_12_Herr_Marco_Bianchi.pdf",
    "Quartalsreporting_Q4_2025_13_Stiftung_Alpenblick.pdf",
    "uro-portfolio-briefing-test-clients/test-clients-belfort.json",
    "uro-portfolio-briefing-test-clients/test-clients-bond.json",
    "uro-portfolio-briefing-test-clients/test-clients-dude.json",
  ];
  const uploaded = [];
  const started = new WeakMap();
  page.on("request", (request) => {
    if (
      request.url().endsWith("/api/v1/documents") &&
      request.method() === "POST"
    )
      started.set(request, Date.now());
  });
  page.on("response", async (response) => {
    if (
      response.url().endsWith("/api/v1/documents") &&
      response.request().method() === "POST"
    ) {
      console.log(
        `UPLOAD ${response.request().postDataJSON().filename}: HTTP ${response.status()}`,
      );
      attempts.push({
        filename: response.request().postDataJSON().filename,
        status: response.status(),
        durationMs:
          Date.now() - (started.get(response.request()) ?? Date.now()),
      });
      uploaded.push({
        status: response.status(),
        body: await response.json(),
        filename: response.request().postDataJSON().filename,
      });
    }
  });
  await input.setInputFiles(names.map((name) => resolve(sampleDir, name)));
  const results = library.getByRole("region", { name: "Upload results" });
  await page.waitForFunction(
    () => {
      const items = [
        ...document.querySelectorAll('section[aria-label="Upload results"] li'),
      ];
      return (
        items.length === 6 &&
        items.every((item) =>
          ["saved", "review", "imported", "failed"].includes(
            item.getAttribute("data-state"),
          ),
        )
      );
    },
    undefined,
    { timeout: 240000 },
  );
  await expect(
    library.getByRole("button", { name: "Add files", exact: true }),
  ).toBeEnabled({ timeout: 30000 });
  const failedFiles = await results
    .locator('li[data-state="failed"] strong')
    .allTextContents();
  for (const filename of failedFiles) {
    const row = results.locator("li").filter({ hasText: filename });
    console.log(`RETRY ${filename}`);
    await row.getByRole("button", { name: "Retry", exact: true }).click();
    await expect(
      library.getByRole("button", { name: "Add files", exact: true }),
    ).toBeEnabled({ timeout: 180000 });
    await expect(row).not.toHaveAttribute(
      "data-state",
      /queued|reading|uploading/,
      { timeout: 180000 },
    );
  }
  if (failedFiles.length)
    check(
      "failed PDF uploads recover through their individual Retry buttons without discarding successful files",
    );
  assert.equal(
    await results.locator('li[data-state="failed"]').count(),
    0,
    await results.innerText(),
  );
  assert.equal(await results.locator('li[data-state="review"]').count(), 3);
  assert.equal(await results.locator('li[data-state="imported"]').count(), 3);
  assert.ok(uploaded.length >= 6);
  for (const name of names) {
    const filename = name.split("/").at(-1);
    assert.equal(
      uploaded.findLast((result) => result.filename === filename)?.status,
      200,
      filename,
    );
  }
  await expect(
    library.getByRole("button", { name: "Add files", exact: true }),
  ).toBeEnabled({ timeout: 30000 });
  await expect(
    library.locator('[class*="fileGrid"] button').first(),
  ).toBeVisible();
  assert.ok((await library.locator('[class*="fileGrid"] button').count()) >= 3);
  await expect(
    library.getByText("Extracting and saving…", { exact: true }),
  ).toBeHidden();
  check(
    "all six supplied PDF/JSON files complete, persisted library cards appear, and upload actions become available",
  );
  await page.screenshot({
    path: `${output}/batch-results.png`,
    fullPage: true,
  });
  const bondRow = results
    .locator("li")
    .filter({ hasText: "test-clients-bond.json" });
  const bond = uploaded.find(
    (result) => result.filename === "test-clients-bond.json",
  )?.body;
  assert.ok(bond);
  await bondRow
    .getByRole("button", { name: "Open imported portfolio" })
    .click();
  await page.getByText("Holdings", { exact: true }).first().waitFor();
  await page.waitForFunction(
    (selection) =>
      document.querySelector("#client-select")?.value === selection.clientId &&
      document.querySelector("#portfolio-select")?.value ===
        selection.portfolioId,
    { clientId: bond.clientId, portfolioId: bond.portfolioId },
  );
  const clientId = await page.locator("#client-select").inputValue();
  const portfolioId = await page.locator("#portfolio-select").inputValue();
  if (bond) {
    assert.equal(clientId, bond.clientId);
    assert.equal(portfolioId, bond.portfolioId);
  }
  const actual = await context.request.get(
    `${base}/api/v1/portfolios/${encodeURIComponent(portfolioId)}`,
  );
  const portfolio = await actual.json();
  assert.equal(actual.status(), 200);
  assert.ok(portfolio.holdings.length > 0);
  await page
    .getByText(portfolio.holdings[0].name, { exact: true })
    .first()
    .waitFor();
  check(
    "opening JSON result selects its own client and exact persisted portfolio holdings",
  );
  await page
    .getByRole("button", { name: "AI companion", exact: false })
    .first()
    .click();
  const composer = page.locator("#companion-message");
  async function ask(message) {
    const pending = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/v1/chat") && r.request().method() === "POST",
      { timeout: 120000 },
    );
    await composer.fill(message);
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    const response = await pending;
    assert.equal(response.status(), 200, await response.text());
    const body = await response.json();
    await composer.fill("");
    return { body, request: response.request().postDataJSON() };
  }
  const first = await ask(
    "Give me an overview of this client and portfolio, with its largest positions and allocation gaps.",
  );
  assert.equal(first.request.portfolioId, portfolioId);
  assert.deepEqual(first.request.history, []);
  const second = await ask(
    "So what share do we sell and what do we buy to get the allocation right?",
  );
  assert.equal(second.request.chatSessionId, first.request.chatSessionId);
  assert.ok(
    second.request.history.some((turn) =>
      turn.content.includes("Give me an overview"),
    ),
  );
  if (first.body.components.length)
    assert.ok(
      second.request.history.some((turn) =>
        turn.content.includes("Previously displayed visuals"),
      ),
    );
  assert.ok(second.body.components.length > 0);
  check(
    "real follow-up request retains selected portfolio and prior visual context and returns generative components",
  );
  await page.getByRole("button", { name: "Attach files", exact: true }).click();
  const dialog = page.getByRole("dialog", {
    name: "Document library",
    exact: true,
  });
  await dialog.locator('input[type="file"]').setInputFiles({
    name: "conversation-context-check.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(
      "Advisor meeting note: discuss allocation gaps against the selected mandate.",
    ),
  });
  await dialog.locator('li[data-state="saved"]').waitFor({ timeout: 120000 });
  await dialog
    .getByText("Extracting and saving…", { exact: true })
    .waitFor({ state: "hidden" });
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  const third = await ask(
    "Show the allocation gaps we just discussed as a chart.",
  );
  assert.equal(third.request.chatSessionId, first.request.chatSessionId);
  assert.ok(third.request.history.length >= 4);
  check(
    "single attachment refresh preserves the same chat session and existing conversation",
  );
  if (process.env.QA_IMAGE === "true") {
    const pending = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/v1/images") && r.request().method() === "POST",
      { timeout: 180000 },
    );
    await composer.fill(
      "/image Explain this portfolio's allocation gaps with a conceptual illustration using our conversation.",
    );
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    const response = await pending;
    assert.equal(response.status(), 200, await response.text());
    const request = response.request().postDataJSON();
    assert.equal(request.chatSessionId, first.request.chatSessionId);
    assert.equal(request.portfolioId, portfolioId);
    assert.ok(
      request.history.some((turn) => turn.content.includes("allocation gaps")),
    );
    check(
      "real image generation receives the same selected portfolio and conversation context",
    );
  }
  await page.locator("#client-select").selectOption(initialClient);
  await page.locator("#companion-message").waitFor();
  const switched = await ask(
    "Which client and portfolio are selected and what is the portfolio value?",
  );
  assert.notEqual(switched.request.portfolioId, portfolioId);
  assert.notEqual(switched.request.chatSessionId, first.request.chatSessionId);
  assert.deepEqual(switched.request.history, []);
  check(
    "switching account starts a fresh scoped chat without previous-client conversation",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: `${output}/mobile-context.png`,
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  check("updated workspace fits mobile width without browser errors");
  completed = true;
} catch (error) {
  failure = error.stack;
  await page.screenshot({ path: `${output}/failure.png`, fullPage: true });
  throw error;
} finally {
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ completed, checks, errors, failure, attempts }, null, 2),
  );
  await browser.close();
}
