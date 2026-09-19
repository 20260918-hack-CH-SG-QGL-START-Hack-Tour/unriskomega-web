import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const base = process.env.QA_BASE_URL;
if (!base) throw new Error("QA_BASE_URL is required");
const output = process.env.QA_OUTPUT_DIR ?? "/tmp/unriskomega-documents-qa";
const fixture =
  process.env.QA_PDF_PATH ??
  fileURLToPath(new URL("./fixtures/custody-statement.pdf", import.meta.url));
await mkdir(output, { recursive: true });
const checks = [],
  errors = [];
let browser,
  completed = false,
  failure = null;
try {
  browser = await chromium.launch({
    executablePath: process.env.QA_CHROMIUM_PATH,
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  const check = (name) => {
    checks.push(name);
    console.log(`PASS ${name}`);
  };
  await page.goto(`${base}/login`);
  await page
    .getByRole("button", { name: "Demo advisor account", exact: true })
    .click();
  await page.waitForURL("**/workspace");
  await page.locator("#client-select").selectOption({ label: "Client 28" });
  await page
    .locator("#portfolio-select")
    .selectOption({ label: "Portfolio 01" });
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  const nativeId = await page.locator("#portfolio-select").inputValue();
  const nativeName = await page
    .locator("#portfolio-select option:checked")
    .textContent();
  const clientId = await page.locator("#client-select").inputValue();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  const library = page
    .locator("section")
    .filter({
      has: page.getByRole("heading", { name: "Document library", exact: true }),
    })
    .filter({ visible: true })
    .last();
  await library
    .getByRole("heading", { name: "Document library", exact: true })
    .waitFor();
  check("visible document library for selected client");
  await library.getByLabel("Save to", { exact: true }).selectOption("client");
  await library
    .getByLabel("Document type", { exact: true })
    .selectOption("custody");
  const pending = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/v1/documents") && r.request().method() === "POST",
    { timeout: 120000 },
  );
  await library.locator('input[type="file"]').setInputFiles(fixture);
  const upload = await pending;
  assert.equal(upload.status(), 200, await upload.text());
  const document = await upload.json();
  await library
    .getByRole("heading", { name: "Review custody import", exact: true })
    .waitFor({ timeout: 15000 });
  check("actual synthetic PDF extraction loads complete editable review");
  await page.screenshot({
    path: `${output}/custody-review.png`,
    fullPage: true,
  });
  assert.equal(
    await library
      .getByRole("button", { name: "Create virtual portfolio", exact: true })
      .isEnabled(),
    false,
  );
  check("import requires advisor review");
  const portfolioName = `External custody · browser ${document.id.slice(0, 8)}`;
  await library
    .getByLabel("Portfolio name", { exact: true })
    .fill(portfolioName);
  await library
    .getByLabel(
      "I reviewed the holdings, reporting currency and statement total against the original document.",
    )
    .check();
  const imported = page.waitForResponse(
    (r) => r.url().endsWith("/import") && r.request().method() === "POST",
    { timeout: 30000 },
  );
  await library
    .getByRole("button", { name: "Create virtual portfolio", exact: true })
    .click();
  const importedResponse = await imported;
  assert.equal(importedResponse.status(), 200, await importedResponse.text());
  const portfolio = await importedResponse.json();
  assert.equal(portfolio.virtual, true);
  assert.equal(Number(portfolio.aum), 1000);
  assert.equal(portfolio.holdings.length, 1);
  assert.equal(portfolio.sourceDocumentId, document.id);
  await page.waitForFunction(
    (id) => document.querySelector("#portfolio-select")?.value === id,
    portfolio.id,
  );
  await page
    .getByText("Example Global Equity", { exact: true })
    .first()
    .waitFor();
  check(
    "reviewed import becomes selected native portfolio with exact holdings and source",
  );
  await page.screenshot({
    path: `${output}/virtual-portfolio.png`,
    fullPage: true,
  });
  await page.reload();
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  await page.locator("#client-select").selectOption({ label: "Client 28" });
  await page.locator("#portfolio-select").selectOption(portfolio.id);
  await page
    .getByText("Example Global Equity", { exact: true })
    .first()
    .waitFor();
  check("import persists across page reload");
  await page
    .getByRole("button", { name: "AI companion", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Attach files", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Document library", exact: true })
    .waitFor();
  check("chat exposes its attachment library");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.screenshot({
    path: `${output}/chat-with-context.png`,
    fullPage: true,
  });
  const content = await context.request.get(
    `${base}/api/v1/documents/${document.id}/content`,
  );
  assert.equal(content.status(), 200);
  assert.match(content.headers()["content-type"], /application\/pdf/);
  assert.equal(content.headers()["cache-control"], "no-store");
  const listing = await context.request.get(
    `${base}/api/v1/documents?clientId=${clientId}`,
  );
  const preview = (await listing.json()).documents.find(
    (d) => d.id === document.id,
  );
  assert.equal(preview.extractionComplete, false);
  assert.equal(preview.holdingCount, 1);
  assert.deepEqual(preview.extraction.holdings, []);
  assert.equal(preview.dataBase64, undefined);
  const detail = await context.request.get(
    `${base}/api/v1/documents/${document.id}`,
  );
  const full = await detail.json();
  assert.equal(full.extractionComplete, true);
  assert.equal(full.extraction.holdings.length, 1);
  assert.equal(full.dataBase64, undefined);
  check(
    "bounded library preview and complete selected detail preserve the authenticated original",
  );
  const anonymous = await browser.newContext();
  for (const suffix of ["", "/content"])
    assert.equal(
      (
        await anonymous.request.get(
          `${base}/api/v1/documents/${document.id}${suffix}`,
        )
      ).status(),
      401,
    );
  await anonymous.close();
  check("documents and originals deny unauthenticated access");
  if (process.env.QA_DOCUMENT_BRIEFING === "true") {
    await page.locator("#portfolio-select").selectOption(nativeId);
    await page.getByRole("button", { name: "Overview", exact: true }).click();
    const briefPending = page.waitForResponse(
      (r) => r.url().endsWith("/briefings") && r.request().method() === "POST",
      { timeout: 120000 },
    );
    await page
      .getByRole("button", { name: "Generate briefing", exact: true })
      .first()
      .click();
    const briefResponse = await briefPending;
    assert.equal(briefResponse.status(), 200);
    const brief = await briefResponse.json();
    assert.equal(brief.mode, "verified-provider");
    assert.equal(brief.assistantResponse.outcome.status, "accepted");
    assert.match(brief.summary, /Client 28/);
    assert.ok(brief.summary.includes(nativeName));
    assert.match(brief.summary, /external|custody/i);
    const cited = new Set(brief.assistantResponse.sourceIds);
    assert.ok(
      brief.assistantResponse.evidence.some(
        (e) =>
          cited.has(e.id) &&
          /externalCustodyPortfolios|documents/.test(e.locator),
      ),
    );
    await page.getByText("Grounded generation", { exact: false }).waitFor();
    await page.screenshot({
      path: `${output}/briefing-with-custody.png`,
      fullPage: true,
    });
    check(
      "real verified briefing identifies selected client and native portfolio and cites imported custody evidence",
    );
    await writeFile(
      `${output}/briefing-summary.json`,
      JSON.stringify(
        {
          mode: brief.mode,
          text: brief.summary,
          components: brief.assistantResponse.components.map((c) => c.type),
        },
        null,
        2,
      ),
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  check("workspace and attachments fit mobile width");
  assert.deepEqual(errors, []);
  completed = true;
  await writeFile(
    `${output}/ids.json`,
    JSON.stringify({ docId: document.id, portfolioId: portfolio.id }, null, 2),
  );
} catch (error) {
  failure = error.stack;
  const page = browser?.contexts()[0]?.pages()[0];
  if (page)
    await page.screenshot({ path: `${output}/failure.png`, fullPage: true });
  throw error;
} finally {
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ completed, failure, checks, errors }, null, 2),
  );
  await browser?.close();
}
