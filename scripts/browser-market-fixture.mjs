import assert from "node:assert/strict";
import { expect } from "@playwright/test";

export async function verifyMarketSourcesUi(page, check) {
  const source = { status: "available", retrievedAt: "2026-09-19T11:00:00Z" };
  const fixture = {
    marketNews: {
      ...source,
      sourceName: "BBC Business",
      sourceUrl: "https://feeds.bbci.co.uk/news/business/rss.xml",
      items: [
        {
          title: "Fixture public headline",
          summary: "General business news",
          publishedAt: "2026-09-18T17:57:30Z",
          url: "https://www.bbc.com/news/articles/fixture",
        },
        {
          title: "<script>window.marketInjected=true</script>",
          summary: "Inert source text",
          publishedAt: "2026-09-18T17:57:30Z",
          url: "javascript:alert(1)",
        },
      ],
    },
    houseView: {
      ...source,
      sourceName: "J.P. Morgan Asset Management",
      sourceUrl: "https://am.jpmorgan.com/us/en/asset-management/adv/insights/",
      title: "Public source fixture",
      sourceDateLabel: "June 30, 2026",
      points: ["A dated public outlook, not an internal mandate."],
    },
  };
  await page.route("**/api/v1/market-context", (route) =>
    route.fulfill({ json: fixture }),
  );
  try {
    await page.getByRole("button", { name: "Evidence", exact: true }).click();
    const panel = page.getByRole("region", {
      name: "Market sources",
      exact: true,
    });
    await expect(panel.getByText("Available", { exact: true })).toHaveCount(2);
    await expect(panel).toContainText("Publisher’s data date: June 30, 2026");
    await expect(panel).toContainText(
      "A public external bank perspective, not your bank’s internal CIO policy or a client mandate.",
    );
    await expect(
      panel.getByRole("link", { name: "Fixture public headline", exact: true }),
    ).toHaveAttribute("href", /^https:\/\//);
    await expect(
      panel.getByRole("link", { name: "Read source", exact: true }),
    ).toHaveAttribute("rel", "noopener noreferrer");
    assert.equal(await panel.locator('a[href^="javascript:"]').count(), 0);
    assert.equal(await panel.locator("script").count(), 0);
    assert.equal(await page.evaluate(() => window.marketInjected), undefined);
    fixture.marketNews.status = "unavailable";
    fixture.houseView.status = "disabled";
    await page.getByRole("button", { name: "Overview", exact: true }).click();
    await expect(
      page
        .getByRole("region", { name: "Market sources", exact: true })
        .getByText("Unavailable", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Market sources", exact: true })
        .getByText("Disabled", { exact: true }),
    ).toBeVisible();
    check(
      "fixture public sources: availability, publisher date, external bank scope, safe HTTPS links and inert excerpts",
    );
  } finally {
    await page.unroute("**/api/v1/market-context");
    await page
      .getByRole("button", { name: "AI companion", exact: false })
      .first()
      .click();
  }
}
