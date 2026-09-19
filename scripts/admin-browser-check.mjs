import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { checkDeck } from "./admin-deck-qa.mjs";
import { checkGraph, checkOntology } from "./admin-graph-qa.mjs";

const base = process.env.QA_BASE_URL ?? "http://localhost:3110";
const output = process.env.QA_OUTPUT_DIR ?? "/tmp/unriskomega-admin-qa";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.QA_CHROMIUM_PATH,
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const checks = [],
  errors = [];
let completed = false;
let failure = null;
page.on("pageerror", (error) => errors.push(error.message));
const check = (name) => {
  checks.push(name);
  console.log(`PASS ${name}`);
};
async function screenshot(name) {
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
}
async function noOverflow() {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
}
try {
  await page.goto(`${base}/ai/overview`);
  await page.waitForURL("**/login");
  check("unauthenticated admin navigation returns to login");
  const response = await context.request.post(`${base}/api/v1/auth/demo`, {
    headers: { Origin: base },
    data: {},
  });
  assert.equal(response.status(), 200);
  const catalog = await (
    await context.request.get(`${base}/api/v1/admin/catalog`)
  ).json();
  assert.ok(catalog.counts.clients >= 47 && catalog.counts.portfolios >= 57);
  await page.goto(`${base}/ai/overview`);
  await page.getByRole("heading", { name: "Overview", exact: true }).waitFor();
  await page
    .getByText(String(catalog.counts.holdings), { exact: true })
    .waitFor();
  await screenshot("admin-overview-en-light");
  check("real source-backed overview counts");
  await page
    .getByRole("link", { name: "Datasets", exact: true })
    .first()
    .click();
  await page.getByLabel("Search datasets").fill("FundUnbundlingMappings");
  await page
    .getByRole("heading", { name: "FundUnbundlingMappings", exact: true })
    .waitFor();
  await page.getByRole("link", { name: /FundUnbundlingMappings/ }).click();
  await page
    .getByRole("cell", { name: "FundSecurityId", exact: true })
    .waitFor();
  await screenshot("admin-structure");
  check("dataset search and field explorer inspect actual source schema");
  await page
    .getByRole("link", { name: "Knowledge graph", exact: true })
    .click();
  await checkGraph(page, screenshot, check);
  for (const [route, heading] of [
    ["ontology", "Ontology"],
    ["agents", "Agents"],
    ["skills", "Skills"],
    ["runtime", "Runtime"],
  ]) {
    await page.goto(`${base}/ai/${route}`);
    await page
      .getByRole("heading", { name: heading, exact: true })
      .first()
      .waitFor();
    await page
      .getByText("Loading inspection data…", { exact: true })
      .waitFor({ state: "hidden" });
    await noOverflow();
    await screenshot(`admin-${route}`);
    if (route === "ontology") await checkOntology(page, screenshot, check);
  }
  check("all admin routes render without overflow");
  await page.goto(`${base}/ai/overview`);
  for (const [locale, heading] of [
    ["es", "Resumen"],
    ["de", "Übersicht"],
    ["fr", "Vue d’ensemble"],
    ["en", "Overview"],
  ]) {
    await page.locator("header select").selectOption(locale);
    await page.getByRole("heading", { name: heading, exact: true }).waitFor();
    await screenshot(`admin-${locale}`);
  }
  check("admin interface supports EN ES DE FR");
  await page.getByRole("button", { name: "Dark mode", exact: true }).click();
  await screenshot("admin-dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow();
  await screenshot("admin-mobile");
  check("dark theme and mobile reflow");
  await page.getByRole("link", { name: "Advisor view", exact: true }).click();
  await page.waitForURL("**/workspace");
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  check("view switch preserves authenticated advisor workspace");
  await page.goto(`${base}/ai/overview`);
  await page
    .getByText(String(catalog.counts.holdings), { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL("**/login");
  assert.equal(
    (await context.request.get(`${base}/api/v1/admin/catalog`)).status(),
    401,
  );
  await page.goto(`${base}/ai/overview`);
  await page.waitForURL("**/login");
  check("logout clears admin data and invalidates the shared session");
  const unknown = await page.goto(`${base}/ai/delete-database`);
  assert.equal(unknown.status(), 404);
  check("unknown admin route returns 404");
  await checkDeck(page, base, output, screenshot, check);
  assert.deepEqual(errors, []);
  completed = true;
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  await screenshot("failure");
  throw error;
} finally {
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ base, completed, failure, checks, errors }, null, 2),
  );
  await browser.close();
}
