import assert from "node:assert/strict";

export async function verifySelectionStability(page, check) {
  const initial = await page.locator("#portfolio-select").inputValue();
  await page
    .locator("#client-select")
    .selectOption(await page.locator("#client-select").inputValue());
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  assert.equal(await page.locator("#portfolio-select").inputValue(), initial);
  await page.locator("#portfolio-select").selectOption(initial);
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  check("reselecting current client or portfolio preserves loaded context");

  const selected = await page.locator("#client-select").inputValue();
  const alternative = await page
    .locator("#client-select option")
    .evaluateAll(
      (options, current) =>
        options.find((option) => option.value !== current).value,
      selected,
    );
  const pending = page.waitForRequest((request) =>
    new URL(request.url()).pathname.startsWith("/api/v1/portfolios/"),
  );
  await page.locator("#client-select").selectOption(alternative);
  await pending;
  const next = await page.locator("#portfolio-select").inputValue();
  await page.locator("#portfolio-select").selectOption(next);
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  await page.locator("#client-select").selectOption(selected);
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  assert.equal(await page.locator("#portfolio-select").inputValue(), initial);
  check(
    "immediate portfolio selection during client change settles with fresh data",
  );
}
