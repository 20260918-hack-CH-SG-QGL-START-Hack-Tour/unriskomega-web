import assert from "node:assert/strict";

export async function verifyLiveImage(page, check, shot) {
  const selected = await page.evaluate(() => ({
    client: document.querySelector("#client-select option:checked").textContent,
    portfolio: document.querySelector("#portfolio-select option:checked")
      .textContent,
  }));
  await page.getByRole("button", { name: "Create image", exact: true }).click();
  await page
    .getByLabel("Ask about this portfolio", { exact: true })
    .fill(
      "/image Generate a clear visual briefing for this selected client and portfolio: illustrate its main allocation themes and questions for an advisor review. Use the selected aliases and qualitative labels; keep exact values in the accompanying source facts.",
    );
  const pending = page.waitForResponse(
    (response) =>
      response.url().endsWith("/images") &&
      response.request().method() === "POST",
    { timeout: 120000 },
  );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  const response = await pending;
  assert.equal(response.status(), 200);
  const result = await response.json();
  assert.equal(result.illustrative, true);
  assert.equal(result.briefing.selectedClient, selected.client);
  assert.equal(result.briefing.selectedPortfolio, selected.portfolio);
  assert.ok(result.briefing.facts.length > 0);
  const inline = page.getByAltText("AI-generated illustration", {
    exact: true,
  });
  await inline.waitFor({ timeout: 120000 });
  await page.waitForFunction(() =>
    Array.from(document.images)
      .filter((image) => image.alt === "AI-generated illustration")
      .every((image) => image.complete && image.naturalWidth > 0),
  );
  assert.ok((await inline.boundingBox()).height <= 320);
  await shot("workspace-image");
  await page
    .getByRole("button", { name: "Open image preview", exact: true })
    .click();
  const modal = page.getByRole("dialog", {
    name: "AI-generated illustration",
    exact: true,
  });
  assert.equal(await modal.isVisible(), true);
  assert.match(
    await modal
      .getByRole("link", { name: "Download image", exact: true })
      .getAttribute("download"),
    /\.png$/,
  );
  await shot("workspace-image-preview");
  await modal.press("Escape");
  assert.equal(await modal.isVisible(), false);
  check(
    "actual selected-portfolio image generation, bounded preview and download",
  );
}
