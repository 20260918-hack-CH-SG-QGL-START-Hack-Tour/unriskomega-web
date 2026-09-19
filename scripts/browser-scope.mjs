import assert from "node:assert/strict";

export async function verifyClientSwitchIsolation(page) {
  const options = page.locator("#client-select option");
  if ((await options.count()) < 3) return false;
  const nextClient = await options.nth(2).getAttribute("value");
  await page.evaluate((clientId) => {
    const originalFetch = window.fetch;
    const probe = { oldReady: false, nextReady: false, oldDelivered: false };
    let releaseOld,
      releaseNext,
      oldClaimed = false;
    const oldGate = new Promise((resolve) => {
      releaseOld = resolve;
    });
    const nextGate = new Promise((resolve) => {
      releaseNext = resolve;
    });
    // Delay actual responses without taking ownership of Playwright routes.
    // Response bodies, headers and credentials remain untouched and unlogged.
    window.fetch = async (...args) => {
      const input = args[0];
      const url = new URL(
        input instanceof Request ? input.url : input,
        location.origin,
      );
      const oldDetail =
        !oldClaimed && /^\/api\/v1\/portfolios\/[^/]+$/.test(url.pathname);
      if (oldDetail) oldClaimed = true;
      const nextList =
        url.pathname === "/api/v1/portfolios" &&
        url.searchParams.get("clientId") === clientId;
      const response = await originalFetch.apply(window, args);
      if (oldDetail) {
        probe.oldReady = true;
        await oldGate;
        probe.oldDelivered = true;
      }
      if (nextList) {
        probe.nextReady = true;
        await nextGate;
      }
      return response;
    };
    probe.releaseOld = releaseOld;
    probe.releaseNext = releaseNext;
    probe.restore = () => {
      window.fetch = originalFetch;
      releaseOld();
      releaseNext();
    };
    window.__uroScopeQa = probe;
  }, nextClient);
  try {
    await page.locator("#client-select").selectOption({ index: 1 });
    await page.waitForFunction(() => window.__uroScopeQa.oldReady, undefined, {
      timeout: 10000,
    });
    await page.locator("#client-select").selectOption({ index: 2 });
    await page.waitForFunction(() => window.__uroScopeQa.nextReady, undefined, {
      timeout: 10000,
    });
    await page.evaluate(() => window.__uroScopeQa.releaseOld());
    await page.waitForFunction(() => window.__uroScopeQa.oldDelivered);
    await page.waitForTimeout(150);
    assert.equal(
      await page.getByText("Portfolio value", { exact: true }).count(),
      0,
      "Old portfolio facts must remain cleared while new client scope loads",
    );
    await page.evaluate(() => window.__uroScopeQa.releaseNext());
    await page.getByText("Portfolio value", { exact: true }).waitFor();
    await page
      .getByText("The portfolio tells a story. Bring it into focus.")
      .waitFor();
    return true;
  } finally {
    await page.evaluate(() => {
      window.__uroScopeQa?.restore();
      delete window.__uroScopeQa;
    });
  }
}
